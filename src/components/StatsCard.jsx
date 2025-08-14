import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from '@heroicons/react/24/solid';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  trendUp, 
  color = 'blue',
  loading = false,
  onClick = null,
  className = ""
}) => {
  const colorVariants = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-700',
      trendBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-700',
      trendBg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-700',
      trendBg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-700',
      trendBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-700',
      trendBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-700',
      trendBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
    }
  };

  const colors = colorVariants[color] || colorVariants.blue;

  const getTrendIcon = () => {
    if (trendValue === 0) return <MinusIcon className="h-3 w-3" />;
    return trendUp ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (trendValue === 0) return 'text-gray-600 dark:text-gray-400';
    return trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const CardContent = (
    <div className={`${colors.bg} rounded-xl p-6 border ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={colors.text}>{Icon}</div>
        {trend && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${colors.trendBg}`}
          >
            {getTrendIcon()}
            <span className={getTrendColor()}>{trend}</span>
          </motion.div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        ) : (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            {value}
          </motion.p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        {CardContent}
      </motion.div>
    );
  }

  return CardContent;
};

export default StatsCard;
