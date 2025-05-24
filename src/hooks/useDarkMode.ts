import { useState, useEffect, useCallback } from 'react';
import { UseDarkModeReturn } from '@/types';

/**
 * 深色模式管理Hook
 */
export const useDarkMode = (): UseDarkModeReturn => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // 初始化时从localStorage读取或使用系统偏好
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-key-checker-dark-mode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      
      // 如果没有保存的偏好，使用系统偏好
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

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
      localStorage.setItem('ai-key-checker-dark-mode', JSON.stringify(newValue));
      return newValue;
    });
  }, [applyTheme]);

  /**
   * 设置深色模式
   */
  const setDarkMode = useCallback((enabled: boolean) => {
    setIsDarkMode(enabled);
    applyTheme(enabled);
    localStorage.setItem('ai-key-checker-dark-mode', JSON.stringify(enabled));
  }, [applyTheme]);

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
  }, [applyTheme]);

  /**
   * 初始化时应用主题
   */
  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode, applyTheme]);

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  };
}; 