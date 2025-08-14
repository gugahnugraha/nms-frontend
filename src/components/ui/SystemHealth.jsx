import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const SystemHealth = ({ devices = [] }) => {
  const { t } = useTranslation();

  // Calculate health metrics
  const totalDevices = devices.length;
  const devicesUp = devices.filter(device => device.status === 'UP').length;
  const devicesDown = devices.filter(device => device.status === 'DOWN').length;
  
  // Calculate health score (0-100)
  const healthScore = totalDevices > 0 ? Math.round((devicesUp / totalDevices) * 100) : 100;
  
  // Determine health status
  const getHealthStatus = (score) => {
    if (score >= 90) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon };
    if (score >= 70) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircleIcon };
    if (score >= 50) return { status: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: ExclamationTriangleIcon };
    if (score >= 30) return { status: 'poor', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: ExclamationTriangleIcon };
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircleIcon };
  };

  const healthStatus = getHealthStatus(healthScore);
  const StatusIcon = healthStatus.icon;

  // Calculate device type distribution
  const deviceTypes = devices.reduce((acc, device) => {
    acc[device.type] = (acc[device.type] || 0) + 1;
    return acc;
  }, {});

  const deviceTypeData = Object.entries(deviceTypes).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / totalDevices) * 100)
  }));

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('dashboard.systemHealth')}
        </h2>
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.healthScore')}
          </span>
        </div>
      </div>

      {/* Health Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <div className="relative inline-block">
          <div className={`w-24 h-24 rounded-full ${healthStatus.bgColor} dark:bg-opacity-20 flex items-center justify-center`}>
            <StatusIcon className={`h-8 w-8 ${healthStatus.color}`} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${healthStatus.color}`}>
              {healthScore}%
            </span>
          </div>
        </div>
        <p className={`text-sm font-medium mt-2 ${healthStatus.color}`}>
          {t(`dashboard.${healthStatus.status}`)}
        </p>
      </motion.div>

      {/* Health Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {devicesUp}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.onlineDevices')}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {devicesDown}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.offlineDevices')}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalDevices}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.totalDevices')}
          </div>
        </motion.div>
      </div>

      {/* Device Type Distribution */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('dashboard.deviceDistribution')}
        </h3>
        <div className="space-y-2">
          {deviceTypeData.map((item, index) => (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <ChartBarIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {item.type}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                  {item.count}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Health Status Summary */}
      <div className={`p-3 rounded-lg ${healthStatus.bgColor} dark:bg-opacity-20`}>
        <div className="flex items-center">
          <StatusIcon className={`h-5 w-5 mr-2 ${healthStatus.color}`} />
          <div>
            <p className={`text-sm font-medium ${healthStatus.color}`}>
              {healthScore >= 90 ? 'Sistem berjalan dengan sangat baik' :
               healthScore >= 70 ? 'Sistem berjalan dengan baik' :
               healthScore >= 50 ? 'Sistem memerlukan perhatian' :
               healthScore >= 30 ? 'Sistem dalam kondisi buruk' :
               'Sistem dalam kondisi kritis'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {devicesUp} dari {totalDevices} perangkat aktif
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
