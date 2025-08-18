import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import {
  HomeIcon,
  ServerIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  MapIcon,
  BellIcon,
  ClockIcon,
  DocumentTextIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  
  const sidebarVariants = {
    open: { width: '16rem', opacity: 1, x: 0 },
    closed: { width: '5rem', opacity: 1, x: 0 }
  };
  
  const navItems = [
    // Alerts navigation removed
    { 
      name: t('dashboard.title'), 
      path: '/', 
      icon: <HomeIcon className="w-6 h-6" />,
      adminOnly: false
    },
    { 
      name: t('devices.title'), 
      path: '/devices', 
      icon: <ServerIcon className="w-6 h-6" />,
      adminOnly: false
    },
    // { 
    //   name: t('monitoring.title'), 
    //   path: '/monitoring', 
    //   icon: <ChartBarIcon className="w-6 h-6" />,
    //   adminOnly: false
    // },
    { 
      name: t('topology.title'), 
      path: '/topology', 
      icon: <MapIcon className="w-6 h-6" />,
      adminOnly: false
    },
    { 
      name: t('reports.title'), 
      path: '/reports', 
      icon: <DocumentTextIcon className="w-6 h-6" />,
      adminOnly: false
    },
    // {
    //   name: 'Collector',
    //   path: '/collector',
    //   icon: <ChartBarIcon className="w-6 h-6" />,
    //   adminOnly: false
    // },
    { 
      name: t('users.title'), 
      path: '/users', 
      icon: <UsersIcon className="w-6 h-6" />,
      adminOnly: true
    },
    { 
      name: t('alerts.title'),
      path: '/alerts',
      icon: <BellIcon className="w-6 h-6" />,
      adminOnly: false
    },
    { 
      name: t('settings.title'), 
      path: '/settings', 
      icon: <CogIcon className="w-6 h-6" />,
      adminOnly: false
    },
    { 
      name: 'About', 
      path: '/about', 
      icon: <InformationCircleIcon className="w-6 h-6" />,
      adminOnly: false
    }
  ];

  return (
    <motion.div
      variants={sidebarVariants}
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm z-20 fixed left-0 top-16 bottom-0"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              (!item.adminOnly || user?.role === 'admin') && (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {isOpen && <span>{item.name}</span>}
                  </NavLink>
                </li>
              )
            ))}
          </ul>
        </div>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            {isOpen ? (
              <span className="inline-flex items-center gap-1">
                <span>Made with</span>
                <HeartSolidIcon className="w-4 h-4 text-red-500" aria-hidden />
                <span>by</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Gugah Nugraha</span>
              </span>
            ) : (
              <HeartSolidIcon className="w-4 h-4 text-red-500" aria-label="Made with love by Gugah Nugraha" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;