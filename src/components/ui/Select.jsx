import React from 'react';

const sizeToClass = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base'
};

export default function Select({ value, onChange, children, size = 'md', className = '' }) {
  const sizeClass = sizeToClass[size] || sizeToClass.md;
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${sizeClass} px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200 ${className}`}
    >
      {children}
    </select>
  );
}


