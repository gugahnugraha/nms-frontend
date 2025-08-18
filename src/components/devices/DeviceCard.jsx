import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PingDialog from './PingDialog';
import { pingDevice } from '../../redux/slices/deviceSlice';
import { 
  ServerIcon, 
  WifiIcon, 
  ComputerDesktopIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
// Sound notification dihapus untuk manual ping - hanya untuk status change otomatis

const DeviceCard = ({ device, onEdit, onDelete, isAdmin }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isPinging, setIsPinging] = useState(false);
  const [showPingDialog, setShowPingDialog] = useState(false);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [pingResult, setPingResult] = useState(null);

  // Perform ping with option to show dialog
  const performPing = (showDialog = true) => {
    setIsPinging(true);
    if (showDialog) {
      setShowPingDialog(true);
      setPingResult({
        pingOutput: `PING ${device.ip} (${device.ip}): 56 data bytes\n...\n`,
        alive: null,
        pingDetails: {}
      });
    }
    
    // Suppress next deviceStatusChange toast untuk manual ping
    // Manual ping akan menampilkan dialog, bukan toast
    dispatch(pingDevice(device._id))
      .unwrap()
      .then((result) => {
        // Update dengan data lengkap dari backend
        setPingResult({
          ...result,
          pingDetails: result.pingDetails || { 
            packetLoss: t('common.na'), 
            avg: t('common.na'),
            replies: [],
            summary: {
              packetsSent: 4,
              packetsReceived: 0,
              packetLoss: '100%',
              min: t('common.na'),
              avg: t('common.na'),
              max: t('common.na')
            }
          }
        });
        setLastPingTime(new Date());
        setIsPinging(false);
      })
      .catch((error) => {
        setPingResult({
          success: false,
          alive: false,
          resultMessage: t('devices.pingServiceError'),
          resultType: 'error',
          pingDetails: {
            rawOutput: `Error: ${error.message || 'Unknown error'}`,
            output: `Error: ${error.message || 'Unknown error'}`,
            replies: [],
            summary: {
              packetsSent: 4,
              packetsReceived: 0,
              packetLoss: '100%'
            }
          }
        });
        setLastPingTime(new Date());
        setIsPinging(false);
      });
  };
  
  const handlePing = async () => {
    if (isPinging) return;
    
    setIsPinging(true);
    setPingResult(null);
    
    try {
      const result = await dispatch(pingDevice(device._id)).unwrap();
      setPingResult(result);
      
      // Manual ping tidak memainkan sound - hanya tampilkan dialog
      setShowPingDialog(true);
    } catch (error) {
      console.error('Ping failed:', error);
      // Manual ping tidak memainkan sound - hanya tampilkan dialog
      setPingResult({ alive: false, error: error.message });
      setShowPingDialog(true);
    } finally {
      setIsPinging(false);
    }
  };

  const handleEdit = () => {
    onEdit(device);
  };

  const handleDelete = () => {
    onDelete(device);
  };

  const handleViewDetails = () => {
    navigate(`/devices/${device._id}`);
  };

  const closePingDialog = () => {
    // Tutup dialog dan reset state
    setShowPingDialog(false);
    setPingResult(null);
    setIsPinging(false);
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Helper untuk status konsisten uppercase
  const getStatus = (status) => (status ? status.toUpperCase() : '');
  const isUp = getStatus(device.status) === 'UP';

  return (
    <>
      <div
        className={`device-card ${isUp ? 'device-card-up' : 'device-card-down'}`}
      >
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-md ${isUp ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300' : 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300'}`}>
              <ServerIcon className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {device.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {device.ip}
              </p>
            </div>
          </div>
          <div>
            {isPinging ? (
              <span className="badge badge-warning">
                {t('devices.pinging')}
              </span>
            ) : (
              <span className={`badge ${isUp ? 'badge-success' : 'badge-danger'}`}>
                {isUp ? t('common.up') : t('common.down')}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <SignalIcon className="h-4 w-4 mr-1" />
            <span>{t(`devices.${device.type}`)}</span>
          </div>
          <div className="flex items-center">
            <CpuChipIcon className="h-4 w-4 mr-1" />
            <span>{device.model || t('common.na')}</span>
          </div>
          <div className="flex items-center col-span-2">
            <WifiIcon className="h-4 w-4 mr-1" />
            <span>{device.location || t('common.na')}</span>
          </div>
        </div>

        {/* Last ping status indicator - Hide during ping operations */}
        {lastPingTime && !isPinging && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-1 ${isUp ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                <span>{t('devices.lastPing')}: {isUp ? t('common.success') : t('common.failed')}</span>
              </div>
              <span>{formatTime(lastPingTime)}</span>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button
            onClick={handleViewDetails}
            className="btn btn-primary py-1 px-3 text-xs"
          >
            {t('common.details')}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handlePing}
              disabled={isPinging}
              className="btn btn-secondary py-1 px-3 text-xs"
            >
              {isPinging ? (
                <ExclamationTriangleIcon className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t('common.ping')}
                </>
              )}
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={handleEdit}
                  className="btn btn-info py-1 px-3 text-xs"
                >
                  <ComputerDesktopIcon className="h-4 w-4" />
                </button>

                <button
                  onClick={handleDelete}
                  className="btn btn-danger py-1 px-3 text-xs"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <PingDialog
        isOpen={showPingDialog}
        onClose={closePingDialog}
        device={device}
        pingResult={pingResult}
        isPinging={isPinging}
        lastPingTime={lastPingTime}
      />
    </>
  );
};

export default DeviceCard;