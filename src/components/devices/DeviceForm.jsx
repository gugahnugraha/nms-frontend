import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { DEVICE_TYPES } from '../../config/constants';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DeviceForm = ({ isOpen, onClose, onSubmit, device = null }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    location: '',
    deviceId: '',
    type: DEVICE_TYPES.ROUTER,
    community: 'public'
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        ip: device.ip || '',
        location: device.location || '',
        deviceId: device.deviceId || '',
        type: device.type || DEVICE_TYPES.ROUTER,
        community: device.community || 'public'
      });
    } else {
      setFormData({
        name: '',
        ip: '',
        location: '',
        deviceId: '',
        type: DEVICE_TYPES.ROUTER,
        community: 'public'
      });
    }
    setErrors({});
  }, [device, isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('errors.required');
    }
    
    if (!formData.ip.trim()) {
      newErrors.ip = t('errors.required');
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ip)) {
      newErrors.ip = t('errors.invalidIp');
    }
    
    if (!formData.deviceId.trim()) {
      newErrors.deviceId = t('errors.required');
    } else if (formData.deviceId.length !== 2) {
      newErrors.deviceId = t('errors.minLength', { count: 2 });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {device ? t('devices.editDevice') : t('devices.addDevice')}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="label">
                        {t('devices.deviceName')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input ${errors.name ? 'border-danger-500 dark:border-danger-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="ip" className="label">
                        {t('devices.ipAddress')}
                      </label>
                      <input
                        type="text"
                        id="ip"
                        name="ip"
                        value={formData.ip}
                        onChange={handleChange}
                        className={`input ${errors.ip ? 'border-danger-500 dark:border-danger-500' : ''}`}
                      />
                      {errors.ip && (
                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                          {errors.ip}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="deviceId" className="label">
                        {t('devices.deviceId')} (2 {t('errors.minLength', { count: 2 })})
                      </label>
                      <input
                        type="text"
                        id="deviceId"
                        name="deviceId"
                        value={formData.deviceId}
                        onChange={handleChange}
                        maxLength={2}
                        className={`input ${errors.deviceId ? 'border-danger-500 dark:border-danger-500' : ''}`}
                      />
                      {errors.deviceId && (
                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                          {errors.deviceId}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="label">
                        {t('devices.location')}
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="type" className="label">
                        {t('devices.deviceType')}
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value={DEVICE_TYPES.ROUTER}>{t('devices.router')}</option>
                        <option value={DEVICE_TYPES.SWITCH}>{t('devices.switch')}</option>
                        <option value={DEVICE_TYPES.BRIDGE}>{t('devices.bridge')}</option>
                        <option value={DEVICE_TYPES.SERVER}>{t('devices.server')}</option>
                        <option value={DEVICE_TYPES.DESKTOP}>{t('devices.desktop')}</option>
                        <option value={DEVICE_TYPES.OTHER}>{t('devices.other')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="community" className="label">
                        {t('devices.community')}
                      </label>
                      <input
                        type="text"
                        id="community"
                        name="community"
                        value={formData.community}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={onClose}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {device ? t('common.save') : t('common.add')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeviceForm;