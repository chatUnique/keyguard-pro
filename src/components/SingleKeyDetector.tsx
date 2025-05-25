import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Key, 
  Server,
  Eye,
  EyeOff,
  Brain,
  Cpu,
  Zap,
  Globe,
  Database,
  Settings,
  List,
  Search,
  Plus,
  X,
  Info,
  ChevronDown
} from 'lucide-react';
import { 
  SingleKeyDetectorProps, 
  AiProvider, 
  ApiKeyValidationResult,
  KeyStatus,
  RequestFormat
} from '@/types';
import { AIKeyValidator } from '@/utils/keyValidator';
import Select from './ui/Select';
import { ProviderIcon } from './ProviderIcon';

/**
 * 单个Key检测组件 - 苹果风格设计
 */
export const SingleKeyDetector: React.FC<SingleKeyDetectorProps> = ({ onResult }) => {
  const [provider, setProvider] = useState<AiProvider>(AiProvider.OPENAI);
  const [apiKey, setApiKey] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [requestFormat, setRequestFormat] = useState<RequestFormat>(RequestFormat.NATIVE);
  const [testModel, setTestModel] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<ApiKeyValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkBalance, setCheckBalance] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 服务商配置选项
  const providerOptions = [
    { 
      value: AiProvider.OPENAI, 
      label: 'OpenAI', 
      description: 'GPT-4o, GPT-4, GPT-3.5, DALL-E',
      icon: <ProviderIcon provider={AiProvider.OPENAI} size={16} />,
      placeholder: 'sk-proj-...',
      example: 'sk-proj-1234567890abcdef...',
      defaultModels: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo', 'dall-e-3']
    },
    { 
      value: AiProvider.ANTHROPIC, 
      label: 'Anthropic (Claude)', 
      description: 'Claude 3.5 Sonnet, Claude 3 Opus, Haiku',
      icon: <ProviderIcon provider={AiProvider.ANTHROPIC} size={16} />,
      placeholder: 'sk-ant-...',
      example: 'sk-ant-api03-1234567890abcdef...',
      defaultModels: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
    },
    { 
      value: AiProvider.GOOGLE, 
      label: 'Google AI (Gemini)', 
      description: 'Gemini 1.5 Pro, Gemini 1.5 Flash',
      icon: <ProviderIcon provider={AiProvider.GOOGLE} size={16} />,
      placeholder: 'AIza...',
      example: 'AIzaSyBVWfcRhVnRN-1234567890',
      defaultModels: ['gemini-1.5-pro-latest', 'gemini-1.5-flash', 'gemini-pro']
    },
    { 
      value: AiProvider.BAIDU, 
      label: '百度文心一言', 
      description: 'ERNIE-4.0, ERNIE-3.5, ERNIE-Lite',
      icon: <ProviderIcon provider={AiProvider.BAIDU} size={16} />,
      placeholder: 'API Key',
      example: '24.f9ba9c5241b67688...',
      defaultModels: ['ERNIE-4.0-8K', 'ERNIE-3.5-8K', 'ERNIE-Lite-8K']
    },
    { 
      value: AiProvider.QWEN, 
      label: '阿里通义千问', 
      description: 'Qwen2.5-72B, Qwen-Max, Qwen-Turbo',
      icon: <ProviderIcon provider={AiProvider.QWEN} size={16} />,
      placeholder: 'sk-...',
      example: 'sk-1234567890abcdef...',
      defaultModels: ['qwen2.5-72b-instruct', 'qwen-max', 'qwen-turbo']
    },
    { 
      value: AiProvider.DOUBAO, 
      label: '字节豆包', 
      description: 'Doubao-pro-32k, Doubao-lite-32k',
      icon: <ProviderIcon provider={AiProvider.DOUBAO} size={16} />,
      placeholder: 'API Key',
      example: 'ak-1234567890abcdef...',
      defaultModels: ['doubao-pro-32k', 'doubao-lite-32k', 'doubao-pro-4k']
    },
    { 
      value: AiProvider.MOONSHOT, 
      label: 'Moonshot AI (Kimi)', 
      description: 'Moonshot-v1-32k, Moonshot-v1-8k',
      icon: <ProviderIcon provider={AiProvider.MOONSHOT} size={16} />,
      placeholder: 'sk-...',
      example: 'sk-1234567890abcdef...',
      defaultModels: ['moonshot-v1-32k', 'moonshot-v1-8k', 'moonshot-v1-128k']
    },
    { 
      value: AiProvider.ZHIPU, 
      label: '智谱AI (GLM)', 
      description: 'GLM-4-Plus, GLM-4-0520, GLM-4-Flash',
      icon: <ProviderIcon provider={AiProvider.ZHIPU} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef.1234567890abcdef',
      defaultModels: ['glm-4-plus', 'glm-4-0520', 'glm-4-flash']
    },
    { 
      value: AiProvider.MINIMAX, 
      label: 'MiniMax', 
      description: 'ABAB6.5s, ABAB6.5g, ABAB5.5s',
      icon: <ProviderIcon provider={AiProvider.MINIMAX} size={16} />,
      placeholder: 'API Key',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      defaultModels: ['abab6.5s-chat', 'abab6.5g-chat', 'abab5.5s-chat']
    },
    { 
      value: AiProvider.AZURE, 
      label: 'Azure OpenAI', 
      description: '微软云端 AI 服务',
      icon: <ProviderIcon provider={AiProvider.AZURE} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef1234567890abcdef',
      defaultModels: ['gpt-4o', 'gpt-4', 'gpt-35-turbo']
    },
    { 
      value: AiProvider.COHERE, 
      label: 'Cohere', 
      description: 'Command R+, Command R, Command',
      icon: <ProviderIcon provider={AiProvider.COHERE} size={16} />,
      placeholder: 'API Key',
      example: 'co-1234567890abcdef...',
      defaultModels: ['command-r-plus', 'command-r', 'command']
    },
    { 
      value: AiProvider.HUGGINGFACE, 
      label: 'Hugging Face', 
      description: '开源模型平台',
      icon: <ProviderIcon provider={AiProvider.HUGGINGFACE} size={16} />,
      placeholder: 'hf_...',
      example: 'hf_1234567890abcdef...',
      defaultModels: ['meta-llama/Llama-3.1-8B-Instruct', 'microsoft/DialoGPT-medium']
    },
    { 
      value: AiProvider.CUSTOM, 
      label: '自定义端点', 
      description: '使用自定义API端点',
      icon: <ProviderIcon provider={AiProvider.CUSTOM} size={16} />,
      placeholder: 'API Key',
      example: 'your-custom-api-key',
      defaultModels: ['custom-model-1', 'custom-model-2']
    },
    { 
      value: AiProvider.REPLICATE, 
      label: 'Replicate', 
      description: 'Meta Llama, Mistral, CodeLlama',
      icon: <ProviderIcon provider={AiProvider.REPLICATE} size={16} />,
      placeholder: 'r8_...',
      example: 'r8_1234567890abcdef...',
      defaultModels: ['meta/llama-2-70b-chat', 'mistralai/mixtral-8x7b-instruct-v0.1']
    },
    { 
      value: AiProvider.TOGETHER, 
      label: 'Together AI', 
      description: 'Llama 2, Mixtral, CodeLlama',
      icon: <ProviderIcon provider={AiProvider.TOGETHER} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef1234567890abcdef',
      defaultModels: ['meta-llama/Llama-2-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1']
    },
    { 
      value: AiProvider.FIREWORKS, 
      label: 'Fireworks AI', 
      description: '快速推理优化模型',
      icon: <ProviderIcon provider={AiProvider.FIREWORKS} size={16} />,
      placeholder: 'fw_...',
      example: 'fw_1234567890abcdef...',
      defaultModels: ['accounts/fireworks/models/llama-v2-70b-chat', 'accounts/fireworks/models/mixtral-8x7b-instruct']
    },
    { 
      value: AiProvider.GROQ, 
      label: 'Groq', 
      description: '超快速LLM推理',
      icon: <ProviderIcon provider={AiProvider.GROQ} size={16} />,
      placeholder: 'gsk_...',
      example: 'gsk_1234567890abcdef...',
      defaultModels: ['llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']
    },
    { 
      value: AiProvider.PERPLEXITY, 
      label: 'Perplexity', 
      description: '在线搜索增强AI',
      icon: <ProviderIcon provider={AiProvider.PERPLEXITY} size={16} />,
      placeholder: 'pplx-...',
      example: 'pplx-1234567890abcdef...',
      defaultModels: ['llama-3-sonar-large-32k-online', 'llama-3-sonar-small-32k-online']
    },
    { 
      value: AiProvider.XAI, 
      label: 'xAI (Grok)', 
      description: 'Elon Musk的AI助手',
      icon: <ProviderIcon provider={AiProvider.XAI} size={16} />,
      placeholder: 'xai-...',
      example: 'xai-1234567890abcdef...',
      defaultModels: ['grok-beta', 'grok-vision-beta']
    },
    { 
      value: AiProvider.MISTRAL, 
      label: 'Mistral AI', 
      description: 'Mistral Large, Medium, Small',
      icon: <ProviderIcon provider={AiProvider.MISTRAL} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef1234567890abcdef',
      defaultModels: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest']
    },
    { 
      value: AiProvider.STABILITY, 
      label: 'Stability AI', 
      description: 'Stable Diffusion, Stable Code',
      icon: <ProviderIcon provider={AiProvider.STABILITY} size={16} />,
      placeholder: 'sk-...',
      example: 'sk-1234567890abcdef...',
      defaultModels: ['stable-diffusion-xl-1024-v1-0', 'stable-code-instruct-3b']
    },
    { 
      value: AiProvider.RUNWAY, 
      label: 'Runway ML', 
      description: '视频生成AI模型',
      icon: <ProviderIcon provider={AiProvider.RUNWAY} size={16} />,
      placeholder: 'API Key',
      example: 'rw_1234567890abcdef...',
      defaultModels: ['gen-2', 'gen-1']
    },
    { 
      value: AiProvider.DEEPSEEK, 
      label: 'DeepSeek', 
      description: 'DeepSeek Chat, DeepSeek Coder',
      icon: <ProviderIcon provider={AiProvider.DEEPSEEK} size={16} />,
      placeholder: 'sk-...',
      example: 'sk-1234567890abcdef...',
      defaultModels: ['deepseek-chat', 'deepseek-coder']
    },
    { 
      value: AiProvider.ONEAI, 
      label: '零一万物 (01.AI)', 
      description: 'Yi-34B Chat, Yi-VL',
      icon: <ProviderIcon provider={AiProvider.ONEAI} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['yi-34b-chat-0205', 'yi-34b-chat-200k', 'yi-vl-plus']
    },
    { 
      value: AiProvider.TENCENT, 
      label: '腾讯混元', 
      description: '混元大模型',
      icon: <ProviderIcon provider={AiProvider.TENCENT} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['hunyuan-lite', 'hunyuan-standard', 'hunyuan-pro']
    },
    { 
      value: AiProvider.IFLYTEK, 
      label: '科大讯飞星火', 
      description: '星火认知大模型',
      icon: <ProviderIcon provider={AiProvider.IFLYTEK} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['spark-3.5', 'spark-3.0', 'spark-2.0']
    },
    { 
      value: AiProvider.SENSETIME, 
      label: '商汤日日新', 
      description: 'SenseChat多模态大模型',
      icon: <ProviderIcon provider={AiProvider.SENSETIME} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['sensechat-5', 'sensechat-vision']
    },
    { 
      value: AiProvider.BYTEDANCE, 
      label: '字节云雀', 
      description: '字节跳动云雀大模型',
      icon: <ProviderIcon provider={AiProvider.BYTEDANCE} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['yunque-pro', 'yunque-lite']
    },
    { 
      value: AiProvider.LINGYI, 
      label: '零一万物', 
      description: 'Yi系列模型',
      icon: <ProviderIcon provider={AiProvider.LINGYI} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['yi-medium', 'yi-large']
    },
    { 
      value: AiProvider.BAICHUAN, 
      label: '百川智能', 
      description: 'Baichuan大模型',
      icon: <ProviderIcon provider={AiProvider.BAICHUAN} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['baichuan2-53b', 'baichuan2-13b']
    },
    { 
      value: AiProvider.KUNLUN, 
      label: '昆仑万维', 
      description: '天工SkyWork大模型',
      icon: <ProviderIcon provider={AiProvider.KUNLUN} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['skywork-13b', 'skywork-math']
    },
    { 
      value: AiProvider.ALIBABA_CLOUD, 
      label: '阿里云百炼', 
      description: '阿里云百炼平台',
      icon: <ProviderIcon provider={AiProvider.ALIBABA_CLOUD} size={16} />,
      placeholder: 'API Key',
      example: 'sk-1234567890abcdef...',
      defaultModels: ['qwen-max', 'qwen-plus', 'qwen-turbo']
    },
    { 
      value: AiProvider.HUAWEI, 
      label: '华为盘古', 
      description: '华为盘古大模型',
      icon: <ProviderIcon provider={AiProvider.HUAWEI} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['pangu-alpha', 'pangu-coder']
    },
    { 
      value: AiProvider.SILICONFLOW, 
      label: '硅基流动', 
      description: 'DeepSeek Chat, Qwen 72B, Llama 3',
      icon: <ProviderIcon provider={AiProvider.SILICONFLOW} size={16} />,
      placeholder: 'sk-...',
      example: 'sk-1234567890abcdef...',
      defaultModels: ['deepseek-chat', 'qwen-72b-chat', 'llama-3-8b-instruct', 'llama-3-70b-instruct', 'yi-1.5-34b-chat']
    },
    { 
      value: AiProvider.OLLAMA, 
      label: 'Ollama', 
      description: '本地部署AI模型平台',
      icon: <ProviderIcon provider={AiProvider.OLLAMA} size={16} />,
      placeholder: 'Bearer Token (可选)',
      example: 'ollama-1234567890abcdef...',
      defaultModels: ['llama3:8b', 'llama3:70b', 'mistral:7b', 'codellama:7b']
    },
    { 
      value: AiProvider.META, 
      label: 'Meta AI', 
      description: 'Meta开源Llama模型',
      icon: <ProviderIcon provider={AiProvider.META} size={16} />,
      placeholder: 'API Key',
      example: 'meta_1234567890abcdef...',
      defaultModels: ['llama-3-8b-instruct', 'llama-3-70b-instruct', 'llama-2-70b-chat']
    },
    { 
      value: AiProvider.COZE, 
      label: 'Coze', 
      description: '字节跳动AI Bot平台',
      icon: <ProviderIcon provider={AiProvider.COZE} size={16} />,
      placeholder: 'API Key',
      example: 'pat_1234567890abcdef...',
      defaultModels: ['coze-chat', 'coze-assistant', 'coze-bot']
    },
    { 
      value: AiProvider.GITHUB_COPILOT, 
      label: 'GitHub Copilot', 
      description: 'GitHub AI编程助手',
      icon: <ProviderIcon provider={AiProvider.GITHUB_COPILOT} size={16} />,
      placeholder: 'GitHub Token',
      example: 'ghp_1234567890abcdef...',
      defaultModels: ['gpt-4', 'copilot-code', 'copilot-chat']
    },
    { 
      value: AiProvider.CLINE, 
      label: 'Cline', 
      description: 'Cline AI编程助手',
      icon: <ProviderIcon provider={AiProvider.CLINE} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['cline-base', 'cline-advanced']
    },
    { 
      value: AiProvider.HUNYUAN, 
      label: '腾讯混元', 
      description: '腾讯混元大模型',
      icon: <ProviderIcon provider={AiProvider.HUNYUAN} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['hunyuan-lite', 'hunyuan-standard', 'hunyuan-pro']
    },
    { 
      value: AiProvider.YUANBAO, 
      label: '字节元宝', 
      description: '字节跳动元宝大模型',
      icon: <ProviderIcon provider={AiProvider.YUANBAO} size={16} />,
      placeholder: 'API Key',
      example: '1234567890abcdef...',
      defaultModels: ['yuanbao-base', 'yuanbao-pro']
    },
    { 
      value: AiProvider.VOLCENGINE, 
      label: '火山引擎', 
      description: '字节跳动火山引擎AI',
      icon: <ProviderIcon provider={AiProvider.VOLCENGINE} size={16} />,
      placeholder: 'API Key',
      example: 'volc-1234567890abcdef...',
      defaultModels: ['doubao-lite', 'doubao-pro']
    },
    { 
      value: AiProvider.MIDJOURNEY, 
      label: 'Midjourney', 
      description: 'AI图像生成平台',
      icon: <ProviderIcon provider={AiProvider.MIDJOURNEY} size={16} />,
      placeholder: 'API Key',
      example: 'mj-1234567890abcdef...',
      defaultModels: ['midjourney-v6', 'midjourney-v5', 'niji-6']
    },
  ];

  // 请求格式选项
  const formatOptions = [
    {
      value: RequestFormat.NATIVE,
      label: '原生格式',
      description: '使用服务商原生API格式',
      icon: <Settings className="w-4 h-4" />
    },
    {
      value: RequestFormat.OPENAI_COMPATIBLE,
      label: 'OpenAI兼容',
      description: '使用OpenAI兼容的API格式',
      icon: <Brain className="w-4 h-4" />
    }
  ];

  const currentProvider = providerOptions.find(p => p.value === provider);

  /**
   * 验证输入
   */
  const validateInput = useCallback((): string | null => {
    if (!apiKey.trim()) {
      return 'API Key不能为空';
    }

    if (apiKey.length < 8) {
      return 'API Key长度过短';
    }

    if (provider === AiProvider.CUSTOM && !customUrl.trim()) {
      return '自定义端点URL不能为空';
    }

    if (provider === AiProvider.CUSTOM && customUrl.trim()) {
      try {
        new URL(customUrl);
      } catch {
        return '自定义URL格式无效';
      }
    }

    return null;
  }, [apiKey, provider, customUrl]);

  /**
   * 执行检测
   */
  const handleDetect = useCallback(async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsDetecting(true);
    setError(null);
    setResult(null);

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      const detectionResult = await AIKeyValidator.validateKey(
        apiKey.trim(),
        provider,
        requestFormat,
        checkBalance,
        provider === AiProvider.CUSTOM ? customUrl.trim() : undefined
      );

      if (!abortControllerRef.current.signal.aborted) {
        setResult(detectionResult);
        onResult(detectionResult);
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : '检测失败';
        setError(errorMessage);
        
        const errorResult: ApiKeyValidationResult = {
          isValid: false,
          provider,
          status: KeyStatus.ERROR,
          message: errorMessage,
        };
        
        onResult(errorResult);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsDetecting(false);
      }
    }
  }, [apiKey, provider, customUrl, requestFormat, validateInput, onResult, checkBalance]);

  /**
   * 取消检测
   */
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsDetecting(false);
  }, []);

  /**
   * 重置表单
   */
  const handleReset = useCallback(() => {
    setApiKey('');
    setCustomUrl('');
    setTestModel('');
    setRequestFormat(RequestFormat.NATIVE);
    setCheckBalance(false);
    setResult(null);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsDetecting(false);
  }, []);

  /**
   * 获取结果状态图标
   */
  const getResultIcon = () => {
    if (!result) return null;

    switch (result.status) {
      case KeyStatus.VALID:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case KeyStatus.INVALID:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case KeyStatus.ERROR:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  /**
   * 模型详情弹窗组件
   */
  const ModelDetailsModal = () => {
    if (!currentProvider || !showModelDetails) return null;

    // 获取实际返回的模型和默认模型
    const actualModels = result?.details?.models || [];
    const defaultModels = currentProvider.defaultModels || [];
    const hasActualModels = actualModels.length > 0;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModelDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <ProviderIcon provider={provider} size={20} />
                <span>{currentProvider.label} 模型</span>
              </h3>
              <button
                onClick={() => setShowModelDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentProvider.description}
              </p>
              
              {/* 实际返回的模型 */}
              {hasActualModels && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      API返回的可用模型 ({actualModels.length}个)
                    </h4>
                  </div>
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {actualModels.map((model, index) => (
                      <motion.button
                        key={`actual-${model}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => {
                          setTestModel(model);
                          setShowModelDetails(false);
                          setShowAdvanced(true);
                        }}
                        className="text-left p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300">
                            {model}
                          </div>
                          <Plus className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ 这些是您的API Key实际可以访问的模型
                  </p>
                </div>
              )}
              
              {/* 默认模型列表 */}
              {defaultModels.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="w-4 h-4 text-blue-500" />
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {hasActualModels ? '参考模型列表' : '默认模型列表'} ({defaultModels.length}个)
                    </h4>
                  </div>
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {defaultModels.map((model, index) => (
                      <motion.button
                        key={`default-${model}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (hasActualModels ? actualModels.length : 0 + index) * 0.03 }}
                        onClick={() => {
                          setTestModel(model);
                          setShowModelDetails(false);
                          setShowAdvanced(true);
                        }}
                        className="text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            {model}
                          </div>
                          <Plus className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    {hasActualModels 
                      ? 'ℹ️ 这些是常用的模型，可能需要额外权限'
                      : 'ℹ️ 这些是该服务商的常用模型'
                    }
                  </p>
                </div>
              )}
              
              {/* 没有任何模型数据的情况 */}
              {!hasActualModels && defaultModels.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    暂无模型信息
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p className="mb-1">• 点击模型名称可快速设置为测试模型</p>
                    <p className="mb-1">• 绿色标记的是您的API Key实际可用的模型</p>
                    <p>• 蓝色标记的是参考模型，可能需要特定权限</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        
        {/* 标题和项目链接 */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            >
              <Key className="w-8 h-8 text-white" strokeWidth={2} />
            </motion.div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              单个Key检测
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              验证单个API Key的有效性和账户信息
            </p>
          </div>
        </div>

        {/* 表单 */}
        <div className="space-y-6">
          
          {/* 服务商选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              选择服务商
            </label>
            <Select
              options={providerOptions}
              value={provider}
              onChange={(value) => {
                setProvider(value as AiProvider);
                setError(null);
                setResult(null);
                setApiKey('');
                setCustomUrl('');
                setTestModel('');
                setRequestFormat(RequestFormat.NATIVE);
              }}
              placeholder="选择AI服务提供商"
              className="w-full"
              searchable
            />
          </div>

          {/* API Key输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                  setResult(null);
                }}
                placeholder={currentProvider?.placeholder || '输入您的API Key'}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isDetecting}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {showKey ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {currentProvider?.example && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                示例: {currentProvider.example}
              </p>
            )}
          </div>

          {/* 请求格式选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              请求格式
            </label>
            <Select
              options={formatOptions}
              value={requestFormat}
              onChange={(value) => {
                setRequestFormat(value as RequestFormat);
                setError(null);
                setResult(null);
              }}
              placeholder="选择请求格式"
              className="w-full"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {requestFormat === RequestFormat.NATIVE 
                ? '使用服务商的原生API格式，通常提供更好的兼容性'
                : '使用OpenAI兼容格式，适用于代理服务或统一接口'
              }
            </p>
          </div>

          {/* 高级设置 */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>高级设置</span>
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-4"
                >
                  
                  {/* 余额查询开关 */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-gray-400" />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          查询账户余额
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCheckBalance(!checkBalance)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          checkBalance 
                            ? 'bg-blue-600' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        disabled={isDetecting}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            checkBalance ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {checkBalance 
                        ? '✓ 将查询API Key的账户余额信息（仅支持部分服务商）'
                        : '○ 不查询余额信息，仅验证API Key有效性'
                      }
                    </p>
                  </div>
                  
                  {/* 测试模型输入 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        测试模型 (可选)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowModelDetails(true)}
                        className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        <List className="w-3 h-3" />
                        <span>查看模型列表</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={testModel}
                        onChange={(e) => {
                          setTestModel(e.target.value);
                          setError(null);
                          setResult(null);
                        }}
                        placeholder={currentProvider?.defaultModels?.[0] || '输入模型名称...'}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        disabled={isDetecting}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      留空则使用默认模型进行测试
                    </p>
                  </div>
                  
                  {/* 自定义URL输入 */}
                  {provider === AiProvider.CUSTOM && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        自定义端点URL
                      </label>
                      <div className="relative">
                        <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          value={customUrl}
                          onChange={(e) => {
                            setCustomUrl(e.target.value);
                            setError(null);
                            setResult(null);
                          }}
                          placeholder="https://api.example.com/v1/chat/completions"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          disabled={isDetecting}
                        />
                      </div>
                    </div>
                  )}
                  
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 错误提示 */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 检测结果 */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-6 rounded-xl border ${
                  result.isValid
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getResultIcon()}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      result.isValid 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {result.isValid ? '✅ API Key有效' : '❌ API Key无效'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      result.isValid 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.message}
                    </p>
                    
                    {/* 详细信息 */}
                    <div className="mt-3 space-y-2">
                      {result.responseTime && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Zap className="w-3 h-3" />
                          <span>响应时间: {result.responseTime}ms</span>
                        </div>
                      )}
                      
                      {result.details?.balance !== undefined && (
                        <div className="flex items-center space-x-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                          <Database className="w-4 h-4" />
                          <span>账户余额: ${typeof result.details.balance === 'number' ? result.details.balance.toFixed(2) : result.details.balance}</span>
                        </div>
                      )}
                      
                      {result.details?.usage && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Cpu className="w-3 h-3" />
                          <span>使用量: {JSON.stringify(result.details.usage)}</span>
                        </div>
                      )}
                      
                      {result.details?.organization && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Globe className="w-3 h-3" />
                          <span>组织: {result.details.organization}</span>
                        </div>
                      )}
                      
                      {/* 硅基流动账户信息 */}
                      {result.provider === AiProvider.SILICONFLOW && result.details?.accountInfo && (
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center space-x-2 mb-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">硅基流动账户信息</span>
                          </div>
                          <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                            {result.details.accountInfo.userId && (
                              <div>用户ID: {result.details.accountInfo.userId}</div>
                            )}
                            {result.details.accountInfo.username && (
                              <div>用户名: {result.details.accountInfo.username}</div>
                            )}
                            {result.details.accountInfo.email && (
                              <div>邮箱: {result.details.accountInfo.email}</div>
                            )}
                            {result.details.accountInfo.role && (
                              <div>角色: {result.details.accountInfo.role}</div>
                            )}
                            {result.details.accountInfo.status && (
                              <div>状态: {result.details.accountInfo.status}</div>
                            )}
                            {result.details.accountInfo.isAdmin !== undefined && (
                              <div>管理员: {result.details.accountInfo.isAdmin ? '是' : '否'}</div>
                            )}
                            {result.details.accountInfo.balanceDetails && (
                              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                                <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">余额明细:</div>
                                <div>总余额: ¥{result.details.accountInfo.balanceDetails.totalBalance}</div>
                                <div>可用余额: ¥{result.details.accountInfo.balanceDetails.balance}</div>
                                <div>充值余额: ¥{result.details.accountInfo.balanceDetails.chargeBalance}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 可用模型列表 */}
                    {result.details?.models && result.details.models.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            可用模型 ({result.details.models.length}个):
                          </p>
                          <button
                            onClick={() => setShowModelDetails(true)}
                            className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                          >
                            <Info className="w-3 h-3" />
                            <span>查看详情</span>
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {result.details.models.slice(0, 4).map((model, index) => (
                            <motion.button
                              key={model}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => {
                                setTestModel(model);
                                setShowAdvanced(true);
                              }}
                              className="group px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                            >
                              <div className="flex items-center space-x-1">
                                <span className="font-mono text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  {model}
                                </span>
                                <Plus className="w-3 h-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                              </div>
                            </motion.button>
                          ))}
                          
                          {result.details.models.length > 4 && (
                            <button
                              onClick={() => setShowModelDetails(true)}
                              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                            >
                              +{result.details.models.length - 4} 更多
                            </button>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          点击模型名称可设置为测试模型
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <motion.button
              onClick={isDetecting ? handleCancel : handleDetect}
              disabled={!apiKey.trim() || (provider === AiProvider.CUSTOM && !customUrl.trim())}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                isDetecting
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>取消检测</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>开始检测</span>
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              重置
            </motion.button>
          </div>
        </div>
      </div>
      <ModelDetailsModal />
    </motion.div>
  );
}; 