import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  getDevices, 
  createDevice, 
  updateDevice, 
  deleteDevice,
  pingDevice
} from '../redux/slices/deviceSlice';
import { subscribeToDevices } from '../services/socketService';
import DeviceCard from '../components/devices/DeviceCard';
import DeviceForm from '../components/devices/DeviceForm';
import PingDialog from '../components/devices/PingDialog';
import { Dialog } from '@headlessui/react';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  DeviceTabletIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';

const Devices = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { devices, isLoading } = useSelector((state) => state.devices);
  const { user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [sortBy, setSortBy] = useState('deviceId');
  const [sortOrder, setSortOrder] = useState('asc');
  // Ping dialog states (for table view)
  const [isPinging, setIsPinging] = useState(false);
  const [showPingDialog, setShowPingDialog] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pageRef = useRef(null);
  
  useEffect(() => {
    if (!initialLoadComplete) {
      dispatch(getDevices()).then(() => {
        setInitialLoadComplete(true);
      });
    }
  }, [dispatch, initialLoadComplete]);
  
  // Subscribe to device updates when devices are loaded
  useEffect(() => {
    if (devices && devices.length > 0) {
      console.log('[DEVICES] Subscribing to device updates for', devices.length, 'devices');
      subscribeToDevices(devices.map(d => d._id));
    }
  }, [devices]);

  // Fullscreen handlers
  useEffect(() => {
    const onFsChange = () => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      setIsFullscreen(Boolean(fs));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('MSFullscreenChange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('MSFullscreenChange', onFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const elem = pageRef.current || document.documentElement;
    const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      if (req) req.call(elem);
    } else if (exit) {
      exit.call(document);
    }
  };
  
  // Filter and sort devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType ? device.type === filterType : true;
    const matchesStatus = filterStatus ? device.status.toLowerCase() === filterStatus.toLowerCase() : true;

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'deviceId') {
      return sortOrder === 'asc' 
        ? a.deviceId.localeCompare(b.deviceId)
        : b.deviceId.localeCompare(a.deviceId);
    } else if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'status') {
      // Custom sort: 'up' < 'down' untuk asc, sebaliknya untuk desc
      const statusOrder = { up: 0, down: 1 };
      return sortOrder === 'asc'
        ? (statusOrder[a.status] - statusOrder[b.status])
        : (statusOrder[b.status] - statusOrder[a.status]);
    }
    return 0;
  });
  
  const handleOpenForm = (device = null) => {
    setCurrentDevice(device);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentDevice(null);
  };
  
  const handleOpenDeleteDialog = (device) => {
    setCurrentDevice(device);
    setIsDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCurrentDevice(null);
  };
  
  const handleSubmitDevice = (formData) => {
    if (currentDevice) {
      dispatch(updateDevice({ id: currentDevice._id, deviceData: formData }))
        .unwrap()
        .then(() => {
          handleCloseForm();
        })
        .catch(() => {
          // toast.error(t('errors.serverError')); // Removed toast
        });
    } else {
      dispatch(createDevice(formData))
        .unwrap()
        .then(() => {
          handleCloseForm();
        })
        .catch(() => {
          // toast.error(t('errors.serverError')); // Removed toast
        });
    }
  };
  
  const handleDeleteDevice = () => {
    dispatch(deleteDevice(currentDevice._id))
      .unwrap()
      .then(() => {
        handleCloseDeleteDialog();
      })
      .catch(() => {
        // toast.error(t('errors.serverError')); // Removed toast
      });
  };
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Ping handler for table view
  const handlePingDevice = (device) => {
    setCurrentDevice(device);
    setIsPinging(true);
    setShowPingDialog(true);
    setPingResult({ pingOutput: `PING ${device.ip} (${device.ip})`, alive: null, pingDetails: {} });
    
    dispatch(pingDevice(device._id))
      .unwrap()
      .then((result) => {
        setPingResult({
          ...result,
          pingDetails: result.pingDetails || {
            packetLoss: 'N/A',
            avg: 'N/A',
            replies: [],
            summary: {
              packetsSent: 4,
              packetsReceived: result.alive ? 4 : 0,
              packetLoss: result.alive ? '0%' : '100%'
            }
          }
        });
        setLastPingTime(new Date());
      })
      .catch((error) => {
        setPingResult({
          success: false,
          alive: false,
          resultMessage: 'Ping service error',
          resultType: 'error',
          pingDetails: {
            rawOutput: `Error: ${error.message || 'Unknown error'}`,
            output: `Error: ${error.message || 'Unknown error'}`,
            replies: [],
            summary: { packetsSent: 4, packetsReceived: 0, packetLoss: '100%' }
          }
        });
        setLastPingTime(new Date());
      })
      .finally(() => setIsPinging(false));
  };
  
  if (isLoading && !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`container mx-auto ${isFullscreen ? 'bg-white dark:bg-gray-900 min-h-screen h-screen overflow-y-auto' : ''}`} ref={pageRef}>
      {isFullscreen && (
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={5}
        />
      )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {t('devices.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('devices.description')}
              </p>
            </div>
            
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('devices.totalDevices')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{devices.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DeviceTabletIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('devices.deviceStatus.online')}</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {devices.filter(d => d.status === 'UP').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('devices.deviceStatus.offline')}</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {devices.filter(d => d.status === 'DOWN').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('devices.deviceStatus.warning')}</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {devices.filter(d => d.status === 'WARNING').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('devices.filters.search')}
              </label>
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('devices.filters.searchPlaceholder')}
                size="md"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('devices.filters.status')}
              </label>
              <Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                size="md" 
                className="w-full"
              >
                <option value="">{t('common.allStatuses')}</option>
                <option value="UP">{t('common.up')}</option>
                <option value="DOWN">{t('common.down')}</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('devices.filters.type')}
              </label>
              <Select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                size="md" 
                className="w-full"
              >
                <option value="">{t('common.filter')}</option>
                <option value="router">{t('devices.router')}</option>
                <option value="switch">{t('devices.switch')}</option>
                <option value="bridge">{t('devices.bridge')}</option>
                <option value="server">{t('devices.server')}</option>
                <option value="desktop">{t('devices.desktop')}</option>
                <option value="other">{t('devices.other')}</option>
              </Select>
            </div>
            
            <div className="flex items-end justify-end gap-2">
              <Button
                onClick={toggleFullscreen}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 px-3 py-3 rounded-lg"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </Button>
              {user?.role === 'admin' && (
                <Button
                  onClick={() => handleOpenForm()}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  {t('devices.addDevice')}
                </Button>
              )}
            </div>
          </div>
        </div>
      
      {/* Devices Grid/Table */}
      {filteredDevices.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {t('monitoring.noData')}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device._id}
              device={device}
              onEdit={handleOpenForm}
              onDelete={handleOpenDeleteDialog}
              isAdmin={user?.role === 'admin'}
            />
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th 
                  className="table-header-cell cursor-pointer"
                  onClick={() => handleSort('deviceId')}
                >
                  <div className="flex items-center">
                    <span>{t('devices.deviceId')}</span>
                    {sortBy === 'deviceId' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>{t('devices.deviceName')}</span>
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="table-header-cell">{t('devices.ipAddress')}</th>
                <th className="table-header-cell">{t('devices.deviceType')}</th>
                <th className="table-header-cell">{t('devices.location')}</th>
                <th 
                  className="table-header-cell cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    <span>{t('common.status')}</span>
                    {sortBy === 'status' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="table-header-cell">{t('devices.lastPing')}</th>
                <th className="table-header-cell">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredDevices.map((device) => (
                <tr key={device._id} className="table-row">
                  <td className="table-cell">{device.deviceId}</td>
                  <td className="table-cell font-medium text-gray-900 dark:text-white">
                    {device.name}
                  </td>
                  <td className="table-cell">{device.ip}</td>
                  <td className="table-cell">{t(`devices.${device.type}`)}</td>
                  <td className="table-cell">{device.location || '-'}</td>
                  <td className="table-cell">
                    <span className={`badge ${device.status === 'UP' ? 'badge-success' : 'badge-danger'}`}>
                      {device.status === 'UP' ? t('common.up') : t('common.down')}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${device.status === 'UP' ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('monitoring.realtime')}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePingDevice(device)}
                        className="btn btn-secondary py-1 px-2 text-xs"
                      >
                        <SignalIcon className="h-4 w-4 mr-1" />
                        {t('common.ping')}
                      </button>
                      
                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => handleOpenForm(device)}
                            className="btn btn-info py-1 px-2 text-xs"
                          >
                            {t('common.edit')}
                          </button>
                          
                          <button
                            onClick={() => handleOpenDeleteDialog(device)}
                            className="btn btn-danger py-1 px-2 text-xs"
                          >
                            {t('common.delete')}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Device Form Dialog */}
      <DeviceForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitDevice}
        device={currentDevice}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-center mb-4 text-warning-500">
              <ExclamationTriangleIcon className="h-12 w-12" />
            </div>
            
            <Dialog.Title className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
              {t('devices.deleteDevice')}
            </Dialog.Title>
            
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              {t('devices.deleteConfirm')}
              <br />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {currentDevice?.name} ({currentDevice?.ip})
              </span>
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={handleCloseDeleteDialog}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteDevice}
              >
                {t('common.delete')}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Ping Result Dialog for table view */}
      <PingDialog
        isOpen={showPingDialog}
        onClose={() => setShowPingDialog(false)}
        device={currentDevice}
        pingResult={pingResult}
        isPinging={isPinging}
        lastPingTime={lastPingTime}
      />
    </div>
  );
};

export default Devices;