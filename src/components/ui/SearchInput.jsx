import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const sizeToClass = {
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4'
};

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  size = 'md',
  className = ''
}) {
  const sizeClass = sizeToClass[size] || sizeToClass.md;
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pr-10 ${sizeClass} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200`}
      />
      <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
    </div>
  );
}


