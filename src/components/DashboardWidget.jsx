import React, { memo, useState, useCallback } from 'react';
import { 
  ChartBarIcon, ServerIcon, CheckCircleIcon, XCircleIcon, 
  BellAlertIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon,
  ClockIcon, WifiIcon, ShieldCheckIcon, CogIcon, EyeIcon
} from '@heroicons/react/24/outline';
import AdvancedChart from './AdvancedChart';

// Icon mapping for different widget types
const ICON_MAP = {
  chart: ChartBarIcon,
  server: ServerIcon,
  status: CheckCircleIcon,
  alert: BellAlertIcon,
  trend: ArrowTrendingUpIcon,
  clock: ClockIcon,
  wifi: WifiIcon,
  shield: ShieldCheckIcon,
  default: ChartBarIcon
};

// Widget type configurations
const WIDGET_CONFIGS = {
  stats: {
    className: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    borderColor: 'border-blue-200 dark:border-blue-700'
  },
  success: {
    className: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    borderColor: 'border-green-200 dark:border-green-700'
  },
  warning: {
    className: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    borderColor: 'border-orange-200 dark:border-orange-700'
  },
  danger: {
    className: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
    borderColor: 'border-red-200 dark:border-red-700'
  },
  info: {
    className: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
    borderColor: 'border-indigo-200 dark:border-indigo-700'
  },
  neutral: {
    className: 'bg-white dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700'
  }
};

// Loading Skeleton Component
const LoadingSkeleton = memo(({ className = "h-64" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
));

// Error Display Component
const ErrorDisplay = memo(({ error, className = "h-64" }) => (
  <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
    <div className="h-full flex items-center justify-center">
      <div className="text-red-600 dark:text-red-400 text-center">
        <div className="font-medium">Widget Error</div>
        <div className="text-sm">{error}</div>
      </div>
    </div>
  </div>
));

const DashboardWidget = memo(({
  // Basic props
  title,
  subtitle,
  icon = 'default',
  type = 'neutral',
  size = 'medium',
  className = '',
  
  // Content props
  children,
  content,
  chartData,
  chartType = 'area',
  chartConfig = {},
  
  // State props
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'No data available',
  
  // Interactive props
  clickable = false,
  onClick = null,
  expandable = false,
  expanded = false,
  onToggleExpand = null,
  
  // Customization props
  showHeader = true,
  showActions = false,
  actions = [],
  showRefresh = false,
  onRefresh = null,
  showSettings = false,
  onSettings = null,
  
  // Performance props
  lazy = false,
  refreshInterval = null,
  autoRefresh = false
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get icon component
  const IconComponent = ICON_MAP[icon] || ICON_MAP.default;
  
  // Get widget configuration
  const widgetConfig = WIDGET_CONFIGS[type] || WIDGET_CONFIGS.neutral;
  
  // Size classes
  const sizeClasses = {
    small: 'h-48',
    medium: 'h-64',
    large: 'h-80',
    xlarge: 'h-96',
    auto: 'h-auto'
  };

  // Handle expand toggle
  const handleToggleExpand = useCallback(() => {
    if (expandable) {
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      if (onToggleExpand) {
        onToggleExpand(newExpanded);
      }
    }
  }, [expandable, isExpanded, onToggleExpand]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh, isRefreshing]);

  // Handle click
  const handleClick = useCallback(() => {
    if (clickable && onClick) {
      onClick();
    }
  }, [clickable, onClick]);

  // Widget content based on props
  const renderContent = () => {
    if (loading) {
      return <LoadingSkeleton className={sizeClasses[size]} />;
    }

    if (error) {
      return <ErrorDisplay error={error} className={sizeClasses[size]} />;
    }

    if (empty) {
      return (
        <div className={`${sizeClasses[size]} flex items-center justify-center`}>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <IconComponent className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{emptyMessage}</p>
          </div>
        </div>
      );
    }

    if (chartData && chartData.length > 0) {
      return (
        <div className={sizeClasses[size]}>
          <AdvancedChart
            type={chartType}
            data={chartData}
            config={chartConfig}
            height="100%"
            className="w-full h-full"
            enableAnimations={true}
            showGrid={true}
            showLegend={true}
            showTooltip={true}
          />
        </div>
      );
    }

    if (content) {
      return <div className={sizeClasses[size]}>{content}</div>;
    }

    if (children) {
      return <div className={sizeClasses[size]}>{children}</div>;
    }

    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center text-gray-500 dark:text-gray-400`}>
        No content provided
      </div>
    );
  };

  // Widget actions
  const renderActions = () => {
    if (!showActions && !showRefresh && !showSettings && actions.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`p-2 rounded-lg transition-colors ${
              action.variant === 'primary' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={action.title}
          >
            {action.icon}
          </button>
        ))}
        
        {showRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <div className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}>
              <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </button>
        )}
        
        {showSettings && (
          <button
            onClick={onSettings}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
            title="Settings"
          >
            <CogIcon className="h-4 w-4" />
          </button>
        )}
        
        {expandable && (
          <button
            onClick={handleToggleExpand}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`
        ${widgetConfig.className} 
        ${widgetConfig.borderColor} 
        border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
        ${clickable ? 'cursor-pointer hover:-translate-y-1' : ''} 
        ${className}
      `}
      onClick={handleClick}
    >
      {showHeader && (
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <IconComponent className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {renderActions()}
        </div>
      )}
      
      <div className="px-6 pb-6">
        {renderContent()}
      </div>
    </div>
  );
});

DashboardWidget.displayName = 'DashboardWidget';

export default DashboardWidget;
