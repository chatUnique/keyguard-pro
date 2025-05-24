import { useState, useCallback, useRef } from 'react';
import { 
  UseKeyDetectionReturn, 
  BatchKeyItem, 
  BatchStatistics, 
  AiProvider, 
  ApiKeyValidationResult, 
  ExportConfig,
  KeyStatus,
  BatchProcessorConfig
} from '@/types';
import { AIKeyValidator } from '@/utils/keyValidator';
import { BatchProcessor } from '@/utils/batchProcessor';
import { ExportHelper } from '@/utils/exportHelper';

/**
 * API Key检测自定义Hook
 */
export const useKeyDetection = (): UseKeyDetectionReturn => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [results, setResults] = useState<BatchKeyItem[]>([]);
  const [statistics, setStatistics] = useState<BatchStatistics>({
    total: 0,
    completed: 0,
    valid: 0,
    invalid: 0,
    errors: 0,
    progress: 0,
    averageResponseTime: 0,
    successRate: 0,
  });

  // 使用ref来存储最新的状态，避免闭包问题
  const resultsRef = useRef<BatchKeyItem[]>([]);
  const statisticsRef = useRef<BatchStatistics>(statistics);

  // 更新results的同时更新ref
  const updateResults = useCallback((newResults: BatchKeyItem[]) => {
    setResults(newResults);
    resultsRef.current = newResults;
  }, []);

  // 更新statistics的同时更新ref
  const updateStatistics = useCallback((newStats: BatchStatistics) => {
    setStatistics(newStats);
    statisticsRef.current = newStats;
  }, []);

  /**
   * 单个Key检测
   */
  const detectSingle = useCallback(async (
    key: string, 
    provider: AiProvider, 
    customUrl?: string
  ): Promise<ApiKeyValidationResult> => {
    if (!key.trim()) {
      throw new Error('API Key不能为空');
    }

    setIsDetecting(true);

    try {
      const result = await AIKeyValidator.validateKey(key, provider, undefined, customUrl);
      
      // 创建批量项目以便统一管理
      const batchItem: BatchKeyItem = {
        id: `single-${Date.now()}`,
        service: provider,
        key,
        status: result.isValid ? KeyStatus.VALID : KeyStatus.INVALID,
        result,
        retryCount: 0,
        createdAt: new Date(),
        customUrl,
        checkTime: result.responseTime,
      };

      // 添加到结果中
      const newResults = [...resultsRef.current, batchItem];
      updateResults(newResults);

      // 更新统计信息
      updateStatistics(calculateStatistics(newResults));

      return result;
    } catch (error) {
      const errorResult: ApiKeyValidationResult = {
        isValid: false,
        provider,
        status: KeyStatus.ERROR,
        message: '检测失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      // 创建错误的批量项目
      const batchItem: BatchKeyItem = {
        id: `single-error-${Date.now()}`,
        service: provider,
        key,
        status: KeyStatus.ERROR,
        result: errorResult,
        retryCount: 0,
        createdAt: new Date(),
        customUrl,
      };

      const newResults = [...resultsRef.current, batchItem];
      updateResults(newResults);
      updateStatistics(calculateStatistics(newResults));

      throw error;
    } finally {
      setIsDetecting(false);
    }
  }, [updateResults, updateStatistics]);

  /**
   * 批量Key检测
   */
  const detectBatch = useCallback(async (items: BatchKeyItem[]): Promise<void> => {
    if (items.length === 0) {
      throw new Error('没有要检测的API Key');
    }

    setIsDetecting(true);

    try {
      // 清空之前的结果
      updateResults([]);
      updateStatistics({
        total: items.length,
        completed: 0,
        valid: 0,
        invalid: 0,
        errors: 0,
        progress: 0,
        averageResponseTime: 0,
        successRate: 0,
      });

      // 配置批量处理参数
      const config: Partial<BatchProcessorConfig> = {
        concurrency: 5,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
      };

      await BatchProcessor.processBatch(
        items,
        (progress: BatchStatistics) => {
          updateStatistics(progress);
        },
        (finalResults: BatchKeyItem[]) => {
          updateResults(finalResults);
          updateStatistics(calculateStatistics(finalResults));
        },
        config
      );
    } catch (error) {
      console.error('批量检测失败:', error);
      throw error;
    } finally {
      setIsDetecting(false);
    }
  }, [updateResults, updateStatistics]);

  /**
   * 暂停检测
   */
  const pauseDetection = useCallback(() => {
    BatchProcessor.pauseProcessing();
  }, []);

  /**
   * 继续检测
   */
  const resumeDetection = useCallback(() => {
    BatchProcessor.resumeProcessing();
  }, []);

  /**
   * 停止检测
   */
  const stopDetection = useCallback(() => {
    BatchProcessor.stopProcessing();
    setIsDetecting(false);
  }, []);

  /**
   * 清空结果
   */
  const clearResults = useCallback(() => {
    updateResults([]);
    updateStatistics({
      total: 0,
      completed: 0,
      valid: 0,
      invalid: 0,
      errors: 0,
      progress: 0,
      averageResponseTime: 0,
      successRate: 0,
    });
  }, [updateResults, updateStatistics]);

  /**
   * 导出结果
   */
  const exportResults = useCallback((config: ExportConfig) => {
    try {
      const validation = ExportHelper.validateExportConfig(config);
      if (!validation.isValid) {
        throw new Error(`导出配置无效: ${validation.errors.join(', ')}`);
      }

      if (resultsRef.current.length === 0) {
        throw new Error('没有数据可导出');
      }

      // 根据数据量选择导出方式
      if (resultsRef.current.length > 5000) {
        // 大数据量异步导出
        ExportHelper.exportLargeData(resultsRef.current, config).catch(error => {
          console.error('导出失败:', error);
        });
      } else {
        // 小数据量同步导出
        if (config.format === 'json') {
          ExportHelper.exportAsJSON(resultsRef.current, config);
        } else {
          ExportHelper.exportAsCSV(resultsRef.current, config);
        }
      }
    } catch (error) {
      console.error('导出失败:', error);
      throw error;
    }
  }, []);

  /**
   * 更新单个结果
   */
  const updateResult = useCallback((id: string, result: ApiKeyValidationResult) => {
    const newResults = resultsRef.current.map(item => {
      if (item.id === id) {
        return {
          ...item,
          result,
          status: result.isValid ? KeyStatus.VALID : KeyStatus.INVALID,
          checkTime: result.responseTime,
        };
      }
      return item;
    });

    updateResults(newResults);
    updateStatistics(calculateStatistics(newResults));
  }, [updateResults, updateStatistics]);

  return {
    isDetecting,
    results,
    statistics,
    detectSingle,
    detectBatch,
    pauseDetection,
    resumeDetection,
    stopDetection,
    clearResults,
    exportResults,
    updateResult,
  };
};

/**
 * 计算统计信息
 */
function calculateStatistics(results: BatchKeyItem[]): BatchStatistics {
  const total = results.length;
  const completed = results.filter(item => 
    item.status !== KeyStatus.PENDING && item.status !== KeyStatus.CHECKING
  ).length;
  const valid = results.filter(item => item.status === KeyStatus.VALID).length;
  const invalid = results.filter(item => item.status === KeyStatus.INVALID).length;
  const errors = results.filter(item => item.status === KeyStatus.ERROR).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  // 计算平均响应时间
  const completedResults = results.filter(item => item.checkTime);
  const totalResponseTime = completedResults.reduce((sum, item) => sum + (item.checkTime || 0), 0);
  const averageResponseTime = completedResults.length > 0 ? totalResponseTime / completedResults.length : 0;

  // 计算成功率
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