import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@headlessui/react';
import { 
  XMarkIcon, 
  ComputerDesktopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import './PingDialog.css';

const PingDialog = ({ isOpen, onClose, device, pingResult, isPinging, lastPingTime }) => {
  const { t } = useTranslation();

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Determine ping status and message
  const getPingStatus = () => {
    if (!pingResult) return { status: 'pending', message: t('devices.pingWaiting'), color: 'gray' };
    
    if (pingResult.alive) {
      return { 
        status: 'success', 
        message: t('devices.pingSuccessDetail'), 
        color: 'green',
        icon: CheckCircleIcon
      };
    } else {
      return { 
        status: 'failed', 
        message: t('devices.pingFailedDetail'), 
        color: 'red',
        icon: XCircleIcon
      };
    }
  };

  const pingStatus = getPingStatus();
  const StatusIcon = pingStatus.icon;

  if (!device) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 p-4 shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <ComputerDesktopIcon className="h-5 w-5 mr-2" />
              {t('devices.pingResult')} - {device.name}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Ping Status Indicator - Only show after ping is complete */}
          {pingResult && !isPinging && (
            <div className={`mb-3 p-2 rounded-md border ${
              pingStatus.status === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center">
                <StatusIcon className={`h-4 w-4 mr-2 ${
                  pingStatus.status === 'success' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
                <span className={`text-sm font-medium ${
                  pingStatus.status === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {pingStatus.message}
                </span>
              </div>
            </div>
          )}

          {/* Terminal Output */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devices.terminalOutput')}</h4>
            <div className="ping-terminal bg-gray-900 text-gray-100 p-3 rounded-md text-xs font-mono overflow-auto max-h-48">
              <div className="ping-terminal-header terminal-header flex items-center mb-2">
                <div className="ping-terminal-button red h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                <div className="ping-terminal-button yellow h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="ping-terminal-button green h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-400">ping {device.ip}</span>
              </div>
              <pre className="whitespace-pre-wrap">
                {pingResult?.pingDetails?.rawOutput || pingResult?.pingDetails?.output || `PING ${device.ip} (${device.ip}): 56 data bytes\n...\n`}
              </pre>
              {isPinging && (
                <div className="flex items-center mt-2">
                  <div className="ping-terminal-cursor terminal-cursor inline-block w-2 h-4 bg-gray-300 ml-1"></div>
                  <span className="text-gray-400 ml-2 ping-loading-dots">{t('devices.pinging')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ping Summary - Only show after ping is complete */}
          {pingResult && !isPinging && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devices.pingSummary')}</h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className={`text-sm font-bold ${
                    pingResult.alive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {pingResult.alive ? t('devices.deviceStatus.online') : t('devices.deviceStatus.offline')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('common.status')}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {pingResult.pingDetails?.summary?.packetsReceived || 0}/4
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('devices.received')}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {pingResult.pingDetails?.summary?.packetLoss || t('common.na')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('devices.loss')}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    {pingResult.pingDetails?.summary?.avg || t('common.na')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('devices.avg')}</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isPinging && !pingResult && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('devices.pinging')} {device.ip}...
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md"
            >
              {t('common.close')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PingDialog;