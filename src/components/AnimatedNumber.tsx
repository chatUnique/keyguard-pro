'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: string;
  duration?: number;
  delay?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1.5,
  delay = 0
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    // 检查是否是纯数字
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isNaN(numericValue)) {
      // 如果不是数字（如"实时"、"开源"等），直接显示
      setDisplayValue(value);
      return;
    }

    // 数字动画
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // 使用 easeOutCubic 缓动函数
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = numericValue * easedProgress;
      
      // 格式化显示值
      let displayStr = '';
      if (value.includes('%')) {
        displayStr = Math.round(currentValue) + '%';
      } else if (value.includes('+')) {
        displayStr = Math.round(currentValue) + '+';
      } else {
        displayStr = Math.round(currentValue).toString();
      }
      
      setDisplayValue(displayStr);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value); // 确保最终值准确
      }
    };

    animate();
  }, [hasStarted, value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {displayValue}
    </motion.span>
  );
}; 