import React, { memo, useMemo } from 'react';
import { 
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon 
} from '@heroicons/react/24/outline';

const MetricsCard = memo(({
  // Basic props
  title,
  value,
  subtitle,
  icon: Icon,
  
  // Styling props
  variant = 'default',
  size = 'medium',
  className = '',
  
  // Trend props
  trend,
  trendValue,
  trendDirection = 'neutral', // 'up', 'down', 'neutral'
  trendPeriod = 'vs last period',
  
  // Status props
  status = 'normal', // 'normal', 'success', 'warning', 'danger'
  statusMessage,
  
  // Interactive props
  clickable = false,
  onClick = null,
  
  // Customization props
  showIcon = true,
  showTrend = true,
  showStatus = true,
  compact = false,
  
  // Formatting props
  valueFormatter = (val) => val,
  trendFormatter = (val) => val,
  precision = 0
}) => {
  // Memoized computed values
  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      return valueFormatter(value.toFixed(precision));
    }
    return valueFormatter(value);
  }, [value, valueFormatter, precision]);

  const formattedTrend = useMemo(() => {
    if (trendValue !== undefined && typeof trendValue === 'number') {
      return trendFormatter(trendValue.toFixed(precision));
    }
    return trendValue;
  }, [trendValue, trendFormatter, precision]);

  // Variant configurations
  const variantConfigs = {
    default: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      iconColor: 'text-gray-600 dark:text-gray-400',
      textColor: 'text-gray-900 dark:text-white',
      subtitleColor: 'text-gray-600 dark:text-gray-400'
    },
    primary: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      border: 'border-blue-200 dark:border-blue-700',
      iconBg: 'bg-blue-100 dark:bg-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-900 dark:text-blue-100',
      subtitleColor: 'text-blue-600 dark:text-blue-400'
    },
    success: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      border: 'border-green-200 dark:border-green-700',
      iconBg: 'bg-green-100 dark:bg-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-900 dark:text-green-100',
      subtitleColor: 'text-green-600 dark:text-green-400'
    },
    warning: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      border: 'border-orange-200 dark:border-orange-700',
      iconBg: 'bg-orange-100 dark:bg-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-900 dark:text-orange-100',
      subtitleColor: 'text-orange-600 dark:text-orange-400'
    },
    danger: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      border: 'border-red-200 dark:border-red-700',
      iconBg: 'bg-red-100 dark:bg-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-900 dark:text-red-100',
      subtitleColor: 'text-red-600 dark:text-red-400'
    },
    info: {
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      border: 'border-indigo-200 dark:border-indigo-700',
      iconBg: 'bg-indigo-100 dark:bg-indigo-800',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      textColor: 'text-indigo-900 dark:text-indigo-100',
      subtitleColor: 'text-indigo-600 dark:text-indigo-400'
    }
  };

  // Status configurations
  const statusConfigs = {
    normal: {
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-700',
      border: 'border-gray-200 dark:border-gray-600'
    },
    success: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800'
    },
    warning: {
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      border: 'border-orange-200 dark:border-orange-800'
    },
    danger: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800'
    }
  };

  // Size configurations
  const sizeConfigs = {
    small: {
      padding: 'p-4',
      iconSize: 'h-8 w-8',
      titleSize: 'text-sm',
      valueSize: 'text-xl',
      subtitleSize: 'text-xs',
      trendSize: 'text-xs'
    },
    medium: {
      padding: 'p-6',
      iconSize: 'h-10 w-10',
      titleSize: 'text-sm',
      valueSize: 'text-2xl',
      subtitleSize: 'text-sm',
      trendSize: 'text-xs'
    },
    large: {
      padding: 'p-8',
      iconSize: 'h-12 w-12',
      titleSize: 'text-base',
      valueSize: 'text-3xl',
      subtitleSize: 'text-sm',
      trendSize: 'text-sm'
    }
  };

  const config = variantConfigs[variant];
  const statusConfig = statusConfigs[status];
  const sizeConfig = sizeConfigs[size];

  // Trend icon and styling
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div 
      className={`
        ${config.bg} 
        ${config.border} 
        border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
        ${clickable ? 'cursor-pointer hover:-translate-y-1' : ''} 
        ${compact ? 'min-h-0' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className={sizeConfig.padding}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {showIcon && Icon && (
            <div className={`${config.iconBg} p-2 rounded-lg`}>
              <Icon className={`${sizeConfig.iconSize} ${config.iconColor}`} />
            </div>
          )}
          
          {showStatus && statusMessage && (
            <div className={`${statusConfig.bg} ${statusConfig.border} border px-2 py-1 rounded-full`}>
              <span className={`${statusConfig.color} text-xs font-medium`}>
                {statusMessage}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className={`${sizeConfig.titleSize} font-medium ${config.subtitleColor}`}>
            {title}
          </h3>
          
          {/* Value */}
          <div className={`${sizeConfig.valueSize} font-bold ${config.textColor}`}>
            {formattedValue}
          </div>
          
          {/* Subtitle */}
          {subtitle && (
            <p className={`${sizeConfig.subtitleSize} ${config.subtitleColor}`}>
              {subtitle}
            </p>
          )}
          
          {/* Trend */}
          {showTrend && (trend || trendValue !== undefined) && (
            <div className="flex items-center gap-2 pt-2">
              {getTrendIcon()}
              <div className={`${sizeConfig.trendSize} ${getTrendColor()}`}>
                {trend && <span className="font-medium">{trend}</span>}
                {trendValue !== undefined && (
                  <span className="ml-1">
                    {trendDirection === 'up' ? '+' : ''}{formattedTrend}
                  </span>
                )}
                {trendPeriod && (
                  <span className="ml-1 opacity-75">{trendPeriod}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MetricsCard.displayName = 'MetricsCard';

export default MetricsCard;
