import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ 
  size = 'md',
  color = 'primary',
  className = '' 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colors = {
    primary: 'border-blue-500 border-t-blue-400',
    white: 'border-white border-t-white/50',
    gray: 'border-gray-400 border-t-gray-300',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} ${colors[color]} rounded-full border-2 animate-spin`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default Loading;
