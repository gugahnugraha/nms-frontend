import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getDeviceById, pingDevice, updateDevice } from '../redux/slices/deviceSlice';
import { getDeviceSnmpData, getDeviceTimeSeries } from '../redux/slices/snmpSlice';
import useInterfaceData from '../hooks/useInterfaceData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { setSuppressNextDeviceStatusToast } from '../redux/slices/uiSlice';
import DeviceForm from '../components/devices/DeviceForm';
import {
  ServerIcon,
  SignalIcon,
  CpuChipIcon,
  MapPinIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  WifiIcon,
  ChartBarIcon,
  EyeIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ActivityIcon,
  // New modern icons
  CommandLineIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  CircleStackIcon,
  RocketLaunchIcon,
  BeakerIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  CubeTransparentIcon,
  LinkIcon,
  TagIcon,
  BookmarkIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  TrashIcon,
  PowerIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import PingDialog from '../components/devices/PingDialog';
import RealtimeMonitor from '../components/details/RealtimeMonitor';
import LiveInterfaceTable from '../components/details/LiveInterfaceTable';
import InterfaceCharts from '../components/details/InterfaceCharts';
import api from '../config/api';
import Button from '../components/ui/Button';

// Local progress bar component for percentage metrics
const ProgressBar = ({ label, value }) => {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  const color = v >= 90 ? 'bg-red-500' : v >= 70 ? 'bg-orange-500' : v >= 40 ? 'bg-yellow-500' : 'bg-emerald-500';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words">{label}</div>
        <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white ml-2">{v.toFixed(0)}%</div>
      </div>
      <div className="h-1.5 sm:h-2 md:h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
};

// Modern Health Score Component with animated rings
const HealthScoreRing = ({ score = 0, size = 120, smSize, t }) => {
  // Responsive size handling
  const [currentSize, setCurrentSize] = useState(size);
  
  // Update size based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && smSize) {
        setCurrentSize(smSize);
      } else {
        setCurrentSize(size);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size, smSize]);
  
  const radius = (currentSize - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return { primary: '#10b981', secondary: '#34d399', bg: '#ecfdf5' };
    if (score >= 70) return { primary: '#3b82f6', secondary: '#60a5fa', bg: '#eff6ff' };
    if (score >= 50) return { primary: '#f59e0b', secondary: '#fbbf24', bg: '#fffbeb' };
    return { primary: '#ef4444', secondary: '#f87171', bg: '#fef2f2' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: currentSize, height: currentSize }}>
      {/* Background ring */}
      <svg
        className="transform -rotate-90"
        width={currentSize}
        height={currentSize}
        viewBox={`0 0 ${currentSize} ${currentSize}`}
      >
        <circle
          cx={currentSize / 2}
          cy={currentSize / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="none"
          className="dark:stroke-gray-600"
        />
        {/* Animated progress ring */}
        <circle
          cx={currentSize / 2}
          cy={currentSize / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth="6"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        style={{
            filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {score}
      </div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 text-center">
          {t('deviceDetail.health')}
        </div>
      </div>
      
      {/* Animated pulse effect for excellent scores */}
      {score >= 90 && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${colors.bg} 0%, transparent 70%)`,
            animation: 'pulse 2s infinite'
          }}
        />
      )}
    </div>
  );
};

const DeviceDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { device, error: deviceError } = useSelector((state) => state.devices);
  const { user: authUser } = useSelector((state) => state.auth);
  const { deviceData, deviceTimeSeries, isLoading: snmpLoading, isLoadingTimeSeries, error: snmpError } = useSelector((state) => state.snmp);
  const { alerts } = useSelector((state) => state.alerts);
  
  // Interface data hook
  const { 
    interfaces, 
    loading: interfaceLoading, 
    error: interfaceError, 
    lastUpdate: interfaceLastUpdate,
    refresh: refreshInterfaces 
  } = useInterfaceData(id);

  const activeInterfaces = useMemo(() => (interfaces || []).filter((itf) => String(itf.status).toLowerCase() === 'up').length, [interfaces]);
  
  // Filter alert untuk device ini
  const deviceAlerts = useMemo(() => {
    if (!alerts || !device) return [];
    return alerts.filter(a => a.deviceId === device._id || a.device?._id === device._id);
  }, [alerts, device]);
  
  // Derive status & severity for alerts consistently
  const deriveAlert = (a) => {
    const ns = String(a.newStatus || '').toLowerCase();
    const isDown = ns === 'down';
    const derivedSeverity = isDown ? 'critical' : 'info';
    const derivedStatus = isDown ? (a.acknowledged ? 'acknowledged' : 'active') : 'resolved';
    return { ...a, _derivedSeverity: derivedSeverity, _derivedStatus: derivedStatus };
  };
  
  const [isPinging, setIsPinging] = useState(false);
  const [showPingDialog, setShowPingDialog] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced] = useState(null);
  const [overview, setOverview] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [interfaceTimeRange, setInterfaceTimeRange] = useState('1h');
  const [chartType, setChartType] = useState('usage');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showActions, setShowActions] = useState(false);
  const [ifaceTraffic, setIfaceTraffic] = useState([]);
  const [ifaceTrafficLoading, setIfaceTrafficLoading] = useState(false);

  const isAdmin = useMemo(() => {
    const role = String(authUser?.role || '').toLowerCase();
    return role === 'admin' || role === 'superadmin' || role === 'administrator';
  }, [authUser]);

  useEffect(() => {
    dispatch(getDeviceById(id));
    dispatch(getDeviceSnmpData(id));
    dispatch(getDeviceTimeSeries({ deviceId: id, params: {} }));
  }, [dispatch, id]);

  // Fetch aggregated overview metrics
  useEffect(() => {
    let isMounted = true;
    api.get(`/snmp/devices/${id}/overview`)
      .then((res) => {
        if (isMounted) setOverview(res.data?.data || null);
      })
      .catch(() => {
        if (isMounted) setOverview(null);
      });
    return () => { isMounted = false; };
  }, [id]);

  // Auto refresh interfaces every 60s when on Interfaces tab
  useEffect(() => {
    if (selectedTab !== 'interfaces') return;
    const idInt = setInterval(() => {
      refreshInterfaces();
    }, 60000);
    return () => clearInterval(idInt);
  }, [selectedTab, refreshInterfaces]);

  // Enhanced auto-refresh for all data
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      dispatch(getDeviceSnmpData(id));
      dispatch(getDeviceTimeSeries({ deviceId: id, params: {} }));
      refreshInterfaces();
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, id, dispatch, refreshInterfaces]);

  // fetch advanced
  useEffect(() => {
    let ok = true;
    api.get(`/snmp/devices/${id}/advanced`).then((res) => { if (ok) setAdvanced(res.data?.data || null); }).catch(()=>{ if (ok) setAdvanced(null); });
    return () => { ok = false; };
  }, [id]);

  // Fetch per-interface traffic summaries for History tab visualizations
  useEffect(() => {
    if (selectedTab !== 'history') return;
    if (!interfaces || interfaces.length === 0) return;
    let cancelled = false;
    const rangeToWindowSec = { '1h': 3600, '6h': 6 * 3600, '24h': 24 * 3600, '7d': 7 * 24 * 3600, '30d': 30 * 24 * 3600 };
    const windowSec = rangeToWindowSec[selectedTimeRange] || 3600;
    const step = windowSec <= 3600 ? '60s' : '5m';
    const load = async () => {
      try {
        setIfaceTrafficLoading(true);
        const tasks = (interfaces || []).map(async (itf) => {
          try {
            const res = await api.get(`/snmp/devices/${id}/interfaces/${itf.index || itf.ifIndex || itf.id}/timeseries`, { params: { windowSec, step } });
            const summary = res.data?.data?.summary || {};
            return {
              index: itf.index || itf.ifIndex || itf.id,
              name: itf.name || `if${itf.index}`,
              avgIn: Number(summary.avgIn || 0),
              avgOut: Number(summary.avgOut || 0),
              maxIn: Number(summary.maxIn || 0),
              maxOut: Number(summary.maxOut || 0)
            };
          } catch (_) {
            return {
              index: itf.index || itf.ifIndex || itf.id,
              name: itf.name || `if${itf.index}`,
              avgIn: 0,
              avgOut: 0,
              maxIn: 0,
              maxOut: 0
            };
          }
        });
        const results = await Promise.all(tasks);
        if (!cancelled) {
          const sorted = results.sort((a, b) => (b.avgIn + b.avgOut) - (a.avgIn + a.avgOut));
          setIfaceTraffic(sorted);
        }
      } finally {
        if (!cancelled) setIfaceTrafficLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedTab, interfaces, selectedTimeRange, id]);

  // Helper functions
  const getStatus = (status) => (status ? status.toUpperCase() : '');
  const isUp = getStatus(device?.status) === 'UP';

  // Device type icons - Updated with modern icons
  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'router':
        return <CubeTransparentIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />;
      case 'switch':
        return <CircleStackIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />;
      case 'server':
        return <ServerIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />;
      case 'bridge':
        return <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />;
      case 'desktop':
        return <ComputerDesktopIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />;
      case 'firewall':
        return <ShieldCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />;
      case 'access_point':
        return <WifiIcon className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600" />;
      case 'load_balancer':
        return <BeakerIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />;
      default:
        return <ServerIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />;
    }
  };

  // Calculate device health score (0-100) with availability weighting
  const healthScore = useMemo(() => {
    if (!device) return 0;

    // Availability-based base score (weighted 24h and 7d when available)
    let availabilityScore = 0;
    if (overview?.availability) {
      const a24h = Number(overview.availability?.h24 ?? 0);
      const a7d = Number(overview.availability?.d7 ?? a24h);
      availabilityScore = Math.max(0, Math.min(100, 0.7 * a24h + 0.3 * a7d));
    } else {
      // Fallback when overview not available
      availabilityScore = isUp ? 80 : 30;
    }

    // Interface contribution: up to +20 points based on operational ratio
    const totalIfaces = interfaces?.length || 0;
    const ifaceRatio = totalIfaces > 0 ? activeInterfaces / totalIfaces : 0;
    const interfaceScore = Math.min(20, Math.max(0, Math.round(ifaceRatio * 20)));

    // Current status penalty: small penalty if currently down
    const statusPenalty = isUp ? 0 : 15;

    // Alert penalties: smaller impact than availability
    const criticalCount = deviceAlerts?.filter(a => a.severity === 'critical').length || 0;
    const warningCount = deviceAlerts?.filter(a => a.severity === 'warning').length || 0;
    const alertPenalty = (criticalCount * 7) + (warningCount * 3);

    let score = availabilityScore + interfaceScore - statusPenalty - alertPenalty;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [device, overview, isUp, interfaces, activeInterfaces, deviceAlerts]);

  // Get health status
  const getHealthStatus = (score) => {
    if (score >= 90) return { status: t('deviceDetail.excellent'), color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { status: t('deviceDetail.good'), color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 50) return { status: t('deviceDetail.fair'), color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 30) return { status: t('deviceDetail.poor'), color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: t('deviceDetail.critical'), color: 'text-red-600', bg: 'bg-red-100' };
  };

  const healthStatus = getHealthStatus(healthScore);
  const healthRingColor = healthScore >= 90 ? '#10b981' : healthScore >= 70 ? '#3b82f6' : healthScore >= 50 ? '#f59e0b' : '#ef4444';

  // Ping handler
  const handlePing = async () => {
    setIsPinging(true);
    setShowPingDialog(true);
    setPingResult(null);
    // Suppress device status toast for this manual ping action
    dispatch(setSuppressNextDeviceStatusToast(true));
    try {
      const result = await dispatch(pingDevice(id)).unwrap();
      setPingResult(result);
      setLastPingTime(new Date());
    } catch (e) {
      setPingResult({ alive: false, pingDetails: { output: e.message } });
      setLastPingTime(new Date());
    } finally {
      // Re-enable toasts for future automatic status changes
      dispatch(setSuppressNextDeviceStatusToast(false));
      setIsPinging(false);
    }
  };



  // Edit handlers
  const handleOpenEdit = () => setIsEditOpen(true);
  const handleCloseEdit = () => setIsEditOpen(false);
  const handleSubmitEdit = (formData) => {
    dispatch(updateDevice({ id, deviceData: formData }))
      .unwrap()
      .then(() => {
        handleCloseEdit();
        dispatch(getDeviceById(id));
      })
      .catch(() => {
        handleCloseEdit();
      });
  };

  // Format bandwidth values
  const formatBandwidth = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} Gbps`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Mbps`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} Kbps`;
    return `${value.toFixed(0)} bps`;
  };

  // Historical data processing
  const historicalData = useMemo(() => {
    if (!deviceTimeSeries || !Array.isArray(deviceTimeSeries)) return [];
    return deviceTimeSeries.slice().reverse().map(item => ({
      timestamp: item.timestamp,
      cpu: item.metrics?.cpuUsage ?? item.metrics?.cpu ?? 0,
      memory: item.metrics?.memoryUsage ?? item.metrics?.memory ?? 0,
      bandwidthIn: item.metrics?.bandwidthIn ?? item.metrics?.bandwidth?.in ?? 0,
      bandwidthOut: item.metrics?.bandwidthOut ?? item.metrics?.bandwidth?.out ?? 0,
      temperature: item.metrics?.temperature ?? 0,
      uptime: item.metrics?.systemUptime ?? item.metrics?.uptime ?? 0
    }));
  }, [deviceTimeSeries]);

  // Chart data based on selected type and time range
  const chartData = useMemo(() => {
    const data = historicalData;
    
    if (!data || data.length === 0) return [];
    
    // Filter based on time range
    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    
    const filteredData = data.filter(item => {
      const itemTime = new Date(item.timestamp).getTime();
      return (now.getTime() - itemTime) <= timeRanges[selectedTimeRange];
    });
    
    return filteredData;
  }, [historicalData, selectedTimeRange]);

  // Calculate statistics from historical data
  const historyStats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    
    const cpuValues = chartData.map(d => d.cpu || 0).filter(v => v > 0);
    const memoryValues = chartData.map(d => d.memory || 0).filter(v => v > 0);
    const bandwidthInValues = chartData.map(d => d.bandwidthIn || 0);
    const bandwidthOutValues = chartData.map(d => d.bandwidthOut || 0);
    const temperatureValues = chartData.map(d => d.temperature || 0).filter(v => v > 0);
    
    const getStats = (values) => {
      if (values.length === 0) return { min: 0, max: 0, avg: 0 };
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { min, max, avg };
    };
    
    return {
      cpu: getStats(cpuValues),
      memory: getStats(memoryValues),
      bandwidthIn: getStats(bandwidthInValues),
      bandwidthOut: getStats(bandwidthOutValues),
      temperature: getStats(temperatureValues),
      dataPoints: chartData.length,
      timeSpan: chartData.length > 0 ? 
        new Date(chartData[chartData.length - 1].timestamp).getTime() - new Date(chartData[0].timestamp).getTime() : 0
    };
  }, [chartData]);

  // Aggregate interface traffic as a fallback for bandwidth stats
  const ifaceAggregatedStats = useMemo(() => {
    if (!ifaceTraffic || ifaceTraffic.length === 0) return null;
    const avgIn = ifaceTraffic.reduce((s, it) => s + (it.avgIn || 0), 0);
    const avgOut = ifaceTraffic.reduce((s, it) => s + (it.avgOut || 0), 0);
    const maxIn = ifaceTraffic.reduce((m, it) => Math.max(m, it.maxIn || 0), 0);
    const maxOut = ifaceTraffic.reduce((m, it) => Math.max(m, it.maxOut || 0), 0);
    return { avgIn, avgOut, maxIn, maxOut };
  }, [ifaceTraffic]);

  // Tabs configuration - Updated with modern icons
  const tabs = [
    { id: 'overview', label: t('deviceDetail.overview'), icon: <ChartPieIcon className="h-4 w-4" /> },
    { id: 'performance', label: t('deviceDetail.performance'), icon: <PresentationChartLineIcon className="h-4 w-4" /> },
    { id: 'interfaces', label: t('deviceDetail.interfaces'), icon: <LinkIcon className="h-4 w-4" /> },
    { id: 'alerts', label: t('deviceDetail.alerts'), icon: <ExclamationTriangleIcon className="h-4 w-4" /> },
    { id: 'history', label: t('deviceDetail.history'), icon: <ClockIcon className="h-4 w-4" /> },
    { id: 'advanced', label: t('deviceDetail.advanced'), icon: <CommandLineIcon className="h-4 w-4" /> },
    { id: 'actions', label: t('deviceDetail.actionsTab'), icon: <RocketLaunchIcon className="h-4 w-4" /> }
  ];

  const renderOverview = () => (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Health Score */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t('deviceDetail.deviceHealth')}</h3>
          </div>
          <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${healthStatus.bg} ${healthStatus.color} w-fit mx-auto sm:mx-0`}>
            {healthScore >= 90 ? (
              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : healthScore >= 70 ? (
              <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {healthStatus.status}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 md:gap-6">
          <div className="relative flex justify-center lg:justify-start">
            <HealthScoreRing score={healthScore} size={80} smSize={100} t={t} />
          </div>
          <div className="flex-1">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {/* Health Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('deviceDetail.connectivity')}</div>
                    <div className={`text-xs sm:text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                      {isUp ? t('deviceDetail.online') : t('deviceDetail.offline')}
                </div>
              </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${activeInterfaces > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('deviceDetail.interfaces')}</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {t('deviceDetail.interfacesActive', { active: activeInterfaces, total: interfaces?.length || 0 })}
                </div>
              </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${(deviceAlerts?.length || 0) === 0 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('deviceDetail.alerts')}</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {t('deviceDetail.activeAlerts', { count: deviceAlerts?.length || 0 })}
                </div>
              </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
              <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('deviceDetail.deviceType')}</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {device?.type || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Score Breakdown */}
              <div className="pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">{t('deviceDetail.healthFactors')}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t('deviceDetail.connectivityFactor')}</span>
                    <span className={`font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                      {isUp ? '+50' : '-50'} pts
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{t('deviceDetail.interfaceHealth')}</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      +{Math.round((activeInterfaces / (interfaces?.length || 1)) * 30)} pts
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{t('deviceDetail.alertImpact')}</span>
                    <span className={`font-medium ${(deviceAlerts?.length || 0) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      -{(deviceAlerts?.filter(a => a.severity === 'critical').length || 0) * 20 + (deviceAlerts?.filter(a => a.severity === 'warning').length || 0) * 10} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">{t('deviceDetail.quickActions')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={handlePing}
            disabled={isPinging}
            className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-lg border-2 border-dashed transition-all h-full ${
              isPinging 
                ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed' 
                : 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
            }`}
          >
            <SignalIcon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 mb-1 sm:mb-1.5 md:mb-2 ${isPinging ? 'animate-pulse' : ''}`} />
            <div className="text-xs sm:text-sm font-medium text-center">
              {isPinging ? t('devices.pinging') : t('deviceDetail.pingDevice')}
            </div>
          </button>
          
          {/* Refresh Data button removed as requested */}
          
          {isAdmin && (
            <button
              onClick={handleOpenEdit}
              className="flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 text-orange-700 dark:border-orange-600 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 transition-all h-full"
            >
              <PencilSquareIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 mb-1 sm:mb-1.5 md:mb-2" />
              <div className="text-xs sm:text-sm font-medium text-center">{t('devices.editDevice')}</div>
            </button>
          )}
          
          {/* Backup Config button removed as requested */}
          
          <button
            onClick={() => {
              // Placeholder for device reboot functionality
              if (window.confirm(t('deviceDetail.confirmReboot'))) {
                alert('Device reboot functionality will be implemented');
              }
            }}
            className="p-2 sm:p-3 md:p-4 rounded-lg border-2 border-dashed border-red-300 bg-red-50 hover:border-red-400 hover:bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-all"
          >
            <PowerIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-xs sm:text-sm font-medium text-center">{t('deviceDetail.rebootDevice')}</div>
          </button>
          
          <button
            onClick={() => navigate('/devices')}
            className="p-2 sm:p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 transition-all"
          >
            <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-xs sm:text-sm font-medium text-center">{t('deviceDetail.backToDevices')}</div>
          </button>
        </div>
      </motion.div>

      {/* Current Metrics */}
      {chartData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('deviceDetail.currentMetrics')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <ProgressBar label={t('deviceDetail.cpuUsage')} value={chartData[chartData.length - 1]?.cpu || 0} />
            <ProgressBar label={t('deviceDetail.memoryUsage')} value={chartData[chartData.length - 1]?.memory || 0} />
            {/* Removed bandwidth tiles as per request */}
          </div>

          {/* Removed Network Traffic chart as per request */}
        </motion.div>
      )}

      {/* Device Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('deviceDetail.deviceTimeline')}</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <ClockIcon className="h-4 w-4 text-blue-500" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('deviceDetail.lastUpdated', { time: lastUpdate ? lastUpdate.toLocaleString() : 'Never' })}
            </span>
          </div>

          {lastPingTime && (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <SignalIcon className="h-4 w-4 text-green-500" />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {t('deviceDetail.lastPing', { time: lastPingTime.toLocaleString() })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <WifiIcon className="h-4 w-4 text-purple-500" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('deviceDetail.interfaceRefresh', { time: interfaceLastUpdate ? interfaceLastUpdate.toLocaleString() : 'Never' })}
            </span>
          </div>
        </div>
      </motion.div>

      {overview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('deviceDetail.overview')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-lg p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20">
              <div className="text-xs text-indigo-600 dark:text-indigo-300">{t('dashboard.availability24h')}</div>
              <div className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-indigo-100">{(overview.availability?.h24 ?? 0).toFixed(1)}%</div>
            </div>
            <div className="rounded-lg p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20">
              <div className="text-xs text-indigo-600 dark:text-indigo-300">{t('deviceDetail.availability7d')}</div>
              <div className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-indigo-100">{(overview.availability?.d7 ?? 0).toFixed(1)}%</div>
            </div>
            <div className="rounded-lg p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="text-xs text-blue-600 dark:text-blue-300">{t('deviceDetail.bandwidthIn')}</div>
              <div className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">{formatBandwidth(overview.traffic?.inBps ?? 0)}</div>
            </div>
            <div className="rounded-lg p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20">
              <div className="text-xs text-orange-600 dark:text-orange-300">{t('deviceDetail.bandwidthOut')}</div>
              <div className="text-lg sm:text-xl font-bold text-orange-900 dark:text-orange-100">{formatBandwidth(overview.traffic?.outBps ?? 0)}</div>
            </div>
            <div className="rounded-lg p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20">
              <div className="text-xs text-purple-600 dark:text-purple-300">95th (Total)</div>
              <div className="text-lg sm:text-xl font-bold text-purple-900 dark:text-purple-100">{formatBandwidth(overview.traffic?.p95TotalBps ?? 0)}</div>
            </div>
            <div className="rounded-lg p-3 sm:p-4 bg-red-50 dark:bg-red-900/20">
              <div className="text-xs text-red-600 dark:text-red-300">{t('deviceDetail.interfaceErrors')}</div>
              <div className="text-xs sm:text-sm text-red-900 dark:text-red-100">InErr {overview.errors?.inErrors ?? 0} • OutErr {overview.errors?.outErrors ?? 0}</div>
              <div className="text-xs sm:text-sm text-red-900 dark:text-red-100">InDisc {overview.errors?.inDiscards ?? 0} • OutDisc {overview.errors?.outDiscards ?? 0}</div>
            </div>
            <div className="rounded-lg p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="text-xs text-emerald-600 dark:text-emerald-300">{t('deviceDetail.exporter')}</div>
              <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-100">{overview.exporter?.up ? 'UP' : 'DOWN'} • {overview.exporter?.scrapeDurationSeconds?.toFixed(2)}s</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-4 sm:space-y-6">
      <RealtimeMonitor
        deviceId={id}
        interfaces={interfaces}
        chartType={chartType}
        setChartType={setChartType}
        selectedTimeRange={selectedTimeRange}
        setSelectedTimeRange={setSelectedTimeRange}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        isRealtimeActive={false}
        chartData={chartData}
        snmpLoading={snmpLoading}
        isLoadingTimeSeries={isLoadingTimeSeries}
        t={t}
        formatBandwidth={formatBandwidth}
      />
    </div>
  );

  const renderInterfaces = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Interface Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-3 md:p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t('deviceDetail.interfaceMonitoring')}</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('deviceDetail.interfacesActive', { active: activeInterfaces, total: interfaces?.length || 0 })}
            </p>
          </div>
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">{t('deviceDetail.timeRange')}:</span>
            <select
              value={interfaceTimeRange}
              onChange={(e) => setInterfaceTimeRange(e.target.value)}
              className="px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs sm:text-sm w-full sm:w-auto"
            >
              <option value="1h">{t('deviceDetail.lastHour')}</option>
              <option value="6h">{t('deviceDetail.last6Hours')}</option>
              <option value="24h">{t('deviceDetail.last24Hours')}</option>
              <option value="7d">{t('deviceDetail.last7Days')}</option>
              <option value="30d">{t('deviceDetail.last30Days')}</option>
            </select>
            <button
              onClick={() => {
                refreshInterfaces();
                setLastUpdate(new Date());
              }}
              className="px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs sm:text-sm transition-colors w-full sm:w-auto"
            >
              🔄 {t('common.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Interface Summary Cards */}
      {interfaces && interfaces.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <WifiIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">{t('deviceDetail.activeInterfaces')}</span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 dark:text-green-100">{activeInterfaces}</div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {t('deviceDetail.operational', { percentage: ((activeInterfaces / interfaces.length) * 100).toFixed(0) })}
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 sm:p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-600" />
              <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">{t('deviceDetail.inactiveInterfaces')}</span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-900 dark:text-red-100">
              {interfaces.length - activeInterfaces}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              {t('deviceDetail.down', { percentage: (((interfaces.length - activeInterfaces) / interfaces.length) * 100).toFixed(0) })}
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <ServerIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">{t('deviceDetail.totalInterfaces')}</span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100">{interfaces.length}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">{t('deviceDetail.monitoredBy', { method: 'SNMP' })}</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-600" />
              <span className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">{t('deviceDetail.lastUpdate')}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-100">
              {interfaceLastUpdate ? interfaceLastUpdate.toLocaleTimeString() : 'Never'}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Auto-refresh: {autoRefresh ? 'On' : 'Off'}
            </div>
          </div>
        </div>
      )}

      {/* Interface Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {interfaces && interfaces.map((itf) => (
          <InterfaceCharts 
            key={itf.index || itf.name} 
            deviceId={id} 
            iface={itf} 
            selectedTimeRange={interfaceTimeRange}
            setSelectedTimeRange={setInterfaceTimeRange}
          />
        ))}
      </div>

      {/* No Interfaces Message */}
      {(!interfaces || interfaces.length === 0) && !interfaceLoading && (
        <div className="text-center py-6 sm:py-8 md:py-12">
          <WifiIcon className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-2 sm:mb-3 md:mb-4" />
          <p className="text-sm sm:text-base md:text-lg font-medium text-gray-600 dark:text-gray-300">{t('deviceDetail.noInterfaces')}</p>
          <p className="text-xs sm:text-sm text-gray-500">{t('deviceDetail.noSnmpSupport')}</p>
        </div>
      )}

      {/* Loading State */}
      {interfaceLoading && (
        <div className="text-center py-6 sm:py-8 md:py-12">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 border-b-2 border-blue-500 mx-auto mb-2 sm:mb-3 md:mb-4"></div>
          <p className="text-sm sm:text-base md:text-lg font-medium text-gray-600 dark:text-gray-300">{t('deviceDetail.loading')}</p>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-3 sm:space-y-4">
      {deviceAlerts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 sm:py-12"
        >
          <CheckCircleIcon className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300">{t('deviceDetail.allSystemsOperational')}</p>
          <p className="text-xs sm:text-sm text-gray-500">{t('deviceDetail.noAlertsDevice')}</p>
        </motion.div>
      ) : (
        deviceAlerts.map((raw, index) => {
          const alert = deriveAlert(raw);
          const isDown = String(alert.newStatus || '').toLowerCase() === 'down';
          return (
          <motion.div
            key={alert._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-3 sm:p-4 md:p-6 rounded-xl border-l-4 ${
                isDown
                ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                : 'bg-green-50 dark:bg-green-900/20 border-green-500'
            }`}
          >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
            <div className="flex items-start gap-2 sm:gap-3">
                  {isDown ? (
                <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{alert.title || t('alerts.statusChanged', { from: alert.previousStatus, to: alert.newStatus })}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(alert.createdAt || alert.timestamp).toLocaleString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <span className={`px-2 py-1 rounded-full ${
                        isDown ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {isDown ? t('common.down') : t('common.up')}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${
                        alert._derivedStatus === 'acknowledged' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : alert._derivedStatus === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}>
                        {t(`alerts.status.${alert._derivedStatus}`)}
                      </span>
                    </div>
                  </div>
              </div>
            </div>
          </motion.div>
          );
        })
      )}
    </div>
  );

  const renderHistory = () => {

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Statistics Summary */}
        {historyStats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('deviceDetail.historicalStats', { range: selectedTimeRange })}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CpuChipIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">{t('deviceDetail.cpuUsage')}</span>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div>Avg: <span className="font-semibold">{historyStats.cpu.avg.toFixed(1)}%</span></div>
                  <div>Max: <span className="font-semibold text-red-600">{historyStats.cpu.max.toFixed(1)}%</span></div>
                  <div>Min: <span className="font-semibold text-green-600">{historyStats.cpu.min.toFixed(1)}%</span></div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ServerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">{t('deviceDetail.memoryUsage')}</span>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div>Avg: <span className="font-semibold">{historyStats.memory.avg.toFixed(1)}%</span></div>
                  <div>Max: <span className="font-semibold text-red-600">{historyStats.memory.max.toFixed(1)}%</span></div>
                  <div>Min: <span className="font-semibold text-green-600">{historyStats.memory.min.toFixed(1)}%</span></div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <span className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">{t('deviceDetail.bandwidthIn')}</span>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div>Avg: <span className="font-semibold">{formatBandwidth((historyStats.bandwidthIn.avg || 0) > 0 ? historyStats.bandwidthIn.avg : (ifaceAggregatedStats?.avgIn || 0))}</span></div>
                  <div>Peak: <span className="font-semibold text-orange-600">{formatBandwidth((historyStats.bandwidthIn.max || 0) > 0 ? historyStats.bandwidthIn.max : (ifaceAggregatedStats?.maxIn || 0))}</span></div>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">{t('deviceDetail.bandwidthOut')}</span>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div>Avg: <span className="font-semibold">{formatBandwidth((historyStats.bandwidthOut.avg || 0) > 0 ? historyStats.bandwidthOut.avg : (ifaceAggregatedStats?.maxOut || 0))}</span></div>
                  <div>Peak: <span className="font-semibold text-orange-600">{formatBandwidth((historyStats.bandwidthOut.max || 0) > 0 ? historyStats.bandwidthOut.max : (ifaceAggregatedStats?.maxOut || 0))}</span></div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span>{t('deviceDetail.dataPoints', { count: historyStats.dataPoints })}</span>
                <span>{t('deviceDetail.timeSpan', { minutes: Math.round(historyStats.timeSpan / (1000 * 60)) })}</span>
                <span>{t('deviceDetail.lastUpdateTime', { time: new Date(chartData[chartData.length - 1]?.timestamp).toLocaleTimeString() })}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Charts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('deviceDetail.performanceHistory')}</h3>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <option value="1h">{t('deviceDetail.lastHour')}</option>
                <option value="6h">{t('deviceDetail.last6Hours')}</option>
                <option value="24h">{t('deviceDetail.last24Hours')}</option>
                <option value="7d">{t('deviceDetail.last7Days')}</option>
                <option value="30d">{t('deviceDetail.last30Days')}</option>
              </select>
              <button
                onClick={() => {
                  const csvContent = chartData.map(d => 
                    `${new Date(d.timestamp).toLocaleString()},${d.cpu || 0},${d.memory || 0},${d.bandwidthIn || 0},${d.bandwidthOut || 0},${d.temperature || 0},${d.uptime || 0}`
                  ).join('\n');
                  const csvHeader = 'Timestamp,CPU %,Memory %,Bandwidth In,Bandwidth Out,Temperature,Uptime\n';
                  const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${device?.name || 'device'}_performance_${selectedTimeRange}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs sm:text-sm transition-colors w-full sm:w-auto"
              >
                📊 {t('deviceDetail.exportCsv')}
              </button>
            </div>
          </div>
          
          {chartData.length > 0 ? (
            <>
              {/* CPU and Memory Chart */}
              <div className="h-64 sm:h-80 mb-4 sm:mb-6">
                <h4 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">{t('deviceDetail.cpuMemoryUsage')}</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradHistoryCPU" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="gradHistoryMemory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 10, fill: '#FFFFFF' }}
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#FFFFFF' }} domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{ background: '#111827', color: '#D1D5DB', borderColor: '#374151' }}
                    />
                    <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                    <Area 
                      type="monotone" 
                      dataKey="cpu" 
                      name="CPU %" 
                      stroke="#3b82f6" 
                      fill="url(#gradHistoryCPU)" 
                      strokeWidth={2} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="memory" 
                      name="Memory %" 
                      stroke="#10b981" 
                      fill="url(#gradHistoryMemory)" 
                      strokeWidth={2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Removed Bandwidth Chart as per request */}

              {/* Per-Interface Averages Bar Chart */}
              {(ifaceTraffic && ifaceTraffic.length > 0) && (
                <div className="h-64 sm:h-80 mb-4 sm:mb-6">
                  <h4 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">{t('deviceDetail.interfaceTrafficAverages')}</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ifaceTraffic.slice(0, 12)} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                      <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} tick={{ fontSize: 10, fill: '#FFFFFF' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#FFFFFF' }} tickFormatter={(v) => formatBandwidth(v)} />
                      <Tooltip formatter={(v) => formatBandwidth(v)} contentStyle={{ background: '#111827', color: '#FFFFFF', borderColor: '#374151' }} />
                      <Legend wrapperStyle={{ color: '#FFFFFF' }} />
                      <Bar dataKey="avgIn" name="Avg In" fill="#8b5cf6" radius={[6,6,0,0]} />
                      <Bar dataKey="avgOut" name="Avg Out" fill="#f59e0b" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Temperature Chart (if available) */}
              {chartData.some(d => d.temperature > 0) && (
                <div className="h-48 sm:h-60">
                  <h4 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">{t('deviceDetail.temperature')}</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradHistoryTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                      <XAxis 
                        dataKey="timestamp" 
                        tick={{ fontSize: 10, fill: '#FFFFFF' }}
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#FFFFFF' }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value, name) => [`${value}°C`, name]}
                        contentStyle={{ background: '#111827', color: '#FFFFFF', borderColor: '#374151' }}
                      />
                      <Legend wrapperStyle={{ color: '#FFFFFF' }} />
                      <Area 
                        type="monotone" 
                        dataKey="temperature" 
                        name={`${t('deviceDetail.temperature')} °C`} 
                        stroke="#ef4444" 
                        fill="url(#gradHistoryTemp)" 
                        strokeWidth={2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <ChartBarIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">{t('deviceDetail.noHistoryData')}</p>
            </div>
          )}
        </motion.div>

        {/* Historical Events Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('deviceDetail.recentActivity')}</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <ClockIcon className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{t('deviceDetail.dataCollectionActive')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('deviceDetail.collectingMetrics', { seconds: refreshInterval / 1000, time: lastUpdate.toLocaleTimeString() })}
                </div>
              </div>
            </div>

            {lastPingTime && (
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <SignalIcon className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{t('deviceDetail.manualPingTest')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {pingResult?.alive ? t('common.success') : t('common.failed')} • {lastPingTime.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <WifiIcon className="h-4 w-4 text-purple-500" />
              <div className="flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{t('deviceDetail.interfaceMonitoring')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('deviceDetail.activeInterfacesStatus', { count: activeInterfaces, time: interfaceLastUpdate?.toLocaleTimeString() || 'Never' })}
                </div>
              </div>
            </div>

            {deviceAlerts?.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{t('dashboard.activeAlerts')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {deviceAlerts.length} alert(s) requiring attention
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderActions = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Device Management Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('deviceDetail.deviceManagement')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <PowerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
              <h4 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-white">{t('deviceDetail.powerManagement')}</h4>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2">
              {t('deviceDetail.manageDevicePower')}
            </p>
            <div className="flex flex-col xs:flex-row gap-2">
              <button 
                onClick={() => {
                  if (window.confirm(t('deviceDetail.confirmRebootShort'))) {
                    alert('Reboot command will be implemented');
                  }
                }}
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs md:text-sm transition-colors flex items-center justify-center gap-1"
              >
                <PowerIcon className="h-3 w-3 sm:h-4 sm:w-4 inline" />
                <span>{t('deviceDetail.rebootDevice')}</span>
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(t('deviceDetail.confirmShutdown'))) {
                    alert('Shutdown command will be implemented');
                  }
                }}
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs md:text-sm transition-colors flex items-center justify-center gap-1"
              >
                <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 inline" />
                <span>{t('deviceDetail.shutdownDevice')}</span>
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <CloudArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <h4 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-white">{t('deviceDetail.configBackup')}</h4>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2">
              {t('deviceDetail.createAndManageBackups')}
            </p>
            <div className="flex flex-col xs:flex-row gap-2">
              <button 
                onClick={() => alert('Backup functionality will be implemented')}
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs md:text-sm transition-colors flex items-center justify-center gap-1"
              >
                <CloudArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 inline" />
                <span>{t('deviceDetail.createBackup')}</span>
                {t('deviceDetail.createBackup')}
              </button>
              <button 
                onClick={() => alert('Restore functionality will be implemented')}
                className="w-full px-2 sm:px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs sm:text-sm transition-colors"
              >
                {t('deviceDetail.restoreConfig')}
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <CommandLineIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('deviceDetail.remoteAccess')}</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
              {t('deviceDetail.remoteAccessDesc')}
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => window.open(`ssh://${device?.ip}`, '_blank')}
                className="w-full px-2 sm:px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-xs sm:text-sm transition-colors"
              >
                {t('deviceDetail.sshAccess')}
              </button>
              <button 
                onClick={() => window.open(`http://${device?.ip}`, '_blank')}
                className="w-full px-2 sm:px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-xs sm:text-sm transition-colors"
              >
                {t('deviceDetail.webInterface')}
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <BeakerIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('deviceDetail.networkTests')}</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
              {t('deviceDetail.networkTestsDesc')}
            </p>
            <div className="space-y-2">
              <button 
                onClick={handlePing}
                disabled={isPinging}
                className="w-full px-2 sm:px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs sm:text-sm transition-colors disabled:opacity-50"
              >
                {isPinging ? t('devices.pinging') : t('deviceDetail.pingTest')}
              </button>
              <button 
                onClick={() => alert('Traceroute functionality will be implemented')}
                className="w-full px-2 sm:px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md text-xs sm:text-sm transition-colors"
              >
                {t('deviceDetail.traceroute')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Thresholds */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Performance Thresholds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CpuChipIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">CPU Threshold</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Warning:</span>
                <span className="text-xs sm:text-sm font-semibold">80%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Critical:</span>
                <span className="text-xs sm:text-sm font-semibold">90%</span>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700">Configure</button>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ServerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              <span className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300">Memory Threshold</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Warning:</span>
                <span className="text-xs sm:text-sm font-semibold">85%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Critical:</span>
                <span className="text-xs sm:text-sm font-semibold">95%</span>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700">Configure</button>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <WifiIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Bandwidth Threshold</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Warning:</span>
                <span className="text-xs sm:text-sm font-semibold">80%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Critical:</span>
                <span className="text-xs sm:text-sm font-semibold">95%</span>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700">Configure</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Device Notes */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Device Notes & Documentation</h3>
          <button className="px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs sm:text-sm transition-colors w-full sm:w-auto">
            <PencilSquareIcon className="h-4 w-4 inline mr-1" />
            Add Note
          </button>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Installation Notes</span>
              </div>
              <span className="text-xs text-gray-500">2 hari lalu</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Device installed in server rack position 12U. Connected to primary switch via port 24.
              SNMP community configured with custom string.
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Schedule</span>
              </div>
              <span className="text-xs text-gray-500">1 minggu lalu</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Next scheduled maintenance: First Sunday of next month. 
              Firmware update planned for version 2.4.1.
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Notice</span>
              </div>
              <span className="text-xs text-gray-500">3 hari lalu</span>
            </div>
            <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
              Device experienced high CPU usage during peak hours. 
              Monitor performance and consider load balancing if issues persist.
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs">
              production
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs">
              critical
            </span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs">
              core-network
            </span>
            <button className="px-2 py-1 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md text-xs hover:border-gray-400">
              + Add Tag
            </button>
          </div>
        </div>
      </motion.div>

      {/* Device Specifications */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Device Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Model:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {advanced?.system?.sysDescr?.split(' ')[0] || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Serial Number:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">SN-{device?.ip?.replace(/\./g, '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Location:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {device?.location || advanced?.system?.sysLocation || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Contact:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {advanced?.system?.sysContact || 'Not specified'}
              </span>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Uptime:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {advanced?.system?.sysUpTime ? `${Math.floor(advanced.system.sysUpTime / 8640000)} days` : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Interfaces:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{interfaces?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">SNMP Version:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">v2c</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Management IP:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{device?.ip}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-4 sm:space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">System Info</h3>
        {advanced ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
              <div className="text-gray-500 dark:text-gray-400 mb-1">sysName</div>
              <div className="font-mono text-gray-900 dark:text-white break-all text-xs sm:text-sm md:text-base">{advanced.system?.sysName || '-'}</div>
            </div>
            <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
              <div className="text-gray-500 dark:text-gray-400 mb-1">sysDescr</div>
              <div className="font-mono text-gray-900 dark:text-white break-all text-xs sm:text-sm md:text-base">{advanced.system?.sysDescr || '-'}</div>
            </div>
            <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
              <div className="text-gray-500 dark:text-gray-400 mb-1">sysObjectID</div>
              <div className="font-mono text-gray-900 dark:text-white break-all text-xs sm:text-sm md:text-base">{advanced.system?.sysObjectID || '-'}</div>
            </div>
            <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
              <div className="text-gray-500 dark:text-gray-400 mb-1">sysUpTime</div>
              <div className="font-mono text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">{advanced.system?.sysUpTime || 0}</div>
            </div>
            <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
              <div className="text-gray-500 dark:text-gray-400 mb-1">sysContact</div>
              <div className="font-mono text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">{advanced.system?.sysContact || '-'}</div>
            </div>
            <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
              <div className="text-gray-500 dark:text-gray-400 mb-1">sysLocation</div>
              <div className="font-mono text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">{advanced.system?.sysLocation || '-'}</div>
            </div>
          </div>
        ) : (<div className="text-xs sm:text-sm text-gray-500">Loading...</div>)}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Diagnostics</h3>
        {advanced ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className={`p-2 sm:p-3 rounded-md ${advanced.exporter?.up ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">Exporter Status</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${advanced.exporter?.up ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <div className="font-semibold">{advanced.exporter?.up ? 'UP' : 'DOWN'}</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scrape time: {advanced.exporter?.scrapeDurationSeconds?.toFixed?.(2) || 0}s</div>
            </div>
            <div className="p-2 sm:p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
              <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">Top Errors (5m)</div>
              {(advanced.topErrors || []).length > 0 ? (
                <ul className="list-disc ml-4">
                  {(advanced.topErrors || []).map((e) => (
                    <li key={`${e.ifIndex}-${e.ifName}`} className="font-mono text-xs mb-1">{e.ifName} — {e.value?.toFixed?.(4) || e.value}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">No errors detected</div>
              )}
            </div>
          </div>
        ) : (<div className="text-xs sm:text-sm text-gray-500">Loading...</div>)}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Interface Capabilities</h3>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Scroll horizontally to see all data</span>
            <span className="inline sm:hidden">Swipe left/right to view</span>
          </div>
        </div>
        {advanced ? (
          <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700 -mx-3 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap">Index</th>
                  <th className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap">Name</th>
                  <th className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap hidden sm:table-cell">MTU</th>
                  <th className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap hidden sm:table-cell">MAC</th>
                  <th className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap">Status</th>
                  <th className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap hidden sm:table-cell">Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {(advanced.interfaces || []).map((it) => (
                  <tr key={it.index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-3 py-2 font-mono whitespace-nowrap">{it.index}</td>
                    <td className="px-2 sm:px-3 py-2 font-mono whitespace-nowrap">{it.name}</td>
                    <td className="px-2 sm:px-3 py-2 font-mono whitespace-nowrap hidden sm:table-cell">{it.mtu}</td>
                    <td className="px-2 sm:px-3 py-2 font-mono whitespace-nowrap hidden sm:table-cell">{it.mac}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${it.operStatus === 'up' ? 'bg-green-500' : it.operStatus === 'down' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                        <span className={`${it.operStatus === 'up' ? 'text-green-600' : it.operStatus === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                          {it.operStatus}
                        </span>
                        <span className="text-gray-400 text-xs hidden xs:inline">/</span>
                        <span className={`text-xs hidden xs:inline ${it.adminStatus === 'up' ? 'text-green-600' : it.adminStatus === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                          {it.adminStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 font-mono whitespace-nowrap hidden sm:table-cell">{it.speed || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (<div className="text-xs sm:text-sm text-gray-500">Loading...</div>)}
      </motion.div>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'performance':
        return renderPerformance();
      case 'interfaces':
        return renderInterfaces();
      case 'alerts':
        return renderAlerts();
      case 'history':
        return renderHistory();
      case 'advanced':
        return renderAdvanced();
      case 'actions':
        return renderActions();
      case 'notes':
        return renderNotes();
      default:
        return renderOverview();
    }
  };

  if (!device) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-none mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-6">
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 md:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 border-b-2 border-blue-500 mb-2 sm:mb-3 md:mb-4"></div>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2 text-center">{t('deviceDetail.loadingDevice') || 'Loading Device...'}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 text-center px-4">{t('deviceDetail.loadingDescription') || 'Please wait while we fetch device information'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile-First Container with proper responsive behavior */}
      <div className="w-full max-w-none mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-6">
        {/* Header Section - Mobile Optimized */}
        <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent leading-tight">
                {t('deviceDetail.title')}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 break-words max-w-full sm:max-w-md md:max-w-lg truncate">
                {device?.name} • {device?.ip} • {device?.type}
              </p>
            </div>
            
            {/* Action buttons - Mobile optimized */}
            <div className="flex justify-center sm:justify-end items-center gap-2 sm:gap-3">
              <button
                onClick={handlePing}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs sm:text-sm transition-colors"
              >
                <SignalIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{t('deviceDetail.pingDevice')}</span>
                <span className="inline xs:hidden">Ping</span>
              </button>
              <button
                onClick={() => navigate('/devices')}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-xs sm:text-sm transition-colors"
              >
                <ArrowTrendingUpIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{t('deviceDetail.backToDevices')}</span>
                <span className="inline xs:hidden">{t('common.back')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Header Section - Fully Mobile Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-2 sm:p-3 md:p-4 lg:p-6 mb-3 sm:mb-4 md:mb-6 lg:mb-8 border border-gray-200 dark:border-gray-700"
        >
          {/* Error Display - Mobile Optimized */}
          {(deviceError || snmpError || interfaceError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 sm:mb-4 md:mb-6 p-2 sm:p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg sm:rounded-xl"
            >
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mx-auto sm:mx-0" />
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xs sm:text-sm md:text-base font-medium text-red-800 dark:text-red-200">{t('deviceDetail.connectionIssues') || 'Connection Issues Detected'}</h4>
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 break-words">
                    {deviceError || snmpError || interfaceError}
                  </p>
                </div>
                <button
                  onClick={() => {
                    dispatch(getDeviceById(id));
                    dispatch(getDeviceSnmpData(id));
                    dispatch(getDeviceTimeSeries({ deviceId: id, params: {} }));
                    refreshInterfaces();
                  }}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-xs sm:text-sm transition-colors w-full sm:w-auto"
                >
                  {t('common.retry') || 'Retry'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Quick Stats Row - Mobile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl">
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {isUp ? '🟢' : '🔴'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('deviceDetail.status')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                {activeInterfaces}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('deviceDetail.activeInterfaces')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                {deviceAlerts?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('deviceDetail.alerts')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {healthScore}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('deviceDetail.healthScore')}</div>
            </div>
          </div>

          {/* Device Info Section - Mobile Stacked Layout */}
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-0 lg:flex-row lg:items-start lg:gap-4 lg:gap-6">
              {/* Device Icon - Mobile Centered */}
              <div className={`p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-lg mx-auto lg:mx-0 ${isUp ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : 'bg-gradient-to-br from-red-400 to-red-600 text-white'}`}>
                {getDeviceIcon(device.type)}
              </div>
              
              {/* Device Details - Mobile Stacked */}
              <div className="flex-1 text-center lg:text-left">
                {/* Device Name and Status - Mobile Stacked */}
                <div className="flex flex-col space-y-2 sm:space-y-3 mb-2 sm:mb-3">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white break-words">
                    {device?.name || 'Loading...'}
                  </h1>
                  
                  {/* Status Badge - Mobile Responsive */}
                  {isUp ? (
                    <div className="flex items-center justify-center lg:justify-start gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto lg:mx-0">
                      <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                      </div>
                      <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
                      <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">{t('deviceDetail.online')}</span>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000)}s ago
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center lg:justify-start gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto lg:mx-0">
                      <div className="relative">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                      </div>
                      <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-600 dark:text-red-400" />
                      <span className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">{t('deviceDetail.offline')}</span>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {t('deviceDetail.disconnected')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Device Info Grid - Mobile Stacked */}
                <div className="flex flex-col space-y-2 sm:space-y-3 lg:space-y-0 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <SignalIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-mono break-all">{device?.ip}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <CpuChipIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="break-words">{t(`devices.${device?.type}`) || device?.type}</span>
                  </div>

                  {lastPingTime && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="break-words">{t('deviceDetail.lastPing', { time: lastPingTime.toLocaleTimeString() })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile Stacked */}
            <div className="flex flex-col space-y-2 sm:space-y-3 w-full lg:w-auto">
              {/* Auto Refresh Toggle - Mobile Full Width */}
              <div className="flex items-center justify-center lg:justify-start gap-2 px-2 sm:px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-full lg:w-auto">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('deviceDetail.autoRefresh')}</span>
                <Switch
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  className={`${
                    autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
                >
                  <span className={`${
                    autoRefresh ? 'translate-x-4' : 'translate-x-0'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </Switch>
              </div>

              {/* Action Buttons Grid - Mobile Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 w-full lg:w-auto">
                {isAdmin && (
                  <button
                    onClick={handleOpenEdit}
                    className="flex items-center justify-center gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-xs sm:text-sm w-full"
                  >
                    <Cog6ToothIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    {t('common.edit') || 'Edit'}
                  </button>
                )}
                <button
                  onClick={() => navigate('/devices')}
                  className="flex items-center justify-center gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-xs sm:text-sm w-full"
                >
                  {t('common.back')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-3 sm:mb-4 md:mb-6">
          {/* Horizontal Scrollable Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-w-fit ${
                  selectedTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span className={`${selectedTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {/* Mobile dot indicator */}
                {selectedTab === tab.id && (
                  <span className="inline sm:hidden w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
          
          {/* Tab Content - Mobile Optimized Padding */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Ping Dialog */}
        <PingDialog
          isOpen={showPingDialog}
          onClose={() => setShowPingDialog(false)}
          device={device}
          pingResult={pingResult}
          isPinging={isPinging}
          lastPingTime={lastPingTime}
        />

        {/* Device Form Dialog */}
        <DeviceForm
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onSubmit={handleSubmitEdit}
          device={device}
        />
      </div>
    </div>
  );
};

export default DeviceDetail; 