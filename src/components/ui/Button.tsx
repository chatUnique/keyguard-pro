'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-sf-pro font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-apple-blue to-apple-purple text-white shadow-apple-lg hover:shadow-apple-xl focus:ring-apple-blue/50',
    secondary: 'bg-white/60 backdrop-blur-apple text-apple-gray-900 border border-apple-gray-200/50 shadow-apple hover:shadow-apple-lg focus:ring-apple-gray-300/50',
    outline: 'border-2 border-apple-blue text-apple-blue hover:bg-apple-blue hover:text-white focus:ring-apple-blue/50',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-body-small rounded-apple',
    md: 'px-6 py-3 text-body-medium rounded-apple',
    lg: 'px-8 py-4 text-title-medium rounded-apple-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${classes} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </motion.button>
  );
};

export default Button; 