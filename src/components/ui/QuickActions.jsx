import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  DocumentTextIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const QuickActions = () => {
  const { t } = useTranslation();

  const actions = [
    {
      id: 'add-device',
      title: t('dashboard.addNewDevice'),
      description: 'Tambah perangkat baru ke sistem monitoring',
      icon: PlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      link: '/devices/add'
    },
    {
      id: 'view-devices',
      title: t('dashboard.viewAllDevices'),
      description: 'Lihat semua perangkat yang dimonitor',
      icon: EyeIcon,
      color: 'bg-green-500 hover:bg-green-600',
      link: '/devices'
    },
    {
      id: 'generate-report',
      title: t('dashboard.generateReport'),
      description: 'Buat laporan kinerja sistem',
      icon: DocumentTextIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      link: '/reports'
    },
    {
      id: 'system-settings',
      title: 'Pengaturan Sistem',
      description: 'Konfigurasi sistem monitoring',
      icon: CogIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
      link: '/settings'
    },
    {
      id: 'performance-metrics',
      title: 'Metrik Kinerja',
      description: 'Lihat metrik kinerja detail',
      icon: ChartBarIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      link: '/monitoring'
    },
    {
      id: 'maintenance',
      title: 'Pemeliharaan',
      description: 'Jadwal dan log pemeliharaan',
      icon: WrenchScrewdriverIcon,
      color: 'bg-red-500 hover:bg-red-600',
      link: '/maintenance'
    }
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('dashboard.quickActions')}
        </h2>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center">
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={action.link}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* System Status Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BellIcon className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Status Sistem
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Semua sistem berjalan normal
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Normal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
