'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Shield } from 'lucide-react';
import { HeaderProps } from '@/types';
import { KeyGuardLogo } from './KeyGuardLogo';
import { ProxySettings } from './ProxySettings';

/**
 * 应用头部组件 - 采用苹果官网简洁设计风格
 */
export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 和标题 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <KeyGuardLogo size={32} animated={false} theme={isDarkMode ? 'dark' : 'light'} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                KeyGuard Pro
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                AI密钥守护者
              </p>
            </div>
          </motion.div>

          {/* 导航和控制区域 */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* 安全提示 */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
              <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                本地检测，数据安全
              </span>
            </div>

            {/* 代理设置 */}
            <ProxySettings />

            
            {/* GitHub 链接 */}
            <motion.a
              href="https://github.com/chatUnique/keyguard-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </motion.a>

            {/* 深色模式切换 */}
            <motion.button
              onClick={toggleDarkMode}
              className="relative p-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-200 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
            >
              <div className="relative w-5 h-5">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isDarkMode ? 0 : 1,
                    rotate: isDarkMode ? 180 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.div>
                
                <motion.div
                  initial={false}
                  animate={{
                    scale: isDarkMode ? 1 : 0,
                    rotate: isDarkMode ? 0 : -180,
                  }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.div>
              </div>
              {/* Hover 效果 */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </motion.button>

          </motion.div>
        </div>
      </div>

      {/* 底部渐变线 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
    </motion.header>
  );
}; 