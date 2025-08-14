import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { toggleDarkMode as toggleDarkModeRedux } from '../redux/slices/uiSlice';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/ui/Button';
import {
  Cog6ToothIcon,
  ServerIcon,
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  WifiIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  KeyIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const TAB_STYLES = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-l-4 border-green-500',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-l-4 border-red-500'
};

const getTabClass = (color, isActive) =>
  isActive ? TAB_STYLES[color] : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { darkMode: darkModeRedux } = useSelector((state) => state.ui);
  const { darkMode: darkModeCtx, toggleDarkMode } = useTheme();
  const { language, changeLanguage } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('system');
  const [settings, setSettings] = useState(() => ({
    system: {
      snmpTimeout: 5000,
      pingInterval: 30,
      dataRetention: 30,
      maxDevices: 1000,
      autoDiscovery: true,
      maintenanceMode: false
    },
    notifications: {
      emailEnabled: true,
      emailServer: 'smtp.gmail.com',
      emailPort: 587,
      emailUser: '',
      emailPassword: '',
      webhookEnabled: false,
      webhookUrl: '',
      toastEnabled: true,
      alertThreshold: 5,
      emailAlerts: true,
      smsAlerts: false
    },
    appearance: {
      theme: darkModeCtx ? 'dark' : 'light',
      language: language || i18n.language,
      compactMode: false,
      showAnimations: true,
      chartTheme: 'default'
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      twoFactorAuth: false,
      apiKeyExpiry: 365,
      allowedIPs: '',
      auditLogging: true
    }
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const settingsTabs = [
    { id: 'system', name: t('settings.tabs.system'), icon: ServerIcon, color: 'blue' },
    { id: 'notifications', name: t('settings.tabs.notifications'), icon: BellIcon, color: 'green' },
    { id: 'appearance', name: t('settings.tabs.appearance'), icon: PaintBrushIcon, color: 'purple' },
    { id: 'security', name: t('settings.tabs.security'), icon: ShieldCheckIcon, color: 'red' }
  ];

  const applySideEffectsIfNeeded = (category, key, value) => {
    if (category === 'appearance' && key === 'theme') {
      const wantDark = value === 'dark';
      if (wantDark !== darkModeCtx) {
        // Toggle context theme (updates document and localStorage)
        toggleDarkMode();
        // Keep Redux UI slice in sync if digunakan di tempat lain
        dispatch(toggleDarkModeRedux());
      }
    }
    if (category === 'appearance' && key === 'language') {
      if (value && value !== language) {
        changeLanguage(value);
      }
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    applySideEffectsIfNeeded(category, key, value);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(t('settings.toasts.saved'));
    } catch (error) {
      toast.error(t('settings.toasts.failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailConnection = async () => {
    setTestingConnection(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t('settings.toasts.testSuccess'));
    } catch (error) {
      toast.error(t('settings.toasts.testFailed'));
    } finally {
      setTestingConnection(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm(t('settings.confirmReset'))) {
      const defaultSettings = {
        system: {
          snmpTimeout: 5000,
          pingInterval: 30,
          dataRetention: 30,
          maxDevices: 1000,
          autoDiscovery: true,
          maintenanceMode: false
        },
        notifications: {
          emailEnabled: true,
          emailServer: 'smtp.gmail.com',
          emailPort: 587,
          emailUser: '',
          emailPassword: '',
          webhookEnabled: false,
          webhookUrl: '',
          toastEnabled: true,
          alertThreshold: 5,
          emailAlerts: true,
          smsAlerts: false
        },
        appearance: {
          theme: 'light',
          language: 'en',
          compactMode: false,
          showAnimations: true,
          chartTheme: 'default'
        },
        security: {
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          requireStrongPassword: true,
          twoFactorAuth: false,
          apiKeyExpiry: 365,
          allowedIPs: '',
          auditLogging: true
        }
      };
      setSettings(defaultSettings);
      // Terapkan efek: set ke light dan bahasa en
      if (darkModeCtx) {
        toggleDarkMode();
        dispatch(toggleDarkModeRedux());
      }
      if (language !== 'en') {
        changeLanguage('en');
      }
      toast.info(t('settings.toasts.reset'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              {t('settings.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {t('settings.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${getTabClass(tab.color, activeTab === tab.id)}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {/* Action bar */}
              <div className="flex items-center justify-end gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                >
                  {t('settings.actions.reset')}
                </Button>
                <Button
                  variant="primary"
                  icon={isSaving ? ArrowPathIcon : CheckCircleIcon}
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className={isSaving ? 'animate-pulse' : ''}
                >
                  {isSaving ? t('settings.actions.saving') : t('settings.actions.save')}
                </Button>
              </div>

              {/* System Settings */}
              {activeTab === 'system' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <ServerIcon className="h-6 w-6 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.system.title')}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SNMP Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <WifiIcon className="h-5 w-5 mr-2 text-blue-500" />
                        {t('settings.system.snmp')}
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.system.snmpTimeout')}
                        </label>
                        <input
                          type="number"
                          value={settings.system.snmpTimeout}
                          onChange={(e) => handleSettingChange('system', 'snmpTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.system.pingInterval')}
                        </label>
                        <input
                          type="number"
                          value={settings.system.pingInterval}
                          onChange={(e) => handleSettingChange('system', 'pingInterval', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Data Management */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <CircleStackIcon className="h-5 w-5 mr-2 text-green-500" />
                        {t('settings.system.dataManagement')}
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.system.dataRetention')}
                        </label>
                        <input
                          type="number"
                          value={settings.system.dataRetention}
                          onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.system.maxDevices')}
                        </label>
                        <input
                          type="number"
                          value={settings.system.maxDevices}
                          onChange={(e) => handleSettingChange('system', 'maxDevices', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Toggles */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.system.options')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.system.autoDiscovery')}</label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.system.autoDiscoveryDesc')}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('system', 'autoDiscovery', !settings.system.autoDiscovery)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.system.autoDiscovery ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.system.autoDiscovery ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.system.maintenanceMode')}</label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.system.maintenanceModeDesc')}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('system', 'maintenanceMode', !settings.system.maintenanceMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.system.maintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.system.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <BellIcon className="h-6 w-6 text-green-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.notifications.title')}</h2>
                  </div>
                  
                  {/* Email Configuration */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-500" />
                      {t('settings.notifications.emailConfig')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.notifications.smtpServer')}
                        </label>
                        <input
                          type="text"
                          value={settings.notifications.emailServer}
                          onChange={(e) => handleSettingChange('notifications', 'emailServer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.notifications.smtpPort')}
                        </label>
                        <input
                          type="number"
                          value={settings.notifications.emailPort}
                          onChange={(e) => handleSettingChange('notifications', 'emailPort', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.notifications.emailUser')}
                        </label>
                        <input
                          type="email"
                          value={settings.notifications.emailUser}
                          onChange={(e) => handleSettingChange('notifications', 'emailUser', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.notifications.emailPassword')}
                        </label>
                        <input
                          type="password"
                          value={settings.notifications.emailPassword}
                          onChange={(e) => handleSettingChange('notifications', 'emailPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={testingConnection ? ArrowPathIcon : CheckCircleIcon}
                        onClick={testEmailConnection}
                        disabled={testingConnection}
                        className={testingConnection ? 'animate-pulse' : ''}
                      >
                        {testingConnection ? t('settings.actions.testing') : t('settings.actions.test')}
                      </Button>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.notifications.preferences')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.notifications.emailAlerts')}</label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.emailAlertsDesc')}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('notifications', 'emailAlerts', !settings.notifications.emailAlerts)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.notifications.emailAlerts ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.notifications.toastNotifications')}</label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.toastNotificationsDesc')}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('notifications', 'toastEnabled', !settings.notifications.toastEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.notifications.toastEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.toastEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <PaintBrushIcon className="h-6 w-6 text-purple-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.appearance.title')}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        {darkModeCtx ? (
                          <MoonIcon className="h-5 w-5 mr-2 text-indigo-500" />
                        ) : (
                          <SunIcon className="h-5 w-5 mr-2 text-yellow-500" />
                        )}
                        {t('settings.appearance.theme')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleSettingChange('appearance', 'theme', 'light')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            !darkModeCtx
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <SunIcon className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                          <div className="text-sm font-medium">{t('settings.appearance.light')}</div>
                        </button>
                        <button
                          onClick={() => handleSettingChange('appearance', 'theme', 'dark')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            darkModeCtx
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <MoonIcon className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
                          <div className="text-sm font-medium">{t('settings.appearance.dark')}</div>
                        </button>
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <LanguageIcon className="h-5 w-5 mr-2 text-green-500" />
                        {t('settings.appearance.language')}
                      </h3>
                      <select
                        value={language}
                        onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="id">Bahasa Indonesia</option>
                      </select>
                    </div>

                    {/* UI Preferences */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.appearance.uiPreferences')}</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.appearance.compactMode')}</label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appearance.compactModeDesc')}</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('appearance', 'compactMode', !settings.appearance.compactMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.appearance.compactMode ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.appearance.showAnimations')}</label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appearance.showAnimationsDesc')}</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('appearance', 'showAnimations', !settings.appearance.showAnimations)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.appearance.showAnimations ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.appearance.showAnimations ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <ShieldCheckIcon className="h-6 w-6 text-red-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.security.title')}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Authentication */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <KeyIcon className="h-5 w-5 mr-2 text-blue-500" />
                        {t('settings.security.authentication')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('settings.security.sessionTimeout')}
                          </label>
                          <input
                            type="number"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('settings.security.maxLoginAttempts')}
                          </label>
                          <input
                            type="number"
                            value={settings.security.maxLoginAttempts}
                            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Security Options */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.security.options')}</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.security.requireStrongPassword')}</label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.requireStrongPasswordDesc')}</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('security', 'requireStrongPassword', !settings.security.requireStrongPassword)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.security.requireStrongPassword ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.security.requireStrongPassword ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.security.twoFactorAuth')}</label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.twoFactorAuthDesc')}</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.security.twoFactorAuth ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.security.auditLogging')}</label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.auditLoggingDesc')}</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('security', 'auditLogging', !settings.security.auditLogging)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.security.auditLogging ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.security.auditLogging ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Network Security */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <GlobeAltIcon className="h-5 w-5 mr-2 text-green-500" />
                        {t('settings.security.networkSecurity')}
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.security.allowedIPs')}
                        </label>
                        <textarea
                          value={settings.security.allowedIPs}
                          onChange={(e) => handleSettingChange('security', 'allowedIPs', e.target.value)}
                          placeholder="192.168.1.0/24, 10.0.0.0/8"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {t('settings.security.allowedIPsHint')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
