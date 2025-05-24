'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { InputProps } from '@/types';

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  label,
  icon,
  className = '',
}) => {
  const baseClasses = 'w-full px-4 py-4 bg-white/60 backdrop-blur-apple border border-apple-gray-200/50 rounded-apple-lg font-sf-pro text-body-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue/50';
  
  const errorClasses = error 
    ? 'border-apple-red/50 focus:ring-apple-red/50 focus:border-apple-red/50' 
    : '';

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed bg-apple-gray-100/50' 
    : 'hover:border-apple-gray-300/50';

  const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${icon ? 'pl-12' : ''} ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-body-medium font-sf-pro font-medium text-apple-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-apple-gray-500">
            {icon}
          </div>
        )}
        
        <motion.input
          whileFocus={{ scale: 1.01, y: -1 }}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          className={classes}
        />
        
        {error && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-apple-red">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-body-small text-apple-red font-sf-pro flex items-center space-x-1"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
};

export default Input; 