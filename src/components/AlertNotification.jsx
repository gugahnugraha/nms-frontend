import React, { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const AlertNotification = ({ 
  alert, 
  onAcknowledge, 
  onDismiss, 
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        icon: ExclamationTriangleIcon,
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        iconColor: 'text-red-500',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      },
      warning: {
        icon: ExclamationCircleIcon,
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-200',
        iconColor: 'text-yellow-500',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      },
      info: {
        icon: InformationCircleIcon,
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        iconColor: 'text-blue-500',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      },
      success: {
        icon: CheckCircleIcon,
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        iconColor: 'text-green-500',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      }
    };
    
    return configs[severity?.toLowerCase()] || configs.info;
  };

  dayjs.extend(relativeTime);
  const { language, t } = useLanguage();
  const config = getSeverityConfig(alert.severity);
  const Icon = config.icon;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return t('alerts.unknownTime');
    const rel = dayjs(timestamp).locale(language || 'en').fromNow();
    if (language === 'id' && /detik/.test(rel)) return t('alerts.justNow');
    return rel;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${config.bg} ${config.border} border-l-4 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-sm font-medium ${config.text}`}>
                  {alert.title || t('alerts.defaultTitle')}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${config.badge}`}>
                  {alert.severity?.toUpperCase() || t('alerts.defaultSeverity')}
                </span>
              </div>
              
              <p className={`text-sm ${config.text} opacity-90`}>
                {alert.message || alert.description || t('alerts.noDescription')}
              </p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTimestamp(alert.timestamp)}</span>
                {alert.source && <span>Source: {alert.source}</span>}
                {alert.category && <span>Category: {alert.category}</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {alert.acknowledged === false && onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Acknowledge
                </button>
              )}
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </button>
              
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {alert.details && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Details:</span>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{alert.details}</p>
                      </div>
                    )}
                    
                    {alert.recommendations && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Recommendations:</span>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{alert.recommendations}</p>
                      </div>
                    )}
                    
                    {alert.metrics && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Metrics:</span>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          {Object.entries(alert.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                              <span className="text-gray-700 dark:text-gray-300">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertNotification;
