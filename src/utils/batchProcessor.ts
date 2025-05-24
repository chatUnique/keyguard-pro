import { 
  BatchKeyItem, 
  BatchStatistics, 
  BatchProcessorConfig, 
  AiProvider, 
  KeyStatus, 
  ApiKeyValidationResult,
  RequestFormat
} from '@/types';
import { AIKeyValidator } from './keyValidator';

/**
 * 批量处理器类 - 处理API Key的批量验证
 */
export class BatchProcessor {
  private static processingController: AbortController | null = null;
  private static isPaused = false;
  private static isProcessing = false;
  private static queue: BatchKeyItem[] = [];
  private static results: BatchKeyItem[] = [];
  private static onProgressCallback: ((progress: BatchStatistics) => void) | null = null;
  private static shouldStop = false;
  private static activePromises: Set<Promise<void>> = new Set();

  /**
   * 默认配置
   */
  private static defaultConfig: BatchProcessorConfig = {
    concurrency: 5,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
  };

  /**
   * 解析批量输入格式
   * 支持多种格式：
   * 1. 纯文本：每行一个Key
   * 2. 服务:Key格式：openai:sk-xxx
   * 3. JSON格式：[{"service": "openai", "key": "sk-xxx"}]
   */
  static parseBatchInput(input: string): BatchKeyItem[] {
    const items: BatchKeyItem[] = [];
    const lines = input.trim().split('\n').filter(line => line.trim());

    if (!lines.length) return items;

    // 尝试解析JSON格式
    if (input.trim().startsWith('[')) {
      try {
        const jsonData = JSON.parse(input);
        if (Array.isArray(jsonData)) {
          return jsonData.map((item, index) => ({
            id: `batch-${Date.now()}-${index}`,
            service: this.parseProvider(item.service || item.provider || 'openai'),
            key: item.key || item.apiKey || '',
            status: KeyStatus.PENDING,
            retryCount: 0,
            createdAt: new Date(),
            customUrl: item.customUrl,
          }));
        }
      } catch (error) {
        console.warn('Failed to parse JSON format, trying line-by-line parsing');
      }
    }

    // 解析行格式
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      let service: AiProvider = AiProvider.OPENAI;
      let key = trimmedLine;
      let customUrl: string | undefined;

      // 检查是否是 service:key 格式
      if (trimmedLine.includes(':')) {
        const parts = trimmedLine.split(':');
        if (parts.length >= 2) {
          const servicePart = parts[0].trim().toLowerCase();
          key = parts.slice(1).join(':').trim(); // 支持Key中包含冒号的情况
          service = this.parseProvider(servicePart);
          
          // 检查是否包含自定义URL（格式：service:key:url）
          if (parts.length >= 3 && service === AiProvider.CUSTOM) {
            customUrl = parts[2].trim();
          }
        }
      }

      if (key) {
        items.push({
          id: `batch-${Date.now()}-${index}`,
          service,
          key,
          status: KeyStatus.PENDING,
          retryCount: 0,
          createdAt: new Date(),
          customUrl,
        });
      }
    });

    return items;
  }

  /**
   * 解析服务提供商名称
   */
  private static parseProvider(input: string): AiProvider {
    const providerMap: Record<string, AiProvider> = {
      'openai': AiProvider.OPENAI,
      'claude': AiProvider.ANTHROPIC,
      'anthropic': AiProvider.ANTHROPIC,
      'gemini': AiProvider.GOOGLE,
      'google': AiProvider.GOOGLE,
      'baidu': AiProvider.BAIDU,
      'wenxin': AiProvider.BAIDU,
      'qwen': AiProvider.QWEN,
      'tongyi': AiProvider.QWEN,
      'doubao': AiProvider.DOUBAO,
      'moonshot': AiProvider.MOONSHOT,
      'kimi': AiProvider.MOONSHOT,
      'zhipu': AiProvider.ZHIPU,
      'glm': AiProvider.ZHIPU,
      'minimax': AiProvider.MINIMAX,
      'azure': AiProvider.AZURE,
      'cohere': AiProvider.COHERE,
      'huggingface': AiProvider.HUGGINGFACE,
      'hf': AiProvider.HUGGINGFACE,
      'custom': AiProvider.CUSTOM,
    };

    return providerMap[input.toLowerCase()] || AiProvider.OPENAI;
  }

  /**
   * 开始批量处理
   */
  static async processBatch(
    items: BatchKeyItem[],
    onProgress: (progress: BatchStatistics) => void,
    onComplete: (results: BatchKeyItem[]) => void,
    config: Partial<BatchProcessorConfig> = {}
  ): Promise<void> {
    if (this.isProcessing) {
      throw new Error('批量处理已在进行中');
    }

    const finalConfig = { ...this.defaultConfig, ...config };
    this.processingController = new AbortController();
    this.isPaused = false;
    this.isProcessing = true;
    this.queue = [...items];
    this.results = [];
    this.onProgressCallback = onProgress;
    this.shouldStop = false;
    this.activePromises.clear();

    try {
      await this.processQueue(finalConfig);
      onComplete(this.results);
    } catch (error) {
      console.error('批量处理过程中发生错误:', error);
      onComplete(this.results);
    } finally {
      this.isProcessing = false;
      this.processingController = null;
      this.onProgressCallback = null;
    }
  }

  /**
   * 处理队列
   */
  private static async processQueue(config: BatchProcessorConfig): Promise<void> {
    const semaphore = new Semaphore(config.concurrency);
    const promises: Promise<void>[] = [];

    for (const item of this.queue) {
      if (this.processingController?.signal.aborted) {
        break;
      }

      const promise = semaphore.acquire().then(async (release) => {
        try {
          await this.processItem(item, config);
        } finally {
          release();
        }
      });

      promises.push(promise);
    }

    await Promise.all(promises);
  }

  /**
   * 处理单个项目
   */
  private static async processItem(item: BatchKeyItem, config: BatchProcessorConfig): Promise<void> {
    while (item.retryCount <= config.maxRetries) {
      // 检查是否被取消或暂停
      if (this.processingController?.signal.aborted) {
        return;
      }

      // 等待暂停结束
      while (this.isPaused && !this.processingController?.signal.aborted) {
        await this.sleep(100);
      }

      if (this.processingController?.signal.aborted) {
        return;
      }

      try {
        // 更新状态为检测中
        item.status = KeyStatus.CHECKING;
        this.updateProgress();

        const startTime = Date.now();
        
        // 执行验证
        const result = await Promise.race([
          AIKeyValidator.validateKey(item.key, item.service, RequestFormat.NATIVE, item.customUrl),
          this.timeoutPromise<ApiKeyValidationResult>(config.timeout)
        ]);

        const endTime = Date.now();
        item.checkTime = endTime - startTime;
        
        if (result && typeof result === 'object' && 'isValid' in result) {
          item.result = {
            ...result,
            responseTime: item.checkTime,
          } as ApiKeyValidationResult;

          // 更新状态
          item.status = result.isValid ? KeyStatus.VALID : KeyStatus.INVALID;
        } else {
          throw new Error('Invalid result from validation');
        }
        
        // 添加到结果数组
        this.results.push(item);
        this.updateProgress();
        return;

      } catch (error) {
        item.retryCount++;
        
        if (item.retryCount > config.maxRetries) {
          item.status = KeyStatus.ERROR;
          item.result = {
            isValid: false,
            provider: item.service,
            status: KeyStatus.ERROR,
            message: '验证失败',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          
          this.results.push(item);
          this.updateProgress();
          return;
        }

        // 重试延迟
        await this.sleep(config.retryDelay);
      }
    }
  }

  /**
   * 更新进度
   */
  private static updateProgress(): void {
    if (!this.onProgressCallback) return;

    const statistics = this.calculateStatistics();
    this.onProgressCallback(statistics);
  }

  /**
   * 计算统计信息
   */
  private static calculateStatistics(): BatchStatistics {
    const total = this.queue.length;
    const completed = this.results.length;
    const valid = this.results.filter(item => item.status === KeyStatus.VALID).length;
    const invalid = this.results.filter(item => item.status === KeyStatus.INVALID).length;
    const errors = this.results.filter(item => item.status === KeyStatus.ERROR).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    const totalResponseTime = this.results
      .filter(item => item.checkTime)
      .reduce((sum, item) => sum + (item.checkTime || 0), 0);
    const averageResponseTime = this.results.length > 0 ? totalResponseTime / this.results.length : 0;
    
    const successRate = completed > 0 ? (valid / completed) * 100 : 0;

    return {
      total,
      completed,
      valid,
      invalid,
      errors,
      progress,
      averageResponseTime,
      successRate,
    };
  }

  /**
   * 暂停处理
   */
  static pauseProcessing(): void {
    this.isPaused = true;
  }

  /**
   * 继续处理
   */
  static resumeProcessing(): void {
    this.isPaused = false;
  }

  /**
   * 停止处理
   */
  static stopProcessing(): void {
    if (this.processingController) {
      this.processingController.abort();
    }
    this.isPaused = false;
    this.isProcessing = false;
    this.shouldStop = true;
  }

  /**
   * 获取处理状态
   */
  static getProcessingStatus(): {
    isProcessing: boolean;
    isPaused: boolean;
    canPause: boolean;
    canResume: boolean;
    canStop: boolean;
  } {
    return {
      isProcessing: this.isProcessing,
      isPaused: this.isPaused,
      canPause: this.isProcessing && !this.isPaused,
      canResume: this.isProcessing && this.isPaused,
      canStop: this.isProcessing,
    };
  }

  /**
   * 验证批量输入格式
   */
  static validateBatchInput(input: string): {
    isValid: boolean;
    errors: string[];
    preview: BatchKeyItem[];
  } {
    const errors: string[] = [];
    let preview: BatchKeyItem[] = [];

    if (!input.trim()) {
      errors.push('输入不能为空');
      return { isValid: false, errors, preview };
    }

    try {
      preview = this.parseBatchInput(input);
      
      if (preview.length === 0) {
        errors.push('未能解析出任何有效的API Key');
      }

      // 检查重复的Key
      const keys = preview.map(item => item.key);
      const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
      if (duplicates.length > 0) {
        errors.push(`发现重复的API Key: ${duplicates.length}个`);
      }

      // 检查Key格式
      const invalidKeys = preview.filter(item => !item.key || item.key.length < 10);
      if (invalidKeys.length > 0) {
        errors.push(`发现格式可能有误的API Key: ${invalidKeys.length}个`);
      }

    } catch (error) {
      errors.push(`解析失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      preview: preview.slice(0, 5), // 只返回前5个作为预览
    };
  }

  /**
   * 工具方法：延迟
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 工具方法：超时Promise
   */
  private static timeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });
  }
}

/**
 * 信号量类 - 控制并发数
 */
class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<() => void> {
    return new Promise<() => void>((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve(() => this.release());
      } else {
        this.queue.push(() => {
          this.permits--;
          resolve(() => this.release());
        });
      }
    });
  }

  private release(): void {
    this.permits++;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
} 