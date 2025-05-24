import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Globe, 
  Loader2, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Settings,
  Info,
  RefreshCw,
  Zap
} from 'lucide-react';
import { AIProxyClient } from '@/utils/proxyFetch';

interface NetworkStatusProps {
  onStatusChange?: (status: NetworkStatus) => void;
  className?: string;
}

interface NetworkStatus {
  direct: boolean;
  proxy: boolean;
  recommended: 'direct' | 'proxy';
  isChecking: boolean;
  lastCheck?: Date;
  progress?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  onStatusChange, 
  className = '' 
}) => {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<NetworkStatus>({
    direct: false,
    proxy: false,
    recommended: 'direct',
    isChecking: false,
  });
  const [proxyConfig, setProxyConfig] = useState<any>(null);

  const [showDetails, setShowDetails] = useState(false);

  // 客户端挂载后设置mounted状态
  useEffect(() => {
    setMounted(true);
    
    // 读取代理配置
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('keyguard-proxy-config');
      if (saved) {
        try {
          setProxyConfig(JSON.parse(saved));
        } catch (e) {
          console.warn('Failed to parse proxy config:', e);
        }
      }
    }
  }, []);

  const checkConnectivity = useCallback(async (forceRefresh: boolean = false) => {
    setStatus(prev => ({ ...prev, isChecking: true, progress: '开始检测...' }));

    try {
      // 优化：如果不是强制刷新，首先检查缓存
      if (!forceRefresh) {
        setStatus(prev => ({ ...prev, progress: '检查缓存...' }));
      } else {
        setStatus(prev => ({ ...prev, progress: '强制检测网络...' }));
      }
      
      const proxyClient = new AIProxyClient();
      
      setStatus(prev => ({ ...prev, progress: '测试网络连接...' }));
      
      const result = await proxyClient.testConnectivity(forceRefresh);
      
      const newStatus: NetworkStatus = {
        ...result,
        isChecking: false,
        lastCheck: new Date(),
        progress: undefined,
      };
      
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      
      // 将网络状态保存到全局存储
      if (typeof window !== 'undefined') {
        window.networkStatus = newStatus;
        // 触发网络状态更新事件
        window.dispatchEvent(new CustomEvent('network-status-changed', { 
          detail: newStatus 
        }));
      }
    } catch (error) {
      const errorStatus: NetworkStatus = {
        direct: false,
        proxy: false,
        recommended: 'proxy',
        isChecking: false,
        lastCheck: new Date(),
        progress: undefined,
      };
      
      setStatus(errorStatus);
      onStatusChange?.(errorStatus);
      
      // 保存错误状态
      if (typeof window !== 'undefined') {
        window.networkStatus = errorStatus;
        window.dispatchEvent(new CustomEvent('network-status-changed', { 
          detail: errorStatus 
        }));
      }
    }
  }, [onStatusChange]);

  useEffect(() => {
    // 智能初始化：优先使用缓存，然后快速检测
    const initializeNetworkStatus = async () => {
      // 首先尝试从缓存加载
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('network-connectivity-cache');
        if (cached) {
          try {
            const { result, timestamp } = JSON.parse(cached);
            const cacheAge = Date.now() - timestamp;
            
            // 如果缓存在2分钟内，直接使用
            if (cacheAge < 2 * 60 * 1000) {
              const newStatus = { ...result, isChecking: false, lastCheck: new Date(timestamp) };
              setStatus(newStatus);
              onStatusChange?.(newStatus);
              
              // 保存到全局状态
              window.networkStatus = newStatus;
              window.dispatchEvent(new CustomEvent('network-status-changed', { 
                detail: newStatus
              }));
              return;
            }
          } catch (e) {
            // 缓存损坏，继续正常检测
          }
        }
      }
      
      // 如果没有有效缓存，进行正常检测
      checkConnectivity(false);
    };

    initializeNetworkStatus();
  }, [checkConnectivity, onStatusChange]);

  // 监听代理配置变化
  useEffect(() => {
    const handleProxyConfigChange = (event: any) => {
      // 更新本地配置状态
      setProxyConfig(event.detail);
      // 当代理配置更改时，重新检测网络
      checkConnectivity(false);
    };

    const handleStorageChange = () => {
      // 监听localStorage变化，更新配置状态
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('keyguard-proxy-config');
        if (saved) {
          try {
            setProxyConfig(JSON.parse(saved));
          } catch (e) {
            console.warn('Failed to parse proxy config:', e);
          }
        }
      }
    };

    window.addEventListener('proxy-config-changed', handleProxyConfigChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('proxy-config-changed', handleProxyConfigChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkConnectivity]);

  const getStatusIcon = () => {
    if (status.isChecking) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-blue-400" />;
    }

    if (status.direct && status.proxy) {
      return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />;
    }

    if (status.direct || status.proxy) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
    }

    return <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
  };

  const getStatusText = () => {
    if (status.isChecking) {
      return status.progress || '检测网络连接...';
    }

    // 检查用户的代理设置
    let userConfig = null;
    if (typeof window !== 'undefined' && mounted) {
      const saved = localStorage.getItem('keyguard-proxy-config');
      if (saved) {
        try {
          userConfig = JSON.parse(saved);
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    // 根据用户设置调整状态文本
    if (userConfig && userConfig.forceProxy) {
      if (status.proxy) {
        return '强制代理模式 - 运行正常';
      } else {
        return '强制代理模式 - 连接失败';
      }
    }

    if (userConfig && !userConfig.enabled) {
      if (status.direct) {
        return '直连模式 - 运行正常';
      } else {
        return '直连模式 - 连接失败';
      }
    }

    // 自动模式的状态文本
    if (status.direct && status.proxy) {
      return '网络连接良好';
    }

    if (status.direct) {
      return '直连可用';
    }

    if (status.proxy) {
      return '代理连接可用';
    }

    return '网络连接异常';
  };

  const getStatusColor = () => {
    if (status.isChecking) {
      return 'border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20';
    }
    if (status.direct && status.proxy) {
      return 'border-green-200 dark:border-green-700/50 bg-green-50 dark:bg-green-900/20';
    }
    if (status.direct || status.proxy) {
      return 'border-yellow-200 dark:border-yellow-700/50 bg-yellow-50 dark:bg-yellow-900/20';
    }
    return 'border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20';
  };

  const getRecommendation = () => {
    // 检查用户的代理设置
    let userConfig = null;
    if (typeof window !== 'undefined' && mounted) {
      const saved = localStorage.getItem('keyguard-proxy-config');
      if (saved) {
        try {
          userConfig = JSON.parse(saved);
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    if (!status.direct && !status.proxy) {
      return '网络连接异常，请检查网络设置或稍后重试。';
    }

    // 检查是否是用户强制设置
    if (userConfig && !userConfig.enabled) {
      return '✅ 代理已禁用，正在使用直连模式。API验证将直接连接到服务器。';
    }

    if (userConfig && userConfig.forceProxy) {
      if (status.proxy) {
        return '🚀 强制代理模式已启用，所有请求将通过代理服务器转发。代理连接正常。';
      } else {
        return '⚠️ 强制代理模式已启用，但代理连接测试失败。请检查网络或切换到其他模式。';
      }
    }

    if (status.direct && !status.proxy) {
      return '✅ 正在使用直连模式，网络连接稳定。API验证将直接连接到服务器。';
    }

    if (!status.direct && status.proxy) {
      return '🚀 正在使用代理模式，通过我们的服务器转发请求。适合网络受限环境。';
    }

    return '🎯 网络连接良好，系统将根据实际测试结果智能选择最佳连接方式。';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${className}`}
    >
      <div className={`p-4 border rounded-xl ${getStatusColor()} backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={status.isChecking ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: status.isChecking ? Infinity : 0, ease: "linear" }}
            >
              {getStatusIcon()}
            </motion.div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {getStatusText()}
              </div>
              {status.lastCheck && mounted && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  最后检测: {status.lastCheck.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => checkConnectivity(true)}
              disabled={status.isChecking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status.isChecking ? 'animate-spin' : ''}`} />
              <span>重新检测</span>
            </motion.button>

            {!status.isChecking && (
              <motion.button
                onClick={async () => {
                  setStatus(prev => ({ ...prev, isChecking: true, progress: '快速检测中...' }));
                  try {
                    // 使用缓存的结果或快速检测
                    const cached = typeof window !== 'undefined' ? sessionStorage.getItem('network-connectivity-cache') : null;
                    if (cached) {
                      try {
                        const { result } = JSON.parse(cached);
                        const newStatus = { ...result, isChecking: false, lastCheck: new Date(), progress: undefined };
                        setStatus(newStatus);
                        onStatusChange?.(newStatus);
                        
                        // 更新全局状态
                        if (typeof window !== 'undefined') {
                          window.networkStatus = newStatus;
                          window.dispatchEvent(new CustomEvent('network-status-changed', { 
                            detail: newStatus 
                          }));
                        }
                        return;
                      } catch (e) {
                        // 缓存失败，继续快速检测
                      }
                    }
                    // 如果没有缓存，执行正常检测
                    await checkConnectivity(false);
                  } catch (error) {
                    setStatus(prev => ({ ...prev, isChecking: false, progress: undefined }));
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center space-x-1 px-2 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
              >
                <Zap className="w-3 h-3" />
                <span>快速</span>
              </motion.button>
            )}
            
            <motion.button
              onClick={() => setShowDetails(!showDetails)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <Info className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>连接状态详情：</strong>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div 
                      className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Globe className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">直连</span>
                          {status.direct ? (
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {status.direct ? '可用' : '不可用'}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Zap className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">代理</span>
                          {status.proxy ? (
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {status.proxy ? '可用' : '不可用'}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div 
                    className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>建议：</strong> {getRecommendation()}
                      </div>
                    </div>
                  </motion.div>

                  {(!status.direct && status.proxy) && (
                    <motion.div 
                      className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>注意：</strong> 
                          检测到您在中国境内网络环境，AI API请求将通过我们的代理服务器转发，
                          这可以确保稳定访问各种AI服务。
                          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded border border-yellow-200 dark:border-yellow-700/30">
                            <strong className="text-yellow-900 dark:text-yellow-100">🔒 隐私保护：</strong>
                            <span className="text-yellow-800 dark:text-yellow-200"> 代理服务器仅转发请求，不记录任何API Key或敏感数据</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 安全保障说明 */}
                  <motion.div 
                    className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-sm text-green-800 dark:text-green-200">
                      <strong className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>安全保障：</span>
                      </strong>
                      <div className="mt-1 text-xs space-y-1 text-green-700 dark:text-green-300">
                        <div>• 所有API Key验证均在您的浏览器本地执行</div>
                        <div>• 代理服务器仅负责转发，不存储任何敏感信息</div>
                        <div>• 验证完成后立即清空内存中的密钥引用</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* 当前代理配置显示 */}
                  {mounted && (
                    <motion.div 
                      className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white mb-2">当前配置：</div>
                        <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                          {proxyConfig ? (
                            <>
                              <div>• 代理启用: {proxyConfig.enabled ? '是' : '否'}</div>
                              {proxyConfig.enabled && (
                                <>
                                  <div>• 强制代理: {proxyConfig.forceProxy ? '是' : '否'}</div>
                                  <div>• 自动检测: {proxyConfig.autoDetect ? '是' : '否'}</div>
                                </>
                              )}
                            </>
                          ) : (
                            <div>• 使用默认配置 (自动检测)</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}; 