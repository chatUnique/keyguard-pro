import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface KeyGuardLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export const KeyGuardLogo: React.FC<KeyGuardLogoProps> = ({ 
  size = 48, 
  className = '',
  animated = true,
  theme = 'auto'
}) => {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    
    const detectTheme = (): 'light' | 'dark' => {
      if (theme === 'dark') return 'dark';
      if (theme === 'light') return 'light';
      
      // auto模式检测
      if (typeof window !== 'undefined') {
        const hasDarkClass = document.documentElement.classList.contains('dark');
        if (hasDarkClass) return 'dark';
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      }
      return 'light';
    };

    setCurrentTheme(detectTheme());

    // 监听主题变化
    if (theme === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setCurrentTheme(detectTheme());
      
      mediaQuery.addEventListener('change', handleChange);
      
      const observer = new MutationObserver(() => {
        setCurrentTheme(detectTheme());
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
        observer.disconnect();
      };
    }
  }, [theme]);

  // 在客户端挂载前显示加载占位符，避免hydration错误
  if (!mounted) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}
      />
    );
  }

  const isDark = currentTheme === 'dark';

  const colors = {
    light: {
      shieldGradient: { start: '#3B82F6', end: '#8B5CF6' },
      shieldStroke: '#1E40AF',
      innerStroke: '#FFFFFF',
      keyGradient: { start: '#10B981', end: '#059669' },
      decorativeDots: ['#3B82F6', '#8B5CF6', '#10B981'],
      outerStroke: '#3B82F6'
    },
    dark: {
      shieldGradient: { start: '#4F46E5', end: '#7C3AED' },
      shieldStroke: '#6366F1',
      innerStroke: '#E2E8F0',
      keyGradient: { start: '#F59E0B', end: '#D97706' },
      decorativeDots: ['#4F46E5', '#7C3AED', '#F59E0B'],
      outerStroke: '#4F46E5'
    }
  };

  const currentColors = colors[currentTheme];

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const shieldVariants = {
    initial: { pathLength: 0 },
    animate: { 
      pathLength: 1,
      transition: { 
        duration: 1.2,
        ease: "easeInOut",
        delay: 0.2
      }
    }
  };

  const keyVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut",
        delay: 0.6
      }
    }
  };

  const LogoContent = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${currentTheme}`}
    >
      <defs>
        <linearGradient id={`shieldGradient-${currentTheme}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={currentColors.shieldGradient.start} />
          <stop offset="100%" stopColor={currentColors.shieldGradient.end} />
        </linearGradient>
        <linearGradient id={`keyGradient-${currentTheme}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={currentColors.keyGradient.start} />
          <stop offset="100%" stopColor={currentColors.keyGradient.end} />
        </linearGradient>
        
        <filter id={`glow-${size}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id={`darkGlow-${size}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feFlood floodColor={currentColors.shieldGradient.start} floodOpacity="0.3"/>
          <feComposite in2="coloredBlur" operator="in"/>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id={`keyGlow-${size}`}>
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feFlood floodColor={currentColors.keyGradient.start} floodOpacity="0.4"/>
          <feComposite in2="coloredBlur" operator="in"/>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <motion.circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke={currentColors.outerStroke}
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.3"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.path
        d="M50 8 
           L80 22 
           L80 45 
           C80 68, 50 88, 50 88
           C50 88, 20 68, 20 45
           L20 22 
           Z"
        fill={`url(#shieldGradient-${currentTheme}-${size})`}
        stroke={currentColors.shieldStroke}
        strokeWidth="2"
        filter={isDark ? `url(#darkGlow-${size})` : `url(#glow-${size})`}
        variants={animated ? shieldVariants : {}}
        initial={animated ? "initial" : false}
        animate={animated ? "animate" : false}
      />

      <motion.path
        d="M50 16
           L72 26
           L72 42
           C72 62, 50 78, 50 78
           C50 78, 28 62, 28 42
           L28 26
           Z"
        fill="none"
        stroke={currentColors.innerStroke}
        strokeWidth="1"
        opacity="0.3"
        variants={animated ? shieldVariants : {}}
        initial={animated ? "initial" : false}
        animate={animated ? "animate" : false}
      />

      <motion.g
        variants={animated ? keyVariants : {}}
        initial={animated ? "initial" : false}
        animate={animated ? "animate" : false}
        filter={isDark ? `url(#keyGlow-${size})` : "none"}
      >
        <circle
          cx="45"
          cy="40"
          r="8"
          fill="none"
          stroke={`url(#keyGradient-${currentTheme}-${size})`}
          strokeWidth="3"
        />
        <circle
          cx="45"
          cy="40"
          r="4"
          fill="none"
          stroke={`url(#keyGradient-${currentTheme}-${size})`}
          strokeWidth="1.5"
        />
        
        <rect
          x="53"
          y="38"
          width="12"
          height="4"
          rx="2"
          fill={`url(#keyGradient-${currentTheme}-${size})`}
        />
        
        <rect x="62" y="35" width="4" height="3" rx="1" fill={`url(#keyGradient-${currentTheme}-${size})`} />
        <rect x="62" y="42" width="6" height="3" rx="1" fill={`url(#keyGradient-${currentTheme}-${size})`} />
      </motion.g>

      <motion.circle
        cx="32"
        cy="55"
        r="2"
        fill={currentColors.decorativeDots[0]}
        opacity={isDark ? "0.8" : "0.6"}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      />
      <motion.circle
        cx="68"
        cy="60"
        r="1.5"
        fill={currentColors.decorativeDots[1]}
        opacity={isDark ? "0.8" : "0.6"}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2 }}
      />
      <motion.circle
        cx="55"
        cy="25"
        r="1"
        fill={currentColors.decorativeDots[2]}
        opacity={isDark ? "0.8" : "0.6"}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2.5 }}
      />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        variants={logoVariants}
        initial="initial"
        animate="animate"
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
      >
        <LogoContent />
      </motion.div>
    );
  }

  return <LogoContent />;
}; 