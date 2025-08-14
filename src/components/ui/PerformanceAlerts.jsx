import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const PerformanceAlerts = ({ alerts = [] }) => {
  const { t } = useTranslation();

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'critical':
        return t('dashboard.criticalAlerts');
      case 'warning':
        return t('dashboard.warningAlerts');
      case 'info':
        return t('dashboard.infoAlerts');
      default:
        return 'Info';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam yang lalu`;
    return date.toLocaleDateString('id-ID');
  };

  // Mock alerts jika tidak ada data
  const mockAlerts = alerts.length === 0 ? [
    {
      id: 1,
      severity: 'warning',
      title: 'CPU Usage Tinggi',
      message: 'CPU usage pada Router Utama mencapai 85%',
      device: 'Router Utama',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      metric: 'CPU',
      value: '85%',
      threshold: '80%'
    },
    {
      id: 2,
      severity: 'info',
      title: 'Maintenance Scheduled',
      message: 'Pemeliharaan terjadwal untuk Server Backup',
      device: 'Server Backup',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      metric: 'Maintenance',
      value: 'Scheduled',
      threshold: 'N/A'
    },
    {
      id: 3,
      severity: 'critical',
      title: 'Device Offline',
      message: 'Device Diskominfo tidak dapat diakses',
      device: 'Diskominfo',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      metric: 'Status',
      value: 'OFFLINE',
      threshold: 'ONLINE'
    }
  ] : alerts;

  // Count alerts by severity
  const alertCounts = mockAlerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('dashboard.performanceAlerts')}
        </h2>
        <div className="flex items-center space-x-2">
          <BellIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {mockAlerts.length} {mockAlerts.length === 1 ? 'alert' : 'alerts'}
          </span>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {alertCounts.critical || 0}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 font-medium">
            {t('dashboard.criticalAlerts')}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
        >
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {alertCounts.warning || 0}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
            {t('dashboard.warningAlerts')}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {alertCounts.info || 0}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {t('dashboard.infoAlerts')}
          </div>
        </motion.div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {mockAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {getSeverityText(alert.severity)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {alert.message}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatTime(alert.timestamp)}
                    </span>
                    <span>•</span>
                    <span>{alert.device}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{alert.metric}: {alert.value}</span>
                    {alert.threshold !== 'N/A' && (
                      <>
                        <span>•</span>
                        <span>Threshold: {alert.threshold}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {mockAlerts.length === 0 && (
        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {t('dashboard.noAlerts')}
          </p>
        </div>
      )}
    </div>
  );
};

export default PerformanceAlerts;
