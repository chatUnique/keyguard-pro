import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Download, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Users,
  FileSpreadsheet,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  X
} from 'lucide-react';
import { 
  BatchKeyDetectorProps, 
  AiProvider, 
  RequestFormat,
  BatchKeyItem,
  KeyStatus,
  BatchStatistics
} from '@/types';
import { ProviderIcon } from './ProviderIcon';
import Select from './ui/Select';
import { useKeyDetection } from '@/hooks/useKeyDetection';

/**
 * 批量Key检测组件
 */
export const BatchKeyDetector: React.FC<BatchKeyDetectorProps> = ({ 
  onBatchComplete, 
  onProgress 
}) => {
  const [inputText, setInputText] = useState('');
  const [inputFormat, setInputFormat] = useState<'plain' | 'service_key' | 'json'>('plain');
  const [defaultProvider, setDefaultProvider] = useState<AiProvider>(AiProvider.OPENAI);
  const [defaultRequestFormat, setDefaultRequestFormat] = useState<RequestFormat>(RequestFormat.NATIVE);
  const [defaultModel, setDefaultModel] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enableDeduplication, setEnableDeduplication] = useState(true);
  const [deduplicationInfo, setDeduplicationInfo] = useState<{
    duplicatesRemoved: number;
    totalParsed: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<KeyStatus | 'all'>('all');
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // 模型详情模态框状态
  const [selectedModels, setSelectedModels] = useState<string[] | null>(null);
  const [showModelsModal, setShowModelsModal] = useState(false);

  const { 
    isDetecting, 
    results, 
    statistics, 
    detectBatch, 
    pauseDetection, 
    resumeDetection, 
    stopDetection, 
    clearResults 
  } = useKeyDetection();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 输入格式选项
  const inputFormatOptions = [
    {
      value: 'plain',
      label: '纯文本格式',
      description: '每行一个API Key',
      icon: <FileText className="w-4 h-4" />
    },
    {
      value: 'service_key',
      label: '服务商:密钥格式',
      description: 'openai:sk-xxx, claude:sk-ant-xxx',
      icon: <Settings className="w-4 h-4" />
    },
    {
      value: 'json',
      label: 'JSON格式',
      description: '{"service":"openai","key":"sk-xxx"}',
      icon: <FileSpreadsheet className="w-4 h-4" />
    }
  ];

  // 服务商选项
  const providerOptions = [
    // 国际主流服务商
    { value: AiProvider.OPENAI, label: 'OpenAI', icon: <ProviderIcon provider={AiProvider.OPENAI} size={16} /> },
    { value: AiProvider.ANTHROPIC, label: 'Anthropic', icon: <ProviderIcon provider={AiProvider.ANTHROPIC} size={16} /> },
    { value: AiProvider.GOOGLE, label: 'Google AI', icon: <ProviderIcon provider={AiProvider.GOOGLE} size={16} /> },
    { value: AiProvider.AZURE, label: 'Azure OpenAI', icon: <ProviderIcon provider={AiProvider.AZURE} size={16} /> },
    { value: AiProvider.COHERE, label: 'Cohere', icon: <ProviderIcon provider={AiProvider.COHERE} size={16} /> },
    { value: AiProvider.HUGGINGFACE, label: 'HuggingFace', icon: <ProviderIcon provider={AiProvider.HUGGINGFACE} size={16} /> },
    
    // 新增国际服务商
    { value: AiProvider.REPLICATE, label: 'Replicate', icon: <ProviderIcon provider={AiProvider.REPLICATE} size={16} /> },
    { value: AiProvider.TOGETHER, label: 'Together AI', icon: <ProviderIcon provider={AiProvider.TOGETHER} size={16} /> },
    { value: AiProvider.FIREWORKS, label: 'Fireworks AI', icon: <ProviderIcon provider={AiProvider.FIREWORKS} size={16} /> },
    { value: AiProvider.GROQ, label: 'Groq', icon: <ProviderIcon provider={AiProvider.GROQ} size={16} /> },
    { value: AiProvider.PERPLEXITY, label: 'Perplexity', icon: <ProviderIcon provider={AiProvider.PERPLEXITY} size={16} /> },
    { value: AiProvider.XAI, label: 'xAI (Grok)', icon: <ProviderIcon provider={AiProvider.XAI} size={16} /> },
    { value: AiProvider.MISTRAL, label: 'Mistral AI', icon: <ProviderIcon provider={AiProvider.MISTRAL} size={16} /> },
    { value: AiProvider.STABILITY, label: 'Stability AI', icon: <ProviderIcon provider={AiProvider.STABILITY} size={16} /> },
    { value: AiProvider.RUNWAY, label: 'Runway ML', icon: <ProviderIcon provider={AiProvider.RUNWAY} size={16} /> },
    
    // 国内主流服务商
    { value: AiProvider.BAIDU, label: '百度文心', icon: <ProviderIcon provider={AiProvider.BAIDU} size={16} /> },
    { value: AiProvider.QWEN, label: '通义千问', icon: <ProviderIcon provider={AiProvider.QWEN} size={16} /> },
    { value: AiProvider.DOUBAO, label: '豆包', icon: <ProviderIcon provider={AiProvider.DOUBAO} size={16} /> },
    { value: AiProvider.MOONSHOT, label: 'Moonshot (Kimi)', icon: <ProviderIcon provider={AiProvider.MOONSHOT} size={16} /> },
    { value: AiProvider.ZHIPU, label: '智谱AI (GLM)', icon: <ProviderIcon provider={AiProvider.ZHIPU} size={16} /> },
    { value: AiProvider.MINIMAX, label: 'MiniMax', icon: <ProviderIcon provider={AiProvider.MINIMAX} size={16} /> },
    
    // 新增国内服务商
    { value: AiProvider.DEEPSEEK, label: 'DeepSeek', icon: <ProviderIcon provider={AiProvider.DEEPSEEK} size={16} /> },
    { value: AiProvider.ONEAI, label: '零一万物 (01.AI)', icon: <ProviderIcon provider={AiProvider.ONEAI} size={16} /> },
    { value: AiProvider.TENCENT, label: '腾讯混元', icon: <ProviderIcon provider={AiProvider.TENCENT} size={16} /> },
    { value: AiProvider.IFLYTEK, label: '科大讯飞星火', icon: <ProviderIcon provider={AiProvider.IFLYTEK} size={16} /> },
    { value: AiProvider.SENSETIME, label: '商汤日日新', icon: <ProviderIcon provider={AiProvider.SENSETIME} size={16} /> },
    { value: AiProvider.BYTEDANCE, label: '字节云雀', icon: <ProviderIcon provider={AiProvider.BYTEDANCE} size={16} /> },
    { value: AiProvider.LINGYI, label: '零一万物', icon: <ProviderIcon provider={AiProvider.LINGYI} size={16} /> },
    { value: AiProvider.BAICHUAN, label: '百川智能', icon: <ProviderIcon provider={AiProvider.BAICHUAN} size={16} /> },
    { value: AiProvider.KUNLUN, label: '昆仑万维', icon: <ProviderIcon provider={AiProvider.KUNLUN} size={16} /> },
    { value: AiProvider.ALIBABA_CLOUD, label: '阿里云百炼', icon: <ProviderIcon provider={AiProvider.ALIBABA_CLOUD} size={16} /> },
    { value: AiProvider.HUAWEI, label: '华为盘古', icon: <ProviderIcon provider={AiProvider.HUAWEI} size={16} /> },
    { value: AiProvider.SILICONFLOW, label: '硅基流动', icon: <ProviderIcon provider={AiProvider.SILICONFLOW} size={16} /> },
    
    // 新增主流服务商
    { value: AiProvider.OLLAMA, label: 'Ollama', icon: <ProviderIcon provider={AiProvider.OLLAMA} size={16} /> },
    { value: AiProvider.META, label: 'Meta AI', icon: <ProviderIcon provider={AiProvider.META} size={16} /> },
    { value: AiProvider.COZE, label: 'Coze', icon: <ProviderIcon provider={AiProvider.COZE} size={16} /> },
    { value: AiProvider.GITHUB_COPILOT, label: 'GitHub Copilot', icon: <ProviderIcon provider={AiProvider.GITHUB_COPILOT} size={16} /> },
    
    // 新增其他服务商
    { value: AiProvider.CLINE, label: 'Cline', icon: <ProviderIcon provider={AiProvider.CLINE} size={16} /> },
    { value: AiProvider.HUNYUAN, label: '腾讯混元', icon: <ProviderIcon provider={AiProvider.HUNYUAN} size={16} /> },
    { value: AiProvider.YUANBAO, label: '字节元宝', icon: <ProviderIcon provider={AiProvider.YUANBAO} size={16} /> },
    { value: AiProvider.VOLCENGINE, label: '火山引擎', icon: <ProviderIcon provider={AiProvider.VOLCENGINE} size={16} /> },
    { value: AiProvider.MIDJOURNEY, label: 'Midjourney', icon: <ProviderIcon provider={AiProvider.MIDJOURNEY} size={16} /> },
  ];

  // 请求格式选项
  const formatOptions = [
    {
      value: RequestFormat.NATIVE,
      label: '原生格式',
      icon: <Settings className="w-4 h-4" />
    },
    {
      value: RequestFormat.OPENAI_COMPATIBLE,
      label: 'OpenAI兼容',
      icon: <FileText className="w-4 h-4" />
    }
  ];

  // 状态过滤选项
  const statusFilterOptions = [
    { value: 'all', label: '全部状态', icon: <Users className="w-4 h-4" /> },
    { value: KeyStatus.VALID, label: '有效', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
    { value: KeyStatus.INVALID, label: '无效', icon: <XCircle className="w-4 h-4 text-red-500" /> },
    { value: KeyStatus.ERROR, label: '错误', icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> },
    { value: KeyStatus.PENDING, label: '等待中', icon: <Clock className="w-4 h-4 text-gray-500" /> },
  ];

  // 页面大小选项
  const pageSizeOptions = [
    { value: '10', label: '10', icon: <FileText className="w-4 h-4" /> },
    { value: '20', label: '20', icon: <FileText className="w-4 h-4" /> },
    { value: '50', label: '50', icon: <FileText className="w-4 h-4" /> },
    { value: '100', label: '100', icon: <FileText className="w-4 h-4" /> },
  ];

  /**
   * 显示模型详情
   */
  const showModelDetails = (models: string[]) => {
    setSelectedModels(models);
    setShowModelsModal(true);
  };

  /**
   * 解析输入文本
   */
  const parseInput = useCallback((text: string): BatchKeyItem[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const items: BatchKeyItem[] = [];
    let totalParsed = 0;
    const keySet = new Set<string>(); // 用于去重
    let duplicatesRemoved = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      let service = defaultProvider;
      let key = '';
      let customUrl = '';

      try {
        switch (inputFormat) {
          case 'plain':
            key = trimmedLine;
            break;

          case 'service_key':
            const parts = trimmedLine.split(':');
            if (parts.length >= 2) {
              const serviceStr = parts[0].toLowerCase().trim();
              key = parts.slice(1).join(':').trim();
              
              // 映射服务商名称
              const serviceMap: Record<string, AiProvider> = {
                // 国际主流服务商
                'openai': AiProvider.OPENAI,
                'anthropic': AiProvider.ANTHROPIC,
                'claude': AiProvider.ANTHROPIC,
                'google': AiProvider.GOOGLE,
                'gemini': AiProvider.GOOGLE,
                'azure': AiProvider.AZURE,
                'cohere': AiProvider.COHERE,
                'huggingface': AiProvider.HUGGINGFACE,
                'hf': AiProvider.HUGGINGFACE,
                
                // 新增国际服务商
                'replicate': AiProvider.REPLICATE,
                'together': AiProvider.TOGETHER,
                'fireworks': AiProvider.FIREWORKS,
                'groq': AiProvider.GROQ,
                'perplexity': AiProvider.PERPLEXITY,
                'xai': AiProvider.XAI,
                'grok': AiProvider.XAI,
                'mistral': AiProvider.MISTRAL,
                'stability': AiProvider.STABILITY,
                'runway': AiProvider.RUNWAY,
                
                // 国内主流服务商
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
                
                // 新增国内服务商
                'deepseek': AiProvider.DEEPSEEK,
                '01ai': AiProvider.ONEAI,
                'oneai': AiProvider.ONEAI,
                'yi': AiProvider.ONEAI,
                'tencent': AiProvider.TENCENT,
                'hunyuan': AiProvider.HUNYUAN,
                'iflytek': AiProvider.IFLYTEK,
                'spark': AiProvider.IFLYTEK,
                'xinghuo': AiProvider.IFLYTEK,
                'sensetime': AiProvider.SENSETIME,
                'bytedance': AiProvider.BYTEDANCE,
                'yunque': AiProvider.BYTEDANCE,
                'lingyi': AiProvider.LINGYI,
                'baichuan': AiProvider.BAICHUAN,
                'kunlun': AiProvider.KUNLUN,
                'skywork': AiProvider.KUNLUN,
                'alibaba': AiProvider.ALIBABA_CLOUD,
                'aliyun': AiProvider.ALIBABA_CLOUD,
                'huawei': AiProvider.HUAWEI,
                'pangu': AiProvider.HUAWEI,
                'siliconflow': AiProvider.SILICONFLOW,
                'silicon': AiProvider.SILICONFLOW,
                
                // 新增主流服务商
                'ollama': AiProvider.OLLAMA,
                'meta': AiProvider.META,
                'llama': AiProvider.META,
                'coze': AiProvider.COZE,
                'github': AiProvider.GITHUB_COPILOT,
                'copilot': AiProvider.GITHUB_COPILOT,
                
                // 新增其他服务商
                'cline': AiProvider.CLINE,
                'yuanbao': AiProvider.YUANBAO,
                'volcengine': AiProvider.VOLCENGINE,
                'midjourney': AiProvider.MIDJOURNEY,
              };
              
              service = serviceMap[serviceStr] || defaultProvider;
            } else {
              key = trimmedLine;
            }
            break;

          case 'json':
            const jsonData = JSON.parse(trimmedLine);
            key = jsonData.key || jsonData.apiKey || '';
            if (jsonData.service) {
              const serviceStr = jsonData.service.toLowerCase();
              const serviceMap: Record<string, AiProvider> = {
                // 国际主流服务商
                'openai': AiProvider.OPENAI,
                'anthropic': AiProvider.ANTHROPIC,
                'claude': AiProvider.ANTHROPIC,
                'google': AiProvider.GOOGLE,
                'gemini': AiProvider.GOOGLE,
                'azure': AiProvider.AZURE,
                'cohere': AiProvider.COHERE,
                'huggingface': AiProvider.HUGGINGFACE,
                'hf': AiProvider.HUGGINGFACE,
                
                // 新增国际服务商
                'replicate': AiProvider.REPLICATE,
                'together': AiProvider.TOGETHER,
                'fireworks': AiProvider.FIREWORKS,
                'groq': AiProvider.GROQ,
                'perplexity': AiProvider.PERPLEXITY,
                'xai': AiProvider.XAI,
                'grok': AiProvider.XAI,
                'mistral': AiProvider.MISTRAL,
                'stability': AiProvider.STABILITY,
                'runway': AiProvider.RUNWAY,
                
                // 国内主流服务商
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
                
                // 新增国内服务商
                'deepseek': AiProvider.DEEPSEEK,
                '01ai': AiProvider.ONEAI,
                'oneai': AiProvider.ONEAI,
                'yi': AiProvider.ONEAI,
                'tencent': AiProvider.TENCENT,
                'hunyuan': AiProvider.HUNYUAN,
                'iflytek': AiProvider.IFLYTEK,
                'spark': AiProvider.IFLYTEK,
                'xinghuo': AiProvider.IFLYTEK,
                'sensetime': AiProvider.SENSETIME,
                'bytedance': AiProvider.BYTEDANCE,
                'yunque': AiProvider.BYTEDANCE,
                'lingyi': AiProvider.LINGYI,
                'baichuan': AiProvider.BAICHUAN,
                'kunlun': AiProvider.KUNLUN,
                'skywork': AiProvider.KUNLUN,
                'alibaba': AiProvider.ALIBABA_CLOUD,
                'aliyun': AiProvider.ALIBABA_CLOUD,
                'huawei': AiProvider.HUAWEI,
                'pangu': AiProvider.HUAWEI,
                'siliconflow': AiProvider.SILICONFLOW,
                'silicon': AiProvider.SILICONFLOW,
                
                // 新增主流服务商
                'ollama': AiProvider.OLLAMA,
                'meta': AiProvider.META,
                'llama': AiProvider.META,
                'coze': AiProvider.COZE,
                'github': AiProvider.GITHUB_COPILOT,
                'copilot': AiProvider.GITHUB_COPILOT,
                
                // 新增其他服务商
                'cline': AiProvider.CLINE,
                'yuanbao': AiProvider.YUANBAO,
                'volcengine': AiProvider.VOLCENGINE,
                'midjourney': AiProvider.MIDJOURNEY,
              };
              service = serviceMap[serviceStr] || defaultProvider;
            }
            customUrl = jsonData.customUrl || jsonData.url || '';
            break;
        }

        if (key) {
          totalParsed++;
          
          // 去重检查
          if (enableDeduplication) {
            if (keySet.has(key)) {
              duplicatesRemoved++;
              return; // 跳过重复的key
            }
            keySet.add(key);
          }
          
          items.push({
            id: `${Date.now()}-${index}`,
            service,
            key,
            status: KeyStatus.PENDING,
            retryCount: 0,
            createdAt: new Date(),
            customUrl: customUrl || undefined,
          });
        }
      } catch (error) {
        // JSON解析错误，跳过这行
        console.warn(`Failed to parse line ${index + 1}:`, error);
      }
    });

    // 更新去重信息
    setDeduplicationInfo({
      duplicatesRemoved,
      totalParsed
    });

    return items;
  }, [inputFormat, defaultProvider, enableDeduplication]);

  /**
   * 开始批量检测
   */
  const handleStartDetection = useCallback(async () => {
    const items = parseInput(inputText);
    if (items.length === 0) {
      alert('请输入有效的API Key数据');
      return;
    }

    await detectBatch(items);
  }, [inputText, parseInput, detectBatch]);

  /**
   * 文件上传处理
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  }, []);

  /**
   * 导出结果
   */
  const handleExport = useCallback((format: 'json' | 'csv') => {
    if (results.length === 0) return;

    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      filename = `keyguard-results-${new Date().toISOString().split('T')[0]}.json`;
    } else {
      const headers = ['Service', 'Key', 'Status', 'Message', 'Response Time', 'Models'];
      const rows = results.map(item => [
        item.service,
        item.key,
        item.status,
        item.result?.message || '',
        item.result?.responseTime || '',
        item.result?.details?.models?.join(';') || ''
      ]);
      
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `keyguard-results-${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, [results]);

  // 过滤结果
  const filteredResults = results.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 分页计算
  const totalPages = Math.ceil(filteredResults.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // 分页控制函数
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // 重置到第一页
  };

  // 当搜索或过滤条件改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    onProgress(statistics);
  }, [statistics, onProgress]);

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          批量输入API Keys
        </h3>
        
        {/* 输入格式选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输入格式
          </label>
          <Select
            options={inputFormatOptions}
            value={inputFormat}
            onChange={(value) => setInputFormat(value as typeof inputFormat)}
            placeholder="选择输入格式"
            className="w-full"
          />
        </div>

        {/* 文本输入区域 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              API Keys数据
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 flex items-center space-x-1"
              >
                <Upload className="w-3 h-3" />
                <span>从文件导入</span>
              </button>
              <button
                onClick={() => setInputText('')}
                className="px-3 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                清空
              </button>
            </div>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              inputFormat === 'plain' ? 'sk-proj-1234567890abcdef...\nsk-ant-api03-1234567890...' :
              inputFormat === 'service_key' ? 'openai:sk-proj-1234567890abcdef...\nanthropic:sk-ant-api03-1234567890...' :
              '{"service":"openai","key":"sk-proj-1234567890abcdef..."}\n{"service":"anthropic","key":"sk-ant-api03-1234567890..."}'
            }
            className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
            disabled={isDetecting}
          />
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {/* 去重信息显示 */}
          {deduplicationInfo && deduplicationInfo.totalParsed > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-center space-x-2 text-sm">
                <div className="text-blue-600 dark:text-blue-400">
                  📊 解析了 <span className="font-medium">{deduplicationInfo.totalParsed}</span> 个API Key
                  {enableDeduplication && deduplicationInfo.duplicatesRemoved > 0 && (
                    <>
                      ，自动去重 <span className="font-medium text-orange-600 dark:text-orange-400">{deduplicationInfo.duplicatesRemoved}</span> 个
                    </>
                  )}
                  ，最终 <span className="font-medium text-green-600 dark:text-green-400">{deduplicationInfo.totalParsed - deduplicationInfo.duplicatesRemoved}</span> 个待检测
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 高级设置 */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-3"
          >
            <Settings className="w-4 h-4" />
            <span>高级设置</span>
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <MoreVertical className="w-4 h-4" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    默认服务商
                  </label>
                  <Select
                    options={providerOptions}
                    value={defaultProvider}
                    onChange={(value) => setDefaultProvider(value as AiProvider)}
                    placeholder="选择默认服务商"
                    className="w-full [&>button]:!h-10 [&>button]:!py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    默认请求格式
                  </label>
                  <Select
                    options={formatOptions}
                    value={defaultRequestFormat}
                    onChange={(value) => setDefaultRequestFormat(value as RequestFormat)}
                    placeholder="选择请求格式"
                    className="w-full [&>button]:!h-10 [&>button]:!py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    默认测试模型
                  </label>
                  <input
                    type="text"
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    placeholder="留空使用默认模型"
                    className="w-full h-10 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableDeduplication"
                      checked={enableDeduplication}
                      onChange={(e) => setEnableDeduplication(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="enableDeduplication" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      启用自动去重
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      自动移除重复的API Key
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center space-x-3 mt-6">
          {!isDetecting ? (
            <button
              onClick={handleStartDetection}
              disabled={!inputText.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              <span>开始检测</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={pauseDetection}
                className="flex items-center space-x-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                <Pause className="w-5 h-5" />
                <span>暂停</span>
              </button>
              <button
                onClick={stopDetection}
                className="flex items-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                <Square className="w-5 h-5" />
                <span>停止</span>
              </button>
            </div>
          )}
          
          {results.length > 0 && (
            <button
              onClick={clearResults}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空结果</span>
            </button>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      {(isDetecting || results.length > 0) && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            检测统计
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                总数
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {statistics.valid}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                有效
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {statistics.invalid}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                无效
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {statistics.errors}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                错误
              </div>
            </div>
          </div>
          
          {isDetecting && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  进度: {statistics.completed}/{statistics.total}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(statistics.progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${statistics.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 结果列表 */}
      {results.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              检测结果
            </h3>
            
            <div className="flex items-center space-x-3">
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* 状态过滤 */}
              <Select
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as typeof statusFilter)}
                placeholder="状态过滤"
                className="w-40"
              />
              
              {/* 导出按钮 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('json')}
                  className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>

          {/* 结果表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">服务商</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">API Key</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">消息</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">模型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">响应时间</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <ProviderIcon provider={item.service} size={16} />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {providerOptions.find(p => p.value === item.service)?.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {item.key}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {item.status === KeyStatus.VALID && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {item.status === KeyStatus.INVALID && <XCircle className="w-4 h-4 text-red-500" />}
                        {item.status === KeyStatus.ERROR && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        {item.status === KeyStatus.PENDING && <Clock className="w-4 h-4 text-gray-500" />}
                        <span className={`text-sm ${
                          item.status === KeyStatus.VALID ? 'text-green-600 dark:text-green-400' :
                          item.status === KeyStatus.INVALID ? 'text-red-600 dark:text-red-400' :
                          item.status === KeyStatus.ERROR ? 'text-orange-600 dark:text-orange-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.result?.message || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.result?.details?.models?.length ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-wrap gap-1">
                              {item.result.details.models.slice(0, 2).map((model, idx) => (
                                <div key={idx} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                  {model}
                                </div>
                              ))}
                            </div>
                            {item.result.details.models.length > 2 && (
                              <button
                                onClick={() => showModelDetails(item.result!.details!.models!)}
                                className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                              >
                                <Eye className="w-3 h-3" />
                                <span className="text-xs">+{item.result.details.models.length - 2}</span>
                              </button>
                            )}
                            {item.result.details.models.length <= 2 && item.result.details.models.length > 0 && (
                              <button
                                onClick={() => showModelDetails(item.result!.details!.models!)}
                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                                title="查看详情"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.result?.responseTime ? `${item.result.responseTime}ms` : '-'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页控件和统计信息 */}
          {filteredResults.length > 0 && (
            <div className="mt-6 space-y-3">
              {/* 顶部控制栏 */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* 左侧：页面大小选择 */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">每页</span>
                  <Select
                    options={pageSizeOptions}
                    value={pageSize.toString()}
                    onChange={handlePageSizeChange}
                    className="w-[90px]"
                  />
                  <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">条</span>
                </div>
                
                {/* 右侧：结果统计 */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="hidden sm:inline">显示第 </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {startIndex + 1}-{Math.min(endIndex, filteredResults.length)}
                  </span>
                  <span className="hidden sm:inline"> 条，</span>
                  <span className="sm:hidden"> / </span>
                  <span className="hidden sm:inline">共 </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {filteredResults.length}
                  </span>
                  <span className="hidden sm:inline"> 条结果</span>
                  <span className="sm:hidden"> 条</span>
                </div>
              </div>

              {/* 分页按钮 */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-1">
                    {/* 第一页 */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="第一页"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    
                    {/* 上一页 */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="上一页"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* 页码按钮 */}
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const pageButtons = [];
                        const maxVisible = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                        
                        // 调整范围确保显示足够的页码
                        if (endPage - startPage + 1 < maxVisible) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }

                        // 如果页码太多，显示省略号
                        if (startPage > 1) {
                          pageButtons.push(
                            <button
                              key={1}
                              onClick={() => handlePageChange(1)}
                              className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pageButtons.push(
                              <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                            );
                          }
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pageButtons.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                i === currentPage
                                  ? 'bg-blue-500 text-white shadow-lg'
                                  : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pageButtons.push(
                              <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                            );
                          }
                          pageButtons.push(
                            <button
                              key={totalPages}
                              onClick={() => handlePageChange(totalPages)}
                              className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pageButtons;
                      })()}
                    </div>

                    {/* 下一页 */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="下一页"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {/* 最后一页 */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="最后一页"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {paginatedResults.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              没有找到匹配的结果
            </div>
          )}
        </div>
      )}

      {/* 模型详情模态框 */}
      <AnimatePresence>
        {showModelsModal && selectedModels && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModelsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  可用模型列表
                </h3>
                <button
                  onClick={() => setShowModelsModal(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  共 {selectedModels.length} 个模型
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {selectedModels.map((model, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white font-mono"
                    >
                      {model}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModelsModal(false)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 