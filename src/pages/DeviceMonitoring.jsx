import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getDevices } from '../redux/slices/deviceSlice';
import { getDeviceSnmpData } from '../redux/slices/snmpSlice';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import {
  ServerIcon,
  SignalIcon,
  ClockIcon,
  CpuChipIcon,
  CircleStackIcon,
  ArrowPathIcon,
  FireIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  WifiIcon,
  GlobeAltIcon,
  ChartBarIcon,
  FunnelIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';

const DeviceMonitoring = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);
  const { alerts } = useSelector((state) => state.alerts);
  const { devices } = useSelector((state) => state.devices);
  const { deviceData } = useSelector((state) => state.snmp);

  // State Management
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'chart'
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isRealtime, setIsRealtime] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('cpu');

  // Auto-refresh functionality
  useEffect(() => {
    if (!isRealtime) return;
    
    const interval = setInterval(() => {
      dispatch(getDevices());
      selectedDevices.forEach(deviceId => {
        dispatch(getDeviceSnmpData(deviceId));
      });
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [dispatch, isRealtime, refreshInterval, selectedDevices]);

  // Safe devices array
  const safeDevices = useMemo(() => Array.isArray(devices) ? devices : [], [devices]);

  // Filtered devices based on search and filters
  const filteredDevices = useMemo(() => {
    return safeDevices.filter(device => {
      const matchesSearch = !searchTerm || 
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.ip.includes(searchTerm) ||
        (device.location && device.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      const matchesType = typeFilter === 'all' || device.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [safeDevices, searchTerm, statusFilter, typeFilter]);

  // Device types for filter
  const deviceTypes = useMemo(() => {
    const types = [...new Set(safeDevices.map(d => d.type).filter(Boolean))];
    return types.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }));
  }, [safeDevices]);
  
  // Normalize deviceData to array
  const deviceDataArray = useMemo(() => {
    if (Array.isArray(deviceData)) return deviceData;
    if (deviceData && (deviceData.deviceId || deviceData.device)) {
      const id = deviceData.deviceId || deviceData.device;
      return [{ device: id, metrics: deviceData.metrics || {} }];
    }
    return [];
  }, [deviceData]);
  // Handlers
  const handleDeviceSelect = useCallback((deviceId) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  }, []);
  
  const handleSelectAll = useCallback(() => {
    setSelectedDevices(filteredDevices.map(d => d._id));
  }, [filteredDevices]);

  const handleDeselectAll = useCallback(() => {
    setSelectedDevices([]);
  }, []);
  
  // Enhanced Statistics
  const deviceStats = useMemo(() => {
    const total = filteredDevices.length;
    const up = filteredDevices.filter(d => d.status === 'up').length;
    const down = filteredDevices.filter(d => d.status === 'down').length;
    const warning = filteredDevices.filter(d => {
      const metrics = deviceDataArray.find(data => data.device === d._id)?.metrics;
      return metrics?.cpu > 80 || metrics?.memory > 80 || metrics?.temperature > 70;
    }).length;
    const critical = filteredDevices.filter(d => {
      const metrics = deviceDataArray.find(data => data.device === d._id)?.metrics;
      return metrics?.cpu > 95 || metrics?.memory > 95 || metrics?.temperature > 85;
    }).length;

    return {
      total,
      up,
      down,
      warning,
      critical,
      upPercentage: total ? Math.round((up / total) * 100) : 0,
      downPercentage: total ? Math.round((down / total) * 100) : 0,
      warningPercentage: total ? Math.round((warning / total) * 100) : 0,
      criticalPercentage: total ? Math.round((critical / total) * 100) : 0
    };
  }, [filteredDevices, deviceDataArray]);

  // Network Health Score
  const networkHealthScore = useMemo(() => {
    const { total, up, warning, critical } = deviceStats;
    if (total === 0) return 100;
    
    const baseScore = (up / total) * 100;
    const warningPenalty = (warning / total) * 10;
    const criticalPenalty = (critical / total) * 25;
    
    return Math.max(0, Math.round(baseScore - warningPenalty - criticalPenalty));
  }, [deviceStats]);

  // Aggregate metrics for selected devices
  const aggregateMetrics = useMemo(() => {
    if (selectedDevices.length === 0) return null;
    
    const selectedData = deviceDataArray.filter(data => 
      selectedDevices.includes(data.device)
    );
    
    if (selectedData.length === 0) return null;

    const totalMetrics = selectedData.reduce((acc, data) => {
      const metrics = data.metrics || {};
      return {
        cpu: acc.cpu + (metrics.cpu || 0),
        memory: acc.memory + (metrics.memory || 0),
        bandwidthIn: acc.bandwidthIn + (metrics.bandwidthIn || 0),
        bandwidthOut: acc.bandwidthOut + (metrics.bandwidthOut || 0),
        temperature: acc.temperature + (metrics.temperature || 0),
        count: acc.count + 1
      };
    }, { cpu: 0, memory: 0, bandwidthIn: 0, bandwidthOut: 0, temperature: 0, count: 0 });

    return {
      avgCpu: Math.round(totalMetrics.cpu / totalMetrics.count),
      avgMemory: Math.round(totalMetrics.memory / totalMetrics.count),
      totalBandwidthIn: totalMetrics.bandwidthIn,
      totalBandwidthOut: totalMetrics.bandwidthOut,
      avgTemperature: Math.round(totalMetrics.temperature / totalMetrics.count),
      deviceCount: totalMetrics.count
    };
  }, [selectedDevices, deviceDataArray]);

  // Chart data for metrics visualization
  const chartData = useMemo(() => {
    return filteredDevices.map(device => {
      const metrics = deviceDataArray.find(data => data.device === device._id)?.metrics || {};
      return {
        name: device.name,
        deviceId: device._id,
        status: device.status,
        cpu: metrics.cpu || 0,
        memory: metrics.memory || 0,
        bandwidthIn: metrics.bandwidthIn || 0,
        bandwidthOut: metrics.bandwidthOut || 0,
        temperature: metrics.temperature || 0,
        uptime: metrics.uptime || 0
      };
    });
  }, [filteredDevices, deviceDataArray]);

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Format bandwidth
  const formatBandwidth = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} Gbps`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Mbps`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} Kbps`;
    return `${value.toFixed(0)} bps`;
  };

  // Device type distribution for pie chart
  const deviceTypeDistribution = useMemo(() => {
    const distribution = {};
    filteredDevices.forEach(device => {
      const type = device.type || 'unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return Object.entries(distribution).map(([type, count], index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      percentage: Math.round((count / filteredDevices.length) * 100),
      color: COLORS[index % COLORS.length]
    }));
  }, [filteredDevices]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => [
    { name: 'Up', value: deviceStats.up, color: '#10b981' },
    { name: 'Down', value: deviceStats.down, color: '#ef4444' },
    { name: 'Warning', value: deviceStats.warning, color: '#f59e0b' },
    { name: 'Critical', value: deviceStats.critical, color: '#dc2626' }
  ].filter(item => item.value > 0), [deviceStats]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {t('monitoring.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('monitoring.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('monitoring.deviceList')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <motion.div
                key={device._id}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{device.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    device.status === 'UP' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {device.status === 'UP' ? t('devices.deviceStatus.online') : t('devices.deviceStatus.offline')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{device.ip}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{device.type}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Performance Charts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('monitoring.performanceCharts')}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">{t('monitoring.cpuUsage')}</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cpu" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">{t('monitoring.memoryUsage')}</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="memory" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('monitoring.alertSection')}</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  alert.severity === 'critical' ? 'bg-red-500' :
                  alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">{alert.timestamp}</span>
              </motion.div>
            ))}
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Network Health Score */}
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Network Health Score</h2>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold">{networkHealthScore}%</div>
                <div className="text-sm opacity-90">
                  <div>{deviceStats.total} devices monitored</div>
                  <div>{deviceStats.up} online • {deviceStats.down} offline</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-2">Last updated</div>
              <div className="text-lg font-medium">
                {new Date().toLocaleTimeString()}
              </div>
              {isRealtime && (
                <div className="flex items-center justify-end mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm">Live</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Devices
                  </label>
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search by name, IP, or location..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status Filter
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                  >
                    <option value="all">All Status</option>
                    <option value="up">Online</option>
                    <option value="down">Offline</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device Type
                  </label>
                  <Select
                    value={typeFilter}
                    onChange={setTypeFilter}
                  >
                    <option value="all">All Types</option>
                    {deviceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refresh Interval
                  </label>
                  <Select
                    value={refreshInterval}
                    onChange={(value) => setRefreshInterval(Number(value))}
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{deviceStats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ServerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{deviceStats.up}</p>
                <p className="text-xs text-gray-500">{deviceStats.upPercentage}% of total</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offline</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{deviceStats.down}</p>
                <p className="text-xs text-gray-500">{deviceStats.downPercentage}% of total</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {deviceStats.warning + deviceStats.critical}
                </p>
                <p className="text-xs text-gray-500">
                  {deviceStats.warning} warnings • {deviceStats.critical} critical
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Devices ({filteredDevices.length})
            </h2>
            {selectedDevices.length > 0 && (
              <div className="text-sm text-gray-500">
                {selectedDevices.length} selected
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-2 text-sm rounded-r-lg transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ChartBarIcon className="h-4 w-4" />
              </button>
            </div>
            
            {filteredDevices.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedDevices.length === filteredDevices.length}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedDevices.length === 0}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'chart' ? (
          // Chart View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Metrics Chart */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Metrics</h3>
                <Select
                  value={selectedMetric}
                  onChange={setSelectedMetric}
                >
                  <option value="cpu">CPU Usage</option>
                  <option value="memory">Memory Usage</option>
                  <option value="bandwidthIn">Bandwidth In</option>
                  <option value="bandwidthOut">Bandwidth Out</option>
                  <option value="temperature">Temperature</option>
                </Select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value) => 
                        selectedMetric.includes('bandwidth') 
                          ? formatBandwidth(value) 
                          : selectedMetric === 'temperature' 
                            ? `${value}°C` 
                            : `${value}%`
                      }
                    />
                    <Bar 
                      dataKey={selectedMetric} 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Status Distribution */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value, percentage }) => `${name}: ${value}`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        ) : (
          // Grid/List View
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            <AnimatePresence>
              {filteredDevices.map((device, index) => {
                const metrics = deviceDataArray.find(data => data.device === device._id)?.metrics || {};
                const isSelected = selectedDevices.includes(device._id);
                
                return (
                  <motion.div
                    key={device._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-blue-500 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleDeviceSelect(device._id)}
                  >
                    <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            device.status === 'up' 
                              ? 'bg-green-100 dark:bg-green-900/20' 
                              : 'bg-red-100 dark:bg-red-900/20'
                          }`}>
                            <ServerIcon className={`h-6 w-6 ${
                              device.status === 'up' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{device.ip}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          device.status === 'up'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {device.status?.toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">CPU</div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {metrics.cpu || 0}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Memory</div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {metrics.memory || 0}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Temp</div>
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {metrics.temperature || 0}°C
                      </div>
                    </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {device.type || 'Unknown'}
                    </div>
                  </div>
                </div>

                      {/* Location */}
                      {device.location && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{device.location}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Selected Devices Summary */}
        {aggregateMetrics && (
          <motion.div 
            className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4">
              Selected Devices Summary ({aggregateMetrics.deviceCount} devices)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-sm opacity-90">Avg CPU</div>
                <div className="text-2xl font-bold">{aggregateMetrics.avgCpu}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm opacity-90">Avg Memory</div>
                <div className="text-2xl font-bold">{aggregateMetrics.avgMemory}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm opacity-90">Total Bandwidth In</div>
                <div className="text-lg font-bold">{formatBandwidth(aggregateMetrics.totalBandwidthIn)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm opacity-90">Total Bandwidth Out</div>
                <div className="text-lg font-bold">{formatBandwidth(aggregateMetrics.totalBandwidthOut)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm opacity-90">Avg Temperature</div>
                <div className="text-2xl font-bold">{aggregateMetrics.avgTemperature}°C</div>
          </div>
        </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredDevices.length === 0 && (
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ServerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Devices Found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No devices match your current filters. Try adjusting your search criteria.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DeviceMonitoring;
