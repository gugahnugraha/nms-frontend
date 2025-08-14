import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ServerIcon,
  SignalIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Collector = () => {
  const { t } = useTranslation();

  // Placeholder for collectorStatus
  const collectorStatus = {
    snmp: true,
    ping: true,
    metrics: true,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              {t('collector.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {t('collector.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Collector Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('collector.snmpCollector')}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {collectorStatus.snmp ? t('collector.status.running') : t('collector.status.stopped')}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              collectorStatus.snmp 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <ServerIcon className={`w-6 h-6 ${
                collectorStatus.snmp 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('collector.pingCollector')}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {collectorStatus.ping ? t('collector.status.running') : t('collector.status.stopped')}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              collectorStatus.ping 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <SignalIcon className={`w-6 h-6 ${
                collectorStatus.ping 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('collector.metricsCollector')}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {collectorStatus.metrics ? t('collector.status.running') : t('collector.status.stopped')}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              collectorStatus.metrics 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <ChartBarIcon className={`w-6 h-6 ${
                collectorStatus.metrics 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Collector;


