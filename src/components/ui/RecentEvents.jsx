import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const RecentEvents = ({ events = [] }) => {
  const { t } = useTranslation();

  const getEventIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
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

  // Mock events jika tidak ada data
  const mockEvents = events.length === 0 ? [
    {
      id: 1,
      type: 'success',
      message: 'Device Server Cetak KTP berubah status dari DOWN ke UP',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      device: 'Server Cetak KTP'
    },
    {
      id: 2,
      type: 'warning',
      message: 'CPU usage pada Router Utama mencapai 85%',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      device: 'Router Utama'
    },
    {
      id: 3,
      type: 'error',
      message: 'Device Diskominfo tidak dapat diakses',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      device: 'Diskominfo'
    },
    {
      id: 4,
      type: 'info',
      message: 'Sistem monitoring berhasil diperbarui',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      device: 'System'
    }
  ] : events;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('dashboard.recentEvents')}
        </h2>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          {t('common.view')} {t('common.details')}
        </button>
      </div>
      
      <div className="space-y-3">
        {mockEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-3 rounded-lg border-l-4 ${getEventColor(event.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getEventIcon(event.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {event.message}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>{formatTime(event.timestamp)}</span>
                  {event.device && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{event.device}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {mockEvents.length === 0 && (
        <div className="text-center py-8">
          <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {t('dashboard.noEvents')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentEvents;
