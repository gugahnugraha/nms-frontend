import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { getAlerts, acknowledgeAlert } from '../redux/actions/alertActions';
import soundNotification from '../utils/soundUtils';

const RecentEvents = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { alerts, loading } = useSelector((state) => state.alerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(getAlerts());
  }, [dispatch]);

  const handleAcknowledge = async (alertId) => {
    try {
      await dispatch(acknowledgeAlert(alertId)).unwrap();
      soundNotification.playSuccess();
    } catch (error) {
      soundNotification.playError();
    }
  };

  const normalize = (str) => String(str || '').toLowerCase();

  // Derive severity + status by rule: DOWN => critical, (ack? acknowledged : active); UP => info, resolved
  const derivedAlerts = (alerts || []).map((a) => {
    const isDown = normalize(a.newStatus) === 'down';
    const isUp = normalize(a.newStatus) === 'up';
    const derivedSeverity = isDown ? 'critical' : 'info';
    const derivedStatus = isDown ? (a.acknowledged ? 'acknowledged' : 'active') : 'resolved';
    return { ...a, _derivedSeverity: derivedSeverity, _derivedStatus: derivedStatus };
  });

  // Filtered alerts
  const filteredAlerts = derivedAlerts.filter(alert => {
    const matchesSearch =
      !searchTerm ||
      (alert.deviceName && alert.deviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.device?.name && alert.device?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.message && alert.message.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = !severityFilter || normalize(alert._derivedSeverity) === normalize(severityFilter);

    const sf = normalize(statusFilter);
    let matchesStatus = true;
    if (sf) {
      // status filter strictly by device status Up/Down
      matchesStatus = normalize(alert.newStatus) === sf;
    }

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Alert statistics based on filtered list
  const criticalAlerts = filteredAlerts.filter(alert => normalize(alert._derivedSeverity) === 'critical').length;
  const warningAlerts = filteredAlerts.filter(alert => normalize(alert._derivedSeverity) === 'warning').length;
  const infoAlerts = filteredAlerts.filter(alert => normalize(alert._derivedSeverity) === 'info').length;
  const acknowledgedAlerts = filteredAlerts.filter(alert => normalize(alert._derivedStatus) === 'acknowledged').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {t('alerts.title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                {t('alerts.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('alerts.alertStatistics')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{criticalAlerts}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('alerts.severity.critical')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{warningAlerts}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('alerts.severity.warning')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{infoAlerts}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('alerts.severity.info')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{acknowledgedAlerts}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('alerts.status.acknowledged')}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('alerts.filters.search')}
              </label>
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('alerts.filters.searchPlaceholder')}
                size="md"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('alerts.filters.severity')}
              </label>
              <Select 
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)} 
                size="md" 
                className="w-full"
              >
                <option value="">{t('alerts.filters.allSeverities')}</option>
                <option value="critical">{t('alerts.severity.critical')}</option>
                <option value="warning">{t('alerts.severity.warning')}</option>
                <option value="info">{t('alerts.severity.info')}</option>
                <option value="low">{t('alerts.severity.low')}</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('alerts.filters.status')}
              </label>
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                size="md" 
                className="w-full"
              >
                <option value="">{t('alerts.filters.allStatus')}</option>
                <option value="up">{t('common.up')}</option>
                <option value="down">{t('common.down')}</option>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter('');
                  setStatusFilter('');
                }}
                variant="secondary"
                size="md"
                className="w-full"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                {t('alerts.filters.clear')}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <div className="text-center">
              <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm sm:text-base">{t('common.loading')}</p>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4">⚠️</span>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">{t('alerts.noAlerts')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('alerts.noAlertsDescription')}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {filteredAlerts.map((alert, idx) => (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className={`p-4 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/30'} border-b border-gray-100 dark:border-gray-700 last:border-b-0`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {normalize(alert.newStatus) === 'up' ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">✓</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">✕</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        {alert.deviceName || alert.device?.name || t('common.na')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {alert.message || t('alerts.statusChanged', { from: alert.previousStatus, to: alert.newStatus })}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${normalize(alert.newStatus) === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {normalize(alert.newStatus) === 'up' ? t('common.up') : t('common.down')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    {normalize(alert._derivedStatus) !== 'active' ? (
                      <span className={`font-medium text-xs ${normalize(alert._derivedStatus) === 'acknowledged' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                        {t(`alerts.status.${alert._derivedStatus}`)}
                      </span>
                    ) : (
                      <Button
                        onClick={() => handleAcknowledge(alert._id)}
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 py-1 h-auto"
                      >
                        {t('alerts.actions.acknowledge')}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto max-h-[70vh]">
              <table className="min-w-full">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('alerts.table.device')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('alerts.table.event')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('alerts.table.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('alerts.table.time')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('alerts.table.ack')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredAlerts.map((alert, idx) => (
                  <motion.tr
                    key={alert._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className={`text-sm ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/30'} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {normalize(alert.newStatus) === 'up' ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">✓</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600">✕</span>
                      )}
                      <span className="truncate max-w-[180px]" title={alert.deviceName || alert.device?.name || t('common.na')}>
                        {alert.deviceName || alert.device?.name || t('common.na')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 max-w-[420px] truncate" title={alert.message || t('alerts.statusChanged', { from: alert.previousStatus, to: alert.newStatus })}>
                      {alert.message || t('alerts.statusChanged', { from: alert.previousStatus, to: alert.newStatus })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${normalize(alert.newStatus) === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {normalize(alert.newStatus) === 'up' ? t('common.up') : t('common.down')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-300">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {normalize(alert._derivedStatus) !== 'active' ? (
                        <span className={`font-medium ${normalize(alert._derivedStatus) === 'acknowledged' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                          {t(`alerts.status.${alert._derivedStatus}`)}
                        </span>
                      ) : (
                        <Button
                          onClick={() => handleAcknowledge(alert._id)}
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 h-auto"
                        >
                          {t('alerts.actions.acknowledge')}
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default RecentEvents;