import { useState, useEffect, useCallback } from 'react';
import { UseDarkModeReturn } from '@/types';

/**
 * 深色模式管理Hook
 */
export const useDarkMode = (): UseDarkModeReturn => {
  // 添加mounted状态来避免hydration问题
  const [mounted, setMounted] = useState(false);
  
  // 初始状态始终为false，避免服务器端和客户端不匹配
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  /**
   * 应用主题到DOM
   */
  const applyTheme = useCallback((dark: boolean) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  /**
   * 切换深色模式
   */
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      applyTheme(newValue);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai-key-checker-dark-mode', JSON.stringify(newValue));
      }
      return newValue;
    });
  }, [applyTheme]);

  /**
   * 设置深色模式
   */
  const setDarkMode = useCallback((enabled: boolean) => {
    setIsDarkMode(enabled);
    applyTheme(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-key-checker-dark-mode', JSON.stringify(enabled));
    }
  }, [applyTheme]);

  /**
   * 客户端挂载后初始化主题
   */
  useEffect(() => {
    setMounted(true);
    
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      let initialDarkMode = false;
      
      // 尝试从localStorage读取
      const saved = localStorage.getItem('ai-key-checker-dark-mode');
      if (saved !== null) {
        try {
          initialDarkMode = JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse dark mode preference:', e);
        }
      } else {
        // 如果没有保存的偏好，使用系统偏好
        initialDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      setIsDarkMode(initialDarkMode);
      applyTheme(initialDarkMode);
    }
  }, [applyTheme]);

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在没有用户偏好时才自动跟随系统
      const saved = localStorage.getItem('ai-key-checker-dark-mode');
      if (saved === null) {
        setIsDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mounted, applyTheme]);

  return {
    isDarkMode: mounted ? isDarkMode : false, // 未挂载时始终返回false
    toggleDarkMode,
    setDarkMode,
  };
}; 