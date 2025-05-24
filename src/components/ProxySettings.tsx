import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Globe, 
  Shield, 
  ToggleLeft, 
  ToggleRight,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ProxySettingsProps {
  className?: string;
}

interface ProxyConfig {
  enabled: boolean;
  forceProxy: boolean;
  autoDetect: boolean;
}

export const ProxySettings: React.FC<ProxySettingsProps> = ({ className = '' }) => {
  const [mounted, setMounted] = useState(false);
  
  const [config, setConfig] = useState<ProxyConfig>({
    enabled: true,
    forceProxy: false,
    autoDetect: true,
  });

  const [isOpen, setIsOpen] = useState(false);

  // 客户端挂载和从localStorage加载配置
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('keyguard-proxy-config');
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (e) {
          console.warn('Failed to parse proxy config:', e);
        }
      }
    }
  }, []);

  // 保存配置到localStorage
  const saveConfig = (newConfig: ProxyConfig) => {
    setConfig(newConfig);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('keyguard-proxy-config', JSON.stringify(newConfig));
      
      // 触发全局配置更新事件
      window.dispatchEvent(new CustomEvent('proxy-config-changed', { 
        detail: newConfig 
      }));
    }
  };

  const handleToggle = (key: keyof ProxyConfig) => {
    const newConfig = { ...config, [key]: !config[key] };
    
    // 如果启用强制代理，则禁用自动检测
    if (key === 'forceProxy' && newConfig.forceProxy) {
      newConfig.autoDetect = false;
    }
    
    // 如果启用自动检测，则禁用强制代理
    if (key === 'autoDetect' && newConfig.autoDetect) {
      newConfig.forceProxy = false;
    }

    saveConfig(newConfig);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 设置按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
      >
        <Settings className="w-4 h-4" />
        <span>代理设置</span>
      </button>

      {/* 设置面板 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                代理配置
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* 启用代理 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    启用代理
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    通过服务器转发API请求
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  config.enabled 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.enabled && (
              <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                {/* 自动检测 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        自动检测
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        根据网络环境自动选择
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('autoDetect')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      config.autoDetect 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        config.autoDetect ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 强制代理 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        强制代理
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        始终使用代理服务器
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('forceProxy')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      config.forceProxy 
                        ? 'bg-orange-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        config.forceProxy ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* 说明信息 */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-medium mb-1">关于代理模式：</div>
                  <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• 自动检测：系统根据地理位置和网络环境智能选择</li>
                    <li>• 强制代理：所有请求都通过我们的服务器转发</li>
                    <li>• 代理模式可以解决境内网络访问限制问题</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 当前状态 */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                当前模式:
              </span>
              <div className="flex items-center space-x-2">
                {config.enabled ? (
                  config.forceProxy ? (
                    <>
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        强制代理
                      </span>
                    </>
                  ) : config.autoDetect ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        智能检测
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        手动配置
                      </span>
                    </>
                  )
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      直连模式
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}; 