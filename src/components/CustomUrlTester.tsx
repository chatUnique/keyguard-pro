import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Plus, 
  Trash2, 
  Settings, 
  Code, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  Download,
  FileText,
  Globe,
  Key,
  MoreVertical,
  Upload,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  CustomUrlTesterProps, 
  CustomRequest, 
  CustomResponse, 
  HttpMethod, 
  Template, 
  TemplateCategory,
  AiProvider
} from '@/types';
import Select from './ui/Select';
import { useTemplates } from '@/hooks/useTemplates';
import { ProviderIcon } from './ProviderIcon';

/**
 * 自定义URL测试组件
 */
export const CustomUrlTester: React.FC<CustomUrlTesterProps> = ({ onResult }) => {
  const [request, setRequest] = useState<CustomRequest>({
    url: '',
    method: HttpMethod.POST,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: '{\n  "model": "gpt-3.5-turbo",\n  "messages": [\n    {\n      "role": "user",\n      "content": "Hello!"\n    }\n  ],\n  "max_tokens": 100\n}',
    timeout: 30000,
    variables: {}
  });

  const [response, setResponse] = useState<CustomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newVariableKey, setNewVariableKey] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');

  const { 
    templates, 
    saveTemplate, 
    loadTemplate, 
    getTemplatesByCategory 
  } = useTemplates();

  // HTTP方法选项
  const methodOptions = [
    { value: HttpMethod.GET, label: 'GET', icon: <Globe className="w-4 h-4" /> },
    { value: HttpMethod.POST, label: 'POST', icon: <FileText className="w-4 h-4" /> },
    { value: HttpMethod.PUT, label: 'PUT', icon: <Settings className="w-4 h-4" /> },
    { value: HttpMethod.DELETE, label: 'DELETE', icon: <Trash2 className="w-4 h-4" /> },
    { value: HttpMethod.PATCH, label: 'PATCH', icon: <Code className="w-4 h-4" /> },
  ];

  // 预设模板
  const presetTemplates = [
    {
      id: 'google-ai-models',
      name: 'Google AI - 获取模型列表',
      description: 'Google AI API 模型列表查询',
      provider: AiProvider.GOOGLE,
      category: 'models',
      request: {
        url: 'https://generativelanguage.googleapis.com/v1/models?key={{API_KEY}}',
        method: HttpMethod.GET,
        headers: {} as Record<string, string>,
        body: '',
        timeout: 30000,
        variables: { 'API_KEY': '' }
      }
    },
    {
      id: 'google-ai-chat',
      name: 'Google AI - 对话测试',
      description: 'Google AI API 对话接口测试',
      provider: AiProvider.GOOGLE,
      category: 'chat',
      request: {
        url: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={{API_KEY}}',
        method: HttpMethod.POST,
        headers: { 'Content-Type': 'application/json' } as Record<string, string>,
        body: '{\n  "contents": [{\n    "parts": [{\n      "text": "Hello! How are you?"\n    }]\n  }]\n}',
        timeout: 30000,
        variables: { 'API_KEY': '' }
      }
    },
    {
      id: 'openai-models',
      name: 'OpenAI - 获取模型列表',
      description: 'OpenAI API 模型列表查询',
      provider: AiProvider.OPENAI,
      category: 'models',
      request: {
        url: 'https://api.openai.com/v1/models',
        method: HttpMethod.GET,
        headers: { 'Authorization': 'Bearer {{API_KEY}}' } as Record<string, string>,
        body: '',
        timeout: 30000,
        variables: { 'API_KEY': '' }
      }
    },
    {
      id: 'anthropic-messages',
      name: 'Anthropic - 消息测试',
      description: 'Anthropic Claude API 消息接口测试',
      provider: AiProvider.ANTHROPIC,
      category: 'chat',
      request: {
        url: 'https://api.anthropic.com/v1/messages',
        method: HttpMethod.POST,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '{{API_KEY}}',
          'anthropic-version': '2023-06-01'
        } as Record<string, string>,
        body: '{\n  "model": "claude-3-sonnet-20240229",\n  "max_tokens": 1024,\n  "messages": [\n    {\n      "role": "user",\n      "content": "Hello, Claude!"\n    }\n  ]\n}',
        timeout: 30000,
        variables: { 'API_KEY': '' }
      }
    }
  ];

  // 获取模板图标和样式
  const getTemplateIcon = (templateId: string) => {
    if (templateId.includes('google-ai')) {
      return <ProviderIcon provider={AiProvider.GOOGLE} size={16} />;
    } else if (templateId.includes('openai')) {
      return <ProviderIcon provider={AiProvider.OPENAI} size={16} />;
    } else if (templateId.includes('anthropic')) {
      return <ProviderIcon provider={AiProvider.ANTHROPIC} size={16} />;
    } else if (templateId.includes('models')) {
      return <Globe className="w-4 h-4 text-blue-500" />;
    } else if (templateId.includes('chat')) {
      return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  // 获取模板前缀
  const getTemplatePrefix = (templateId: string) => {
    if (templateId.includes('google-ai')) {
      return '🟦'; // Google 蓝色
    } else if (templateId.includes('openai')) {
      return '⚫'; // OpenAI 黑色
    } else if (templateId.includes('anthropic')) {
      return '🟤'; // Anthropic 橙色
    }
    return '📋'; // 默认
  };

  // 模板选项（包含预设模板和用户自定义模板）
  const templateOptions = [
    { 
      value: '', 
      label: '选择模板...', 
      icon: <FileText className="w-4 h-4 text-gray-400" />,
      description: '选择一个预设或自定义模板'
    },
    // 预设模板
    ...presetTemplates.map(template => {
      let icon = <FileText className="w-4 h-4" />;
      
      // 根据服务商和功能类型设置图标
      if (template.id === 'google-ai-models') {
        icon = (
          <div className="flex items-center space-x-1">
            <ProviderIcon provider={AiProvider.GOOGLE} size={14} />
            <Globe className="w-3 h-3 text-blue-500" />
          </div>
        );
      } else if (template.id === 'google-ai-chat') {
        icon = (
          <div className="flex items-center space-x-1">
            <ProviderIcon provider={AiProvider.GOOGLE} size={14} />
            <Sparkles className="w-3 h-3 text-purple-500" />
          </div>
        );
      } else if (template.id === 'openai-models') {
        icon = (
          <div className="flex items-center space-x-1">
            <ProviderIcon provider={AiProvider.OPENAI} size={14} />
            <Globe className="w-3 h-3 text-green-500" />
          </div>
        );
      } else if (template.id === 'anthropic-messages') {
        icon = (
          <div className="flex items-center space-x-1">
            <ProviderIcon provider={AiProvider.ANTHROPIC} size={14} />
            <Zap className="w-3 h-3 text-orange-500" />
          </div>
        );
      }

      return {
        value: `preset:${template.id}`,
        label: template.name,
        description: template.description,
        icon
      };
    }),
    // 用户模板
    ...templates.map(template => ({
      value: template.id,
      label: `👤 ${template.name}`,
      description: template.description || '用户自定义模板',
      icon: <FileText className="w-4 h-4 text-indigo-500" />
    }))
  ];

  /**
   * 执行请求
   */
  const handleExecuteRequest = useCallback(async () => {
    if (!request.url.trim()) {
      alert('请输入有效的URL');
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const startTime = Date.now();
      
      // 替换变量
      let processedUrl = request.url;
      let processedBody = request.body;
      let processedHeaders = { ...request.headers };

      // 替换URL中的变量
      Object.entries(request.variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        processedUrl = processedUrl.replace(new RegExp(placeholder, 'g'), value);
        processedBody = processedBody?.replace(new RegExp(placeholder, 'g'), value) || '';
        
        // 替换headers中的变量
        Object.keys(processedHeaders).forEach(headerKey => {
          processedHeaders[headerKey] = processedHeaders[headerKey].replace(
            new RegExp(placeholder, 'g'), 
            value
          );
        });
      });

      // 构建fetch配置
      const fetchConfig: RequestInit = {
        method: request.method,
        headers: processedHeaders,
        signal: AbortSignal.timeout(request.timeout),
      };

      // 添加body（GET请求除外）
      if (request.method !== HttpMethod.GET && processedBody) {
        fetchConfig.body = processedBody;
      }

      // 执行请求
      const fetchResponse = await fetch(processedUrl, fetchConfig);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 解析响应
      let responseBody;
      const contentType = fetchResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseBody = await fetchResponse.json();
      } else {
        responseBody = await fetchResponse.text();
      }

      // 构建响应对象
      const customResponse: CustomResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: Object.fromEntries(fetchResponse.headers.entries()),
        body: responseBody,
        responseTime,
      };

      setResponse(customResponse);
      onResult(customResponse);

    } catch (error) {
      const errorResponse: CustomResponse = {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: null,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      setResponse(errorResponse);
      onResult(errorResponse);
    } finally {
      setIsLoading(false);
    }
  }, [request, onResult]);

  /**
   * 添加请求头
   */
  const addHeader = useCallback(() => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setRequest(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [newHeaderKey.trim()]: newHeaderValue.trim()
        }
      }));
      setNewHeaderKey('');
      setNewHeaderValue('');
    } else {
      alert('请填写完整的Header名称和值');
    }
  }, [newHeaderKey, newHeaderValue]);

  /**
   * 删除请求头
   */
  const removeHeader = useCallback((key: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  }, []);

  /**
   * 添加变量
   */
  const addVariable = useCallback(() => {
    if (newVariableKey.trim() && newVariableValue.trim()) {
      setRequest(prev => ({
        ...prev,
        variables: {
          ...prev.variables,
          [newVariableKey.trim()]: newVariableValue.trim()
        }
      }));
      setNewVariableKey('');
      setNewVariableValue('');
    } else {
      alert('请填写完整的变量名和变量值');
    }
  }, [newVariableKey, newVariableValue]);

  /**
   * 删除变量
   */
  const removeVariable = useCallback((key: string) => {
    setRequest(prev => {
      const newVariables = { ...prev.variables };
      delete newVariables[key];
      return { ...prev, variables: newVariables };
    });
  }, []);

  /**
   * 加载模板
   */
  const handleLoadTemplate = useCallback((templateId: string) => {
    if (!templateId) return;
    
    // 检查是否是预设模板
    if (templateId.startsWith('preset:')) {
      const presetId = templateId.replace('preset:', '');
      const presetTemplate = presetTemplates.find(t => t.id === presetId);
      if (presetTemplate) {
        setRequest(presetTemplate.request);
      }
    } else {
      // 用户自定义模板
      const template = loadTemplate(templateId);
      if (template) {
        setRequest(template.request);
      }
    }
  }, [loadTemplate, presetTemplates]);

  /**
   * 保存为模板
   */
  const handleSaveTemplate = useCallback(() => {
    const name = prompt('请输入模板名称:');
    if (!name) return;

    const description = prompt('请输入模板描述（可选）:') || '';
    
    saveTemplate({
      name,
      description,
      category: TemplateCategory.CUSTOM,
      request
    });

    alert('模板保存成功！');
  }, [request, saveTemplate]);

  /**
   * 复制响应内容
   */
  const copyResponse = useCallback(() => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
      alert('响应内容已复制到剪贴板');
    }
  }, [response]);

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 400) return 'text-red-600 dark:text-red-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* 请求配置 */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            请求配置
          </h3>
          
          <div className="flex items-center space-x-3">
            <Select
              options={templateOptions}
              value=""
              onChange={handleLoadTemplate}
              placeholder="加载模板"
              className="w-40"
            />
            
            <button
              onClick={handleSaveTemplate}
              className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
            >
              保存模板
            </button>
          </div>
        </div>

        {/* URL和方法 */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              HTTP方法
            </label>
            <Select
              options={methodOptions}
              value={request.method}
              onChange={(value) => setRequest(prev => ({ ...prev, method: value as HttpMethod }))}
              placeholder="选择方法"
              className="w-full [&>button]:!h-10 [&>button]:!py-2"
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              请求URL
            </label>
            <input
              type="text"
              value={request.url}
              onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.example.com/v1/chat/completions"
              className="w-full h-10 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* 请求体 */}
        {request.method !== HttpMethod.GET && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              请求体 (JSON)
            </label>
            <textarea
              value={request.body || ''}
              onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
              placeholder="请输入JSON格式的请求体..."
              className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
            />
          </div>
        )}

        {/* 高级设置 */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-4"
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
                className="space-y-6"
              >
                {/* 请求头 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    请求头
                  </h4>
                  
                  <div className="space-y-2 mb-3">
                    {Object.entries(request.headers).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            setRequest(prev => {
                              const newHeaders = { ...prev.headers };
                              delete newHeaders[key];
                              newHeaders[newKey] = value;
                              return { ...prev, headers: newHeaders };
                            });
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        />
                        <span className="text-gray-400">:</span>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setRequest(prev => ({
                            ...prev,
                            headers: { ...prev.headers, [key]: e.target.value }
                          }))}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => removeHeader(key)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newHeaderKey}
                      onChange={(e) => setNewHeaderKey(e.target.value)}
                      placeholder="Header名称"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addHeader();
                        }
                      }}
                    />
                    <span className="text-gray-400">:</span>
                    <input
                      type="text"
                      value={newHeaderValue}
                      onChange={(e) => setNewHeaderValue(e.target.value)}
                      placeholder="Header值"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addHeader();
                        }
                      }}
                    />
                    <button
                      onClick={addHeader}
                      disabled={!newHeaderKey.trim() || !newHeaderValue.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="添加Header"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 变量 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    变量 (使用 {`{{变量名}}`} 格式)
                  </h4>
                  
                  <div className="space-y-2 mb-3">
                    {Object.entries(request.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
                          {`{{${key}}}`}
                        </div>
                        <span className="text-gray-400">=</span>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setRequest(prev => ({
                            ...prev,
                            variables: { ...prev.variables, [key]: e.target.value }
                          }))}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => removeVariable(key)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                          title="删除变量"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newVariableKey}
                      onChange={(e) => setNewVariableKey(e.target.value)}
                      placeholder="变量名"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addVariable();
                        }
                      }}
                    />
                    <span className="text-gray-400">=</span>
                    <input
                      type="text"
                      value={newVariableValue}
                      onChange={(e) => setNewVariableValue(e.target.value)}
                      placeholder="变量值"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addVariable();
                        }
                      }}
                    />
                    <button
                      onClick={addVariable}
                      disabled={!newVariableKey.trim() || !newVariableValue.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="添加变量"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 添加预设变量的说明 */}
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      <strong>内置变量：</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <span>• {`{{TIMESTAMP}}`} - 当前时间戳</span>
                      <span>• {`{{ISO_DATE}}`} - ISO格式日期</span>
                      <span>• {`{{UNIX_TIME}}`} - Unix时间戳</span>
                      <span>• {`{{RANDOM}}`} - 随机字符串</span>
                      <span>• {`{{UUID}}`} - UUID</span>
                    </div>
                  </div>
                </div>

                {/* 超时设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    超时时间 (毫秒)
                  </label>
                  <input
                    type="number"
                    value={request.timeout}
                    onChange={(e) => setRequest(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
                    min="1000"
                    max="300000"
                    className="w-full h-10 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 执行按钮 */}
        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={handleExecuteRequest}
            disabled={isLoading || !request.url.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-5 h-5" />
              </motion.div>
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>{isLoading ? '执行中...' : '发送请求'}</span>
          </button>
        </div>
      </div>

      {/* 响应结果 */}
      {response && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              响应结果
            </h3>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {response.status >= 200 && response.status < 300 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : response.status >= 400 ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                )}
                <span className={`text-sm font-medium ${getStatusColor(response.status)}`}>
                  {response.status} {response.statusText}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {response.responseTime}ms
              </div>
              
              <button
                onClick={copyResponse}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 响应内容 */}
          <div className="space-y-4">
            {response.error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-800 dark:text-red-200">请求失败</span>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm">{response.error}</p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">响应体</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap">
                    {typeof response.body === 'string' 
                      ? response.body 
                      : JSON.stringify(response.body, null, 2)
                    }
                  </pre>
                </div>
              </div>
            )}

            {/* 响应头 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">响应头</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="space-y-1">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-0 flex-shrink-0 mr-2">
                        {key}:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white break-all">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 