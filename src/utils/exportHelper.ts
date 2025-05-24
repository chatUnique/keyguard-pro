import { 
  BatchKeyItem, 
  ExportConfig, 
  ExportFormat, 
  KeyStatus 
} from '@/types';

/**
 * 导出辅助工具类
 */
export class ExportHelper {

  /**
   * 导出结果为JSON格式
   */
  static exportAsJSON(data: BatchKeyItem[], config: ExportConfig): void {
    const filteredData = this.filterData(data, config);
    const exportData = this.selectFields(filteredData, config.includeFields);
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = config.filename || `api-keys-${this.formatDate()}.json`;
    
    this.downloadFile(jsonString, filename, 'application/json');
  }

  /**
   * 导出结果为CSV格式
   */
  static exportAsCSV(data: BatchKeyItem[], config: ExportConfig): void {
    const filteredData = this.filterData(data, config);
    
    if (filteredData.length === 0) {
      console.warn('没有数据可导出');
      return;
    }

    const csvContent = this.generateCSV(filteredData, config.includeFields);
    const filename = config.filename || `api-keys-${this.formatDate()}.csv`;
    
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * 根据配置过滤数据
   */
  private static filterData(data: BatchKeyItem[], config: ExportConfig): BatchKeyItem[] {
    let filteredData = [...data];

    // 按状态过滤
    if (config.filterByStatus && config.filterByStatus.length > 0) {
      filteredData = filteredData.filter(item => 
        config.filterByStatus!.includes(item.status)
      );
    }

    // 只导出有效的Key
    if (config.onlyValid) {
      filteredData = filteredData.filter(item => item.status === KeyStatus.VALID);
    }

    return filteredData;
  }

  /**
   * 选择要导出的字段
   */
  private static selectFields(data: BatchKeyItem[], fields: string[]): any[] {
    return data.map(item => {
      const selectedData: any = {};
      
      fields.forEach(field => {
        switch (field) {
          case 'id':
            selectedData.id = item.id;
            break;
          case 'service':
            selectedData.service = item.service;
            break;
          case 'key':
            selectedData.key = this.maskKey(item.key);
            break;
          case 'keyFull':
            selectedData.key = item.key;
            break;
          case 'status':
            selectedData.status = item.status;
            break;
          case 'statusText':
            selectedData.statusText = this.getStatusText(item.status);
            break;
          case 'responseTime':
            selectedData.responseTime = item.checkTime || 0;
            break;
          case 'error':
            selectedData.error = item.result?.error || '';
            break;
          case 'message':
            selectedData.message = item.result?.message || '';
            break;
          case 'isValid':
            selectedData.isValid = item.result?.isValid || false;
            break;
          case 'createdAt':
            selectedData.createdAt = item.createdAt.toISOString();
            break;
          case 'models':
            selectedData.models = item.result?.details?.models?.join(', ') || '';
            break;
          case 'balance':
            selectedData.balance = item.result?.details?.balance || '';
            break;
          case 'organization':
            selectedData.organization = item.result?.details?.organization || '';
            break;
          case 'customUrl':
            selectedData.customUrl = item.customUrl || '';
            break;
          case 'retryCount':
            selectedData.retryCount = item.retryCount;
            break;
          default:
            console.warn(`Unknown field: ${field}`);
        }
      });
      
      return selectedData;
    });
  }

  /**
   * 生成CSV内容
   */
  private static generateCSV(data: BatchKeyItem[], fields: string[]): string {
    if (data.length === 0) {
      return '';
    }

    // 获取所选字段的数据
    const selectedData = this.selectFields(data, fields);
    
    // 生成CSV头部
    const headers = this.getCSVHeaders(fields);
    const csvRows = [headers];

    // 生成CSV行
    selectedData.forEach(item => {
      const row = fields.map(field => {
        const value = item[this.getFieldKey(field)] || '';
        // 处理包含逗号、引号或换行符的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * 获取CSV表头
   */
  private static getCSVHeaders(fields: string[]): string {
    const headerMap: Record<string, string> = {
      id: 'ID',
      service: '服务商',
      key: 'API Key',
      keyFull: 'API Key (完整)',
      status: '状态',
      statusText: '状态描述',
      responseTime: '响应时间 (ms)',
      error: '错误信息',
      message: '消息',
      isValid: '是否有效',
      createdAt: '创建时间',
      models: '可用模型',
      balance: '余额',
      organization: '组织',
      customUrl: '自定义URL',
      retryCount: '重试次数',
    };

    return fields.map(field => headerMap[field] || field).join(',');
  }

  /**
   * 获取字段对应的数据键
   */
  private static getFieldKey(field: string): string {
    const keyMap: Record<string, string> = {
      keyFull: 'key',
      statusText: 'statusText',
      // 其他字段保持原样
    };

    return keyMap[field] || field;
  }

  /**
   * 掩码API Key（只显示前4位和后4位）
   */
  private static maskKey(key: string): string {
    if (key.length <= 8) {
      return '*'.repeat(key.length);
    }
    return `${key.substring(0, 4)}${'*'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  }

  /**
   * 获取状态的中文描述
   */
  private static getStatusText(status: KeyStatus): string {
    const statusTextMap: Record<KeyStatus, string> = {
      [KeyStatus.PENDING]: '待检测',
      [KeyStatus.CHECKING]: '检测中',
      [KeyStatus.VALID]: '有效',
      [KeyStatus.INVALID]: '无效',
      [KeyStatus.EXPIRED]: '已过期',
      [KeyStatus.QUOTA_EXCEEDED]: '配额超限',
      [KeyStatus.RATE_LIMITED]: '频率限制',
      [KeyStatus.FORMAT_ERROR]: '格式错误',
      [KeyStatus.ERROR]: '检测失败',
      [KeyStatus.UNKNOWN]: '未知状态',
    };

    return statusTextMap[status] || '未知状态';
  }

  /**
   * 下载文件
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    try {
      const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  }

  /**
   * 格式化日期用于文件名
   */
  private static formatDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * 获取默认导出字段
   */
  static getDefaultExportFields(): string[] {
    return [
      'service',
      'keyFull',
      'status',
      'responseTime',
      'message',
      'createdAt'
    ];
  }

  /**
   * 获取所有可用导出字段
   */
  static getAllExportFields(): { value: string; label: string; description?: string }[] {
    return [
      { value: 'id', label: 'ID', description: '唯一标识符' },
      { value: 'service', label: '服务商', description: 'AI服务提供商' },
      { value: 'key', label: 'API Key (掩码)', description: '掩码后的API Key' },
      { value: 'keyFull', label: 'API Key (完整)', description: '完整的API Key (敏感)' },
      { value: 'status', label: '状态', description: '检测状态' },
      { value: 'statusText', label: '状态描述', description: '状态的中文描述' },
      { value: 'responseTime', label: '响应时间', description: '检测响应时间 (毫秒)' },
      { value: 'error', label: '错误信息', description: '检测错误详情' },
      { value: 'message', label: '消息', description: '检测返回消息' },
      { value: 'isValid', label: '是否有效', description: 'true/false' },
      { value: 'createdAt', label: '创建时间', description: '检测任务创建时间' },
      { value: 'models', label: '可用模型', description: '支持的AI模型列表' },
      { value: 'balance', label: '余额', description: '账户余额信息' },
      { value: 'organization', label: '组织', description: '所属组织' },
      { value: 'customUrl', label: '自定义URL', description: '自定义检测端点' },
      { value: 'retryCount', label: '重试次数', description: '检测重试次数' },
    ];
  }

  /**
   * 验证导出配置
   */
  static validateExportConfig(config: ExportConfig): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 验证格式
    if (!Object.values(ExportFormat).includes(config.format)) {
      errors.push('无效的导出格式');
    }

    // 验证字段
    if (!config.includeFields || config.includeFields.length === 0) {
      errors.push('必须选择至少一个导出字段');
    }

    // 验证文件名
    if (config.filename) {
      const invalidChars = /[<>:"/\\|?*]/;
      if (invalidChars.test(config.filename)) {
        errors.push('文件名包含无效字符');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 预览导出数据
   */
  static previewExport(data: BatchKeyItem[], config: ExportConfig, limit: number = 5): {
    previewData: any[];
    totalCount: number;
    filteredCount: number;
  } {
    const filteredData = this.filterData(data, config);
    const selectedData = this.selectFields(filteredData, config.includeFields);
    
    return {
      previewData: selectedData.slice(0, limit),
      totalCount: data.length,
      filteredCount: filteredData.length,
    };
  }

  /**
   * 计算导出文件大小（估算）
   */
  static estimateFileSize(data: BatchKeyItem[], config: ExportConfig): {
    size: number;
    sizeText: string;
  } {
    const filteredData = this.filterData(data, config);
    
    let estimatedSize = 0;

    if (config.format === ExportFormat.JSON) {
      // JSON格式大小估算
      const sampleData = this.selectFields(filteredData.slice(0, 1), config.includeFields);
      const sampleSize = JSON.stringify(sampleData, null, 2).length;
      estimatedSize = sampleSize * filteredData.length;
    } else if (config.format === ExportFormat.CSV) {
      // CSV格式大小估算
      const headerSize = this.getCSVHeaders(config.includeFields).length;
      const avgRowSize = config.includeFields.length * 20; // 假设每个字段平均20字符
      estimatedSize = headerSize + (avgRowSize * filteredData.length);
    }

    return {
      size: estimatedSize,
      sizeText: this.formatFileSize(estimatedSize),
    };
  }

  /**
   * 格式化文件大小
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * 批量导出（支持大数据量）
   */
  static async exportLargeData(
    data: BatchKeyItem[], 
    config: ExportConfig,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const chunkSize = 1000; // 每次处理1000条记录
    const filteredData = this.filterData(data, config);
    
    if (filteredData.length <= chunkSize) {
      // 小数据量直接导出
      if (config.format === ExportFormat.JSON) {
        this.exportAsJSON(data, config);
      } else {
        this.exportAsCSV(data, config);
      }
      return;
    }

    // 大数据量分块处理
    const chunks: string[] = [];
    const totalChunks = Math.ceil(filteredData.length / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = filteredData.slice(i * chunkSize, (i + 1) * chunkSize);
      
      if (config.format === ExportFormat.JSON) {
        const selectedData = this.selectFields(chunk, config.includeFields);
        chunks.push(JSON.stringify(selectedData, null, 2));
      } else {
        const csvContent = this.generateCSV(chunk, config.includeFields);
        chunks.push(i === 0 ? csvContent : csvContent.split('\n').slice(1).join('\n'));
      }

      // 更新进度
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      // 让出线程控制权
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // 合并所有块
    let finalContent: string;
    if (config.format === ExportFormat.JSON) {
      finalContent = '[' + chunks.join(',') + ']';
    } else {
      finalContent = chunks.join('\n');
    }

    const filename = config.filename || `api-keys-${this.formatDate()}.${config.format}`;
    const mimeType = config.format === ExportFormat.JSON ? 'application/json' : 'text/csv';
    
    this.downloadFile(finalContent, filename, mimeType);
  }
} 