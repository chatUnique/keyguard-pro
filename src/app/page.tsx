'use client';

import React, { useState, useEffect } from 'react';
import { ApiKeyValidationResult, DetectionTab, AiProvider } from '@/types';
import { Header } from '@/components/Header';
import { SingleKeyDetector } from '@/components/SingleKeyDetector';
import { BatchKeyDetector } from '@/components/BatchKeyDetector';
import { CustomUrlTester } from '@/components/CustomUrlTester';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useKeyDetection } from '@/hooks/useKeyDetection';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Database, 
  ArrowRight, 
  CheckCircle, 
  Lock, 
  Globe,
  BarChart3,
  FileText,
  Settings,
  Users,
  Sparkles,
  Key,
  Heart,
  Star,
  Award,
  TrendingUp, 
  Activity,
  Target,
  Wifi,
  Code,
  Layers,
  Briefcase
} from 'lucide-react';
import { ProviderIcon } from '@/components/ProviderIcon';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { KeyGuardLogo } from '@/components/KeyGuardLogo';

// 页面类型枚举
enum PageType {
  DASHBOARD = 'dashboard',
  SINGLE = 'single',
  BATCH = 'batch',
  CUSTOM = 'custom'
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.DASHBOARD);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const keyDetection = useKeyDetection();

  const handleSingleResult = (result: ApiKeyValidationResult) => {
    console.log('Single detection result:', result);
  };

  const handleBatchComplete = (results: any[]) => {
    console.log('Batch detection complete:', results);
  };

  const handleBatchProgress = (statistics: any) => {
    console.log('Batch progress:', statistics);
  };

  const handleCustomResult = (response: any) => {
    console.log('Custom test result:', response);
  };

  // 功能卡片数据
  const features = [
    {
      id: PageType.SINGLE,
      title: '单个Key检测',
      description: '快速验证单个API Key的有效性、余额和权限信息',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      features: ['实时验证', '详细信息', '余额查询', '权限检测']
    },
    {
      id: PageType.BATCH,
      title: '批量检测',
      description: '同时检测多个API Key，支持并发处理和结果导出',
      icon: <Database className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      features: ['并发处理', '进度跟踪', '结果导出', '统计分析']
    },
    {
      id: PageType.CUSTOM,
      title: '自定义测试',
      description: '灵活测试自定义API端点，支持模板和变量配置',
      icon: <Settings className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      features: ['自定义端点', '请求模板', '变量配置', '响应分析']
    }
  ];

  // 渲染仪表板页面
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className={`p-3 rounded-2xl shadow-lg ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  <KeyGuardLogo size={48} animated={true} theme={isDarkMode ? 'dark' : 'light'} />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                KeyGuard
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Pro</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                专业的AI API Key检测与验证平台
                <br />
                <span className="text-lg">保护您的密钥安全，优化API使用效率</span>
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setCurrentPage(PageType.SINGLE)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  开始检测
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
                <button
                  onClick={() => setCurrentPage(PageType.CUSTOM)}
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl font-semibold transition-all duration-300"
                >
                  自定义测试
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                强大的功能特性
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                选择适合您需求的检测方式
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="group cursor-pointer"
                  onClick={() => setCurrentPage(feature.id)}
                >
                  <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent hover:scale-105">
                    <div className={`inline-flex p-4 rounded-2xl ${feature.bgColor} mb-6`}>
                      <div className={feature.textColor}>
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <ul className="space-y-3 mb-6">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      开始使用
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative px-6 py-12 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            {/* 标题部分 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                为什么选择 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> KeyGuard Pro</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                专业、安全、高效的AI密钥检测解决方案
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  value: '37+', 
                  label: '支持平台', 
                  icon: <Globe className="w-8 h-8" />,
                  description: '覆盖全球主流AI服务商',
                  color: 'text-blue-600 dark:text-blue-400'
                },
                { 
                  value: '100%', 
                  label: '本地检测', 
                  icon: <Lock className="w-8 h-8" />,
                  description: '数据不离开您的设备',
                  color: 'text-green-600 dark:text-green-400'
                },
                { 
                  value: '实时', 
                  label: '检测速度', 
                  icon: <Zap className="w-8 h-8" />,
                  description: '毫秒级响应时间',
                  color: 'text-orange-600 dark:text-orange-400'
                },
                { 
                  value: '开源', 
                  label: '完全免费', 
                  icon: <Sparkles className="w-8 h-8" />,
                  description: '永久免费开源使用',
                  color: 'text-purple-600 dark:text-purple-400'
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * index
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                >
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-white dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl dark:hover:shadow-gray-900/20 transition-all duration-300">
                    {/* 图标 */}
                    <motion.div 
                      className={`inline-flex p-4 rounded-2xl mb-4 ${stat.color} bg-gray-100 dark:bg-gray-700`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {stat.icon}
                    </motion.div>
                    
                    {/* 数值 */}
                    <motion.div 
                      className={`text-4xl font-bold mb-2 ${stat.color}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                      <AnimatedNumber 
                        value={stat.value} 
                        duration={1.5 + index * 0.2} 
                        delay={0.3 + index * 0.1} 
                      />
                    </motion.div>
                    
                    {/* 标题 */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {stat.label}
                    </h3>
                    
                    {/* 描述 */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 底部状态 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-12"
            >
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                <motion.div 
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  已服务 <span className="text-blue-600 dark:text-blue-400 font-bold">1+</span> 开发者
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Supported Providers */}
        <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            {/* 标题区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                支持的AI服务商
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                覆盖主流AI平台，提供全方位的API密钥检测支持
              </p>
            </motion.div>
            
            {/* 流动的服务商标志带 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                持续更新中，更多服务商即将支持
              </p>
              
              {/* 无限循环滚动容器 */}
              <div className="relative overflow-hidden py-8">
                {/* 主滚动轨道 */}
                <div
                  className="flex items-center animate-scroll-infinite"
                  style={{
                    gap: '4rem',
                    animationDuration: '40s',
                    width: 'max-content'
                  }}
                >
                  {/* 创建2倍图标列表确保无缝循环 */}
                  {Array.from({ length: 2 }).flatMap((_, setIndex) => 
                    [
                      AiProvider.OPENAI, AiProvider.GOOGLE, AiProvider.ANTHROPIC, 
                      AiProvider.XAI, AiProvider.HUNYUAN, AiProvider.META, 
                      AiProvider.GITHUB_COPILOT, AiProvider.DOUBAO, AiProvider.QWEN, 
                      AiProvider.DEEPSEEK, AiProvider.ZHIPU, AiProvider.YUANBAO,
                      AiProvider.OLLAMA, AiProvider.MOONSHOT, AiProvider.COZE, AiProvider.CLINE,
                      AiProvider.VOLCENGINE, AiProvider.PERPLEXITY, AiProvider.MIDJOURNEY
                    ].map((provider, index) => (
                      <motion.div
                        key={`set-${setIndex}-${provider}-${index}`}
                        className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-2xl backdrop-blur-sm border border-gray-200/40 dark:border-gray-700/40 shadow-lg transition-shadow duration-300"
                        animate={{
                          y: [0, -6, 0],
                        }}
                        transition={{
                          duration: 4 + (index * 0.3),
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: (index * 0.1)
                        }}
                      >
                        <ProviderIcon provider={provider} size={32} />
                      </motion.div>
                    ))
                  )}
                </div>
                
                {/* 边缘渐变遮罩 */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-900 via-gray-50/80 dark:via-gray-900/80 to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50 dark:from-gray-900 via-gray-50/80 dark:via-gray-900/80 to-transparent pointer-events-none z-10"></div>
                
                {/* 顶部和底部柔和阴影 */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10"></div>
              </div>
              
              {/* 底部统计信息 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="mt-8 inline-flex items-center space-x-3 px-6 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-600/40 shadow-lg"
              >
                <motion.div 
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  支持 <span className="text-blue-600 dark:text-blue-400 font-bold">37+</span> 个AI平台
                </span>
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  实时在线检测
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );

  // 渲染功能页面
  const renderFunctionPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* 导航面包屑 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        <div className="relative px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <motion.nav 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center space-x-3"
              aria-label="面包屑导航"
            >
              {/* 首页按钮 */}
              <motion.button
                onClick={() => setCurrentPage(PageType.DASHBOARD)}
                className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 dark:bg-blue-400"></div>
                </div>
                <span className="font-medium text-sm">首页</span>
              </motion.button>
              
              {/* 分隔符 */}
              <div className="flex items-center space-x-1 text-gray-300 dark:text-gray-600">
                <div className="w-1 h-1 rounded-full bg-current opacity-40"></div>
                <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                <div className="w-1 h-1 rounded-full bg-current opacity-40"></div>
              </div>
              
              {/* 当前页面 */}
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/30 dark:border-blue-700/30"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {currentPage === PageType.SINGLE && <Key className="w-3 h-3" />}
                  {currentPage === PageType.BATCH && <Database className="w-3 h-3" />}
                  {currentPage === PageType.CUSTOM && <Settings className="w-3 h-3" />}
                </div>
                <span className="font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentPage === PageType.SINGLE && '单个Key检测'}
                  {currentPage === PageType.BATCH && '批量检测'}
                  {currentPage === PageType.CUSTOM && '自定义测试'}
                </span>
              </motion.div>
              
              {/* 状态指示器 */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="ml-auto flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ready</span>
              </motion.div>
            </motion.nav>
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {currentPage === PageType.SINGLE && (
              <motion.div
                key="single"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    单个Key检测
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    快速验证单个API Key的有效性、余额和详细信息
                  </p>
                </div>
                <SingleKeyDetector onResult={handleSingleResult} />
              </motion.div>
            )}

            {currentPage === PageType.BATCH && (
              <motion.div
                key="batch"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    批量检测
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    同时检测多个API Key，支持并发处理和结果导出
                  </p>
                </div>
                <BatchKeyDetector 
                  onBatchComplete={handleBatchComplete}
                  onProgress={handleBatchProgress}
                />
              </motion.div>
            )}

            {currentPage === PageType.CUSTOM && (
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    自定义URL测试
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    灵活测试自定义API端点，支持模板和变量配置
                  </p>
                </div>
                <CustomUrlTester onResult={handleCustomResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );

  return currentPage === PageType.DASHBOARD ? renderDashboard() : renderFunctionPage();
} 