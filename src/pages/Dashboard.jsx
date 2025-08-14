import React, { useEffect, useState, useCallback, useMemo, Fragment, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { getDevices } from '../redux/slices/deviceSlice';
import { subscribeToDevices } from '../services/socketService';
import soundNotification from '../utils/soundUtils';
import { 
  ServerIcon, CheckCircleIcon, XCircleIcon, BellAlertIcon, 
  ChartBarIcon, ArrowPathIcon, ExclamationTriangleIcon,
  ArrowTrendingUpIcon, ClockIcon, WifiIcon, ShieldCheckIcon,
  FunnelIcon, CalendarIcon, SignalIcon, DeviceTabletIcon
} from '@heroicons/react/24/outline';
import { ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon 
} from '@heroicons/react/24/solid';
import api from '../config/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, ComposedChart } from 'recharts';
import { Dialog, Transition, Menu, Switch } from '@headlessui/react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { getAlerts } from '../redux/actions/alertActions';
// Helper functions for formatting
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Number(value).toFixed(decimals);
};

const formatMbps = (bps) => {
  const value = Number(bps || 0) / 1e6;
    if (value >= 1000) {
      return `${formatNumber(value/1000, 2)} Gbps`;
    }
    return `${formatNumber(value, 2)} Mbps`;
};

const formatRate = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '0/s';
  const value = Number(v);
  if (value === 0) return '0/s';
    if (value < 0.01) return '< 0.01/s';
    return `${formatNumber(value, 2)}/s`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  const num = Number(value);
  if (num === 0) return '0%';
    if (num < 0.01) return '< 0.01%';
    return `${formatNumber(num, 2)}%`;
};

const TZ = 'Asia/Jakarta';
const formatAxisTime = (ts) => {
  try {
    return new Intl.DateTimeFormat('id-ID', { 
      timeZone: TZ, 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(new Date(ts));
  } catch (e) {
    console.error('Error formatting time:', e);
    return '-';
  }
};
const formatTooltipTime = (ts) => {
  const formatted = formatAxisTime(ts);
  return formatted === '-' ? '-' : `${formatted} WIB`;
};

const COLORS = {
  blue: 'rgb(59 130 246)', // blue-500
  green: 'rgb(16 185 129)', // emerald-500
  orange: 'rgb(245 158 11)', // amber-500
  red: 'rgb(239 68 68)', // red-500
  purple: 'rgb(139 92 246)', // violet-500
  cyan: 'rgb(6 182 212)', // cyan-500
  pink: 'rgb(236 72 153)', // pink-500
  lime: 'rgb(132 204 22)' // lime-500
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, formatter, valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm text-gray-600 dark:text-white mb-2">{formatter ? formatter(label) : label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm dark:text-white" style={{ color: entry.color }}>
            {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Loading Skeleton Component
const LoadingSkeleton = ({ className = "h-64" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { devices } = useSelector((state) => state.devices);
  const { alerts: alertsStore = [] } = useSelector((state) => state.alerts);
  
  // State variables
  const [searchDevice, setSearchDevice] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [chartTheme, setChartTheme] = useState('default');
  const [trafficError, setTrafficError] = useState(null);
  const [trafficSeries, setTrafficSeries] = useState([]);
  const [uptimeSeries, setUptimeSeries] = useState([]);
  const [deviceUptimeData, setDeviceUptimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced state management
  const [networkSummary, setNetworkSummary] = useState(null);
  const [alertsSummary, setAlertsSummary] = useState({ total: 0, critical: 0, warning: 0, recent: [] });
  const [isTopDevicesOpen, setIsTopDevicesOpen] = useState(false);
  const [isTrafficModalOpen, setIsTrafficModalOpen] = useState(false);
  const [allDevicesTraffic, setAllDevicesTraffic] = useState([]);
  const trafficChartRef = useRef(null);
  const trafficModalChartRef = useRef(null);
  const topDevicesChartRef = useRef(null);

  // Memoized computations for performance
  const totalDevices = useMemo(() => devices.length, [devices]);
  const devicesUp = useMemo(() => devices.filter(device => (device.status || '').toUpperCase() === 'UP').length, [devices]);
  const devicesDown = useMemo(() => totalDevices - devicesUp, [totalDevices, devicesUp]);

  const statsCards = useMemo(() => [
    { 
      title: t('dashboard.totalDevices'), 
      value: totalDevices, 
      icon: <ServerIcon className="h-8 w-8 text-blue-600" />, 
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', 
      textColor: 'text-blue-600 dark:text-blue-400',
      trend: '+2.5%',
      trendUp: true
    },
    { 
      title: t('dashboard.onlineDevices'), 
      value: devicesUp, 
      icon: <CheckCircleIcon className="h-8 w-8 text-green-600" />, 
      color: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20', 
      textColor: 'text-green-600 dark:text-green-400',
      trend: `${((devicesUp / totalDevices) * 100).toFixed(1)}%`,
      trendUp: true
    },
    { 
      title: t('dashboard.offlineDevices'), 
      value: devicesDown, 
      icon: <XCircleIcon className="h-8 w-8 text-red-600" />, 
      color: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20', 
      textColor: 'text-red-600 dark:text-red-400',
      trend: devicesDown > 0 ? t('dashboard.attentionNeeded') : t('dashboard.allGood'),
      trendUp: false
    },
    { 
      title: t('dashboard.activeAlerts'), 
      value: alertsSummary.total, 
      icon: <BellAlertIcon className="h-8 w-8 text-orange-600" />, 
      color: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20', 
      textColor: 'text-orange-600 dark:text-orange-400',
      trend: alertsSummary.critical > 0 ? t('dashboard.criticalCount', { count: alertsSummary.critical }) : t('dashboard.noCriticalAlerts'),
      trendUp: alertsSummary.critical === 0
    }
  ], [totalDevices, devicesUp, devicesDown, alertsSummary.total, alertsSummary.critical]);

  const deviceTypeData = useMemo(() => 
    networkSummary?.deviceTypeCounts
      ? Object.entries(networkSummary.deviceTypeCounts).map(([k, v]) => ({ name: k, value: v }))
      : [], 
    [networkSummary?.deviceTypeCounts]
  );

  // Optimized functions with useCallback
  const getDeviceLabel = useCallback((instance) => {
    if (!instance) return '';
    const found = devices.find(d => (d.ip || '').trim() === instance.trim());
    return found?.name || instance;
  }, [devices]);

  const getAlertDeviceName = useCallback((alert) => {
    return alert?.device?.name || alert?.deviceName || getDeviceLabel(alert?.device?.ip || alert?.instance || '');
  }, [getDeviceLabel]);

  const getAlertDeviceIp = (alert) => alert?.device?.ip || alert?.ip || alert?.instance || '';

  const upDownPie = useMemo(() => [
    { name: t('common.up'), value: devicesUp, color: '#10B981' },
    { name: t('common.down'), value: devicesDown, color: '#EF4444' }
  ], [devicesUp, devicesDown, t]);

  const topDeviceBars = useMemo(() => 
    (networkSummary?.topDevices || []).map((d) => ({
      name: getDeviceLabel(d.instance),
      instance: d.instance,
      mbps: Number(d.bps || 0) / 1e6,
    })), 
    [networkSummary?.topDevices, getDeviceLabel]
  );

  const errorBars = useMemo(() => [
    { name: t('dashboard.metricsCard.errors'), in: Number(networkSummary?.errorInPerSec || 0), out: Number(networkSummary?.errorOutPerSec || 0) }
  ], [networkSummary?.errorInPerSec, networkSummary?.errorOutPerSec]);

  // Force chart theme to follow html.dark class so axis ticks use white in dark mode
  useEffect(() => {
    const sync = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setChartTheme(isDark ? 'dark' : 'default');
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  const fetchData = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      
      // Fetch data with individual error handling
      let summaryRes, uptimeRes, trafficRes;
      
      try {
        summaryRes = await api.get('/reports/network/summary', { params: { timeRange: selectedTimeRange } });
      } catch (error) {
        
        summaryRes = { data: { data: null } };
      }
      
      try {
        uptimeRes = await api.get('/reports/network/uptime_timeseries', { params: { range: selectedTimeRange, step: '5m' } });
      } catch (error) {
        
        uptimeRes = { data: { data: [] } };
      }
      
      try {
        trafficRes = await api.get('/reports/network/traffic_timeseries', { params: { range: selectedTimeRange, step: '5m' } });
      } catch (error) {
        
        trafficRes = { data: { data: [] } };
        setTrafficError(error.message || 'Failed to fetch traffic data');
      }
      
      // Fetch individual device uptime data
      let deviceUptimeRes;
      try {
        deviceUptimeRes = await api.get('/reports/network/devices_uptime', { params: { range: selectedTimeRange, step: '5m' } });
      } catch (error) {
        
        deviceUptimeRes = { data: { data: [] } };
      }
      

      setNetworkSummary(summaryRes.data?.data || null);
      
      setUptimeSeries(uptimeRes.data?.data || []);
      setDeviceUptimeData(deviceUptimeRes.data?.data || []);
      // Transform traffic data to ensure correct format
      const trafficData = trafficRes.data?.data || [];
      
      if (!Array.isArray(trafficData)) {
        
        setTrafficError('Invalid traffic data format received from server');
        setTrafficSeries([]);
        return;
      }
      
      const transformedTrafficData = trafficData.map(item => ({
        timestamp: item.timestamp || item.time || item.date,
        inBps: Number(item.inBps || item.bandwidthIn || item.trafficIn || 0),
        outBps: Number(item.outBps || item.bandwidthOut || item.trafficOut || 0)
      }));
      
      
      
      // Validate transformed data
      const validData = transformedTrafficData.filter(item => 
        item.timestamp && 
        !isNaN(item.inBps) && 
        !isNaN(item.outBps) &&
        item.inBps >= 0 && 
        item.outBps >= 0
      );
      
      if (validData.length === 0) {
        
        setTrafficError('No valid traffic data points found');
        setTrafficSeries([]);
        return;
      }
      
      setTrafficSeries(validData);
      // setLastUpdate(new Date()); // This line was removed as per the new_code
      setTrafficError(null); // Clear any previous errors
      
      
      

    } catch (error) {
      
      
      // Set error state for better user feedback
      if (error.response?.status === 404) {
        
        setTrafficError('Traffic endpoint not found - backend may need to be updated');
      } else if (error.response?.status === 500) {
        
        setTrafficError('Backend error - check server logs');
      } else if (error.code === 'ECONNREFUSED') {
        
        setTrafficError('Cannot connect to backend server');
      } else {
        setTrafficError(error.message || 'Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange]);

  // Derive alerts summary whenever store changes
  useEffect(() => {
    const alertsData = Array.isArray(alertsStore) ? alertsStore : [];
    const derive = (a) => {
      const ns = String(a.newStatus || '').toLowerCase();
      const isDown = ns === 'down';
      const derivedSeverity = isDown ? 'critical' : 'info';
      const derivedStatus = isDown ? (a.acknowledged ? 'acknowledged' : 'active') : 'resolved';
      return { ...a, _derivedSeverity: derivedSeverity, _derivedStatus: derivedStatus };
    };
    const derivedAlerts = alertsData.map(derive)
      .sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime());
    const critical = derivedAlerts.filter(a => a._derivedSeverity === 'critical').length;
    const warning = derivedAlerts.filter(a => a._derivedSeverity === 'warning').length;
    setAlertsSummary({ total: derivedAlerts.length, critical, warning, recent: derivedAlerts.slice(0, 10) });
  }, [alertsStore]);

  const openTopDevices = useCallback(async () => {
    try {
      const res = await api.get('/reports/network/devices_traffic', { params: { limit: 0 } });
      const items = (res.data?.data || []).map((d) => ({
        name: getDeviceLabel(d.instance),
        instance: d.instance,
        mbps: Number(d.bps || 0) / 1e6,
      }));
      setAllDevicesTraffic(items);
      setIsTopDevicesOpen(true);
    } catch (e) {
      setAllDevicesTraffic([]);
      setIsTopDevicesOpen(true);
    }
  }, [getDeviceLabel]);

  // Export helpers
  const downloadCsv = (rows, filename) => {
    const csv = rows.map((r) => r.map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadChartPng = (ref, filename) => {
    const svg = ref?.current?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgBlob = new Blob([`<?xml version="1.0" standalone="no"?>\r\n${svgStr}`], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    const { width, height } = svg.getBoundingClientRect();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(width);
      canvas.height = Math.ceil(height);
      const ctx = canvas.getContext('2d');
      // white bg for light/dark readability
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--tw-bg-opacity') ? '#111827' : '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const dl = document.createElement('a');
        dl.href = URL.createObjectURL(blob);
        dl.download = filename;
        dl.click();
        URL.revokeObjectURL(dl.href);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const exportTrafficCsv = () => {
    const rows = [['timestamp', 'inBps', 'outBps', 'inMbps', 'outMbps']].concat(
      (trafficSeries || []).map((d) => [
        d.timestamp,
        d.inBps,
        d.outBps,
        (Number(d.inBps || 0) / 1e6).toFixed(2),
        (Number(d.outBps || 0) / 1e6).toFixed(2)
      ])
    );
    downloadCsv(rows, `traffic_${selectedTimeRange}.csv`);
  };

  const exportTopDevicesCsv = () => {
    const rows = [['name', 'instance', 'mbps']].concat((filteredDevices || []).map((d) => [d.name, d.instance, d.mbps.toFixed(2)]));
    downloadCsv(rows, 'devices_by_traffic.csv');
  };

  const filteredDevices = useMemo(() => 
    allDevicesTraffic
      .filter(d => d.name.toLowerCase().includes(searchDevice.toLowerCase()) || d.instance.toLowerCase().includes(searchDevice.toLowerCase()))
      .sort((a, b) => sortDesc ? b.mbps - a.mbps : a.mbps - b.mbps),
    [allDevicesTraffic, searchDevice, sortDesc]
  );

  const handleRefresh = useCallback(() => {
    fetchData();
    dispatch(getDevices());
    dispatch(getAlerts());
  }, [fetchData, dispatch]);

  // Effects
  useEffect(() => {
    fetchData();
    dispatch(getDevices());
    dispatch(getAlerts());
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
        dispatch(getDevices());
        dispatch(getAlerts());
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [dispatch, autoRefresh, selectedTimeRange, fetchData]);
  
  // Subscribe to device updates when devices are loaded
  useEffect(() => {
    if (devices && devices.length > 0) {
      subscribeToDevices(devices.map(d => d._id));
    }
  }, [devices]);
  
  // Debug: Monitor trafficSeries state changes
  useEffect(() => {}, [trafficSeries]);
  
  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        
        const response = await api.get('/reports/health');
        
        
        // Also check if there are any devices
        const devicesResponse = await api.get('/devices');
        
        
        // Check if Prometheus is connected
        if (response.data?.prometheus === 'disconnected') {
          
          setTrafficError('Prometheus is not connected - traffic data may not be available');
        } else {
          
        }
      } catch (error) {
        
        if (error.code === 'ECONNREFUSED') {
          setTrafficError('Backend server is not running');
        } else if (error.response?.status === 404) {
          setTrafficError('Backend health endpoint not found');
        } else {
          setTrafficError(`Cannot connect to backend: ${error.message}`);
        }
      }
    };
    
    checkBackendHealth();
  }, []);

  // Enhanced chart configurations
  const chartConfigs = {
    default: {
      colors: Object.values(COLORS),
      gridColor: 'rgb(229 231 235)', // gray-200
      textColor: 'rgb(55 65 81)' // gray-700
    },
    dark: {
      colors: Object.values(COLORS),
      gridColor: 'rgb(55 65 81)', // gray-700
      textColor: '#FFFFFF'
    }
  };

  const currentChartConfig = chartConfigs[chartTheme];

  // Derived summary statistics
  const trafficStats = useMemo(() => {
    if (!Array.isArray(trafficSeries) || trafficSeries.length === 0) return null;
    const inValues = trafficSeries.map(d => Number(d.inBps || 0)).filter(v => v >= 0);
    const outValues = trafficSeries.map(d => Number(d.outBps || 0)).filter(v => v >= 0);
    if (inValues.length === 0 && outValues.length === 0) return null;
    const peakIn = inValues.length ? Math.max(...inValues) : 0;
    const peakOut = outValues.length ? Math.max(...outValues) : 0;
    const p95 = (arr) => {
      if (!arr.length) return 0;
      const sorted = arr.slice().sort((a, b) => a - b);
      const idx = Math.floor(0.95 * (sorted.length - 1));
      return sorted[idx];
    };
    return {
      peakIn,
      peakOut,
      p95In: p95(inValues),
      p95Out: p95(outValues)
    };
  }, [trafficSeries]);

  const avgUptimePercent = useMemo(() => {
    if (!Array.isArray(uptimeSeries) || uptimeSeries.length === 0) return null;
    const vals = uptimeSeries.map(s => Number(s.upPercent || 0)).filter(v => v >= 0);
    if (vals.length === 0) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return avg;
  }, [uptimeSeries]);

  const onlinePercent = useMemo(() => totalDevices > 0 ? (devicesUp / totalDevices) * 100 : 0, [devicesUp, totalDevices]);
  const offlinePercent = useMemo(() => totalDevices > 0 ? (devicesDown / totalDevices) * 100 : 0, [devicesDown, totalDevices]);

  // Average health score across devices (0-100)
  const avgHealthScore = useMemo(() => {
    if (!networkSummary) return null;
    const availability24h = Number(networkSummary.availability24h || 0); // 0-100
    const upNow = Number(onlinePercent || 0); // 0-100

    // Blend availability, average uptime (if present), and current up percent
    let base;
    if (avgUptimePercent !== null && !isNaN(avgUptimePercent)) {
      base = 0.5 * availability24h + 0.3 * avgUptimePercent + 0.2 * upNow;
    } else {
      base = 0.7 * availability24h + 0.3 * upNow;
    }

    const alertPenaltyPerDevice = (alertsSummary.critical * 7 + alertsSummary.warning * 3) / Math.max(totalDevices || 1, 1);
    const score = base - alertPenaltyPerDevice;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [networkSummary, onlinePercent, avgUptimePercent, alertsSummary.critical, alertsSummary.warning, totalDevices]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      {/* Mobile-specific CSS utilities */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .break-all {
          word-break: break-all;
        }
        @media (max-width: 640px) {
          .mobile-text-xs {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          .mobile-p-2 {
            padding: 0.5rem;
          }
          .mobile-gap-2 {
            gap: 0.5rem;
          }
        }
      `}</style>
      
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {t('dashboard.title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                {t('dashboard.description')}
              </p>
            </div>
            
            {/* Quick Actions removed as requested */}
          </div>
          
          {/* Time Range Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 w-full sm:w-auto"
              >
                <option value="1h">{t('dashboard.lastHour')}</option>
                <option value="6h">{t('dashboard.last6Hours')}</option>
                <option value="24h">{t('dashboard.last24Hours')}</option>
                <option value="7d">{t('dashboard.last7Days')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.totalDevices')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{totalDevices}</p>
                </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DeviceTabletIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.onlineDevices')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{devicesUp}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.offlineDevices')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">{devicesDown}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.totalAlerts')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{alertsSummary.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <BellAlertIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alert Statistics Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.alertStatistics')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{alertsSummary.critical}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.criticalAlerts')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{alertsSummary.warning}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.warningAlerts')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{alertsSummary.total - alertsSummary.critical - alertsSummary.warning}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.infoAlerts')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{alertsSummary.total - alertsSummary.recent.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.resolvedAlerts')}</div>
            </div>
          </div>
        </div>

        {/* Network Overview & Top Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.networkHealth')}</h2>
            </div>
            {networkSummary ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.availability24h')}</div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold text-indigo-900 dark:text-indigo-100">{formatPercent(networkSummary.availability24h)}</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{t('dashboard.target')}: 99.9%</div>
                </div>

                <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.onlineDevices')}</div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold text-green-900 dark:text-green-100">{devicesUp}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">{formatPercent(onlinePercent)}</div>
                </div>

                <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.offlineDevices')}</div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold text-red-900 dark:text-red-100">{devicesDown}</div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">{formatPercent(offlinePercent)}</div>
                </div>

                <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalIn')}</div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold text-blue-900 dark:text-blue-100">{formatMbps(networkSummary.totalInBps)}</div>
                  {trafficStats && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('dashboard.peak')}: {formatMbps(trafficStats.peakIn)} • P95: {formatMbps(trafficStats.p95In)}</div>
                  )}
                </div>

                <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalOut')}</div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold text-orange-900 dark:text-orange-100">{formatMbps(networkSummary.totalOutBps)}</div>
                  {trafficStats && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">{t('dashboard.peak')}: {formatMbps(trafficStats.peakOut)} • P95: {formatMbps(trafficStats.p95Out)}</div>
                  )}
                </div>

                <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.responseTime')}</div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold text-emerald-900 dark:text-emerald-100">{(networkSummary.avgResponseTime || 0).toFixed(1)}ms</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{t('dashboard.avg')}: {(networkSummary.avgResponseTime || 0).toFixed(1)}ms</div>
                </div>

                {avgUptimePercent !== null && (
                  <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.averageUptime')}</div>
                    <div className="text-base sm:text-lg md:text-2xl font-bold text-purple-900 dark:text-purple-100">{formatPercent(avgUptimePercent)}</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">{t('dashboard.uptimeDowntimeTrend24h')} {selectedTimeRange}</div>
                  </div>
                )}

                <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalAlerts')}</div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold text-yellow-900 dark:text-yellow-100">{alertsSummary.total}</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{t('dashboard.criticalAlerts')}: {alertsSummary.critical} • {t('dashboard.warningAlerts')}: {alertsSummary.warning}</div>
                </div>

                {avgHealthScore !== null && (
                  <div className="p-2 sm:p-3 md:p-4 rounded-md bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.avgHealthScore')}</div>
                    <div className="text-base sm:text-lg md:text-2xl font-bold text-emerald-900 dark:text-emerald-100">{avgHealthScore}%</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{totalDevices} devices</div>
                  </div>
                )}
              </div>
            ) : (
              <LoadingSkeleton className="h-48" />
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.topDevices')}</h2>
              </div>
              <Button 
                onClick={openTopDevices} 
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                {t('dashboard.viewAll')}
              </Button>
            </div>
            {topDeviceBars.length ? (
              <div className="h-48 sm:h-64 cursor-pointer" onClick={openTopDevices}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDeviceBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={currentChartConfig.gridColor} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: currentChartConfig.textColor }} />
                    <YAxis tick={{ fontSize: 10, fill: currentChartConfig.textColor }} tickFormatter={formatMbps} />
                    <Tooltip content={<CustomTooltip formatter={(l) => l} valueFormatter={(n)=>`${formatNumber(n,2)} Mbps`} />} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <Bar 
                      dataKey="mbps" 
                      fill="url(#barGradient)" 
                      radius={[6,6,0,0]}
                      className="hover:opacity-90 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <LoadingSkeleton className="h-48 sm:h-64" />
            )}
          </div>
        </div>

        {/* Device Types */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <ServerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.deviceTypes')}</h2>
            </div>
            {deviceTypeData.length ? (
              <div className="h-40 sm:h-48 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={deviceTypeData} 
                      dataKey="value" 
                      nameKey="name" 
                      outerRadius={60} 
                      innerRadius={30}
                      paddingAngle={5}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                                              {deviceTypeData.map((entry, index) => {
                          const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index % colors.length]}
                              className="transition-all duration-300 hover:opacity-80 hover:scale-105"
                            />
                          );
                        })}
                    </Pie>
                    <Tooltip content={<CustomTooltip valueFormatter={(n)=>formatNumber(n,2)} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <LoadingSkeleton className="h-40 sm:h-48 md:h-64" />
            )}
          </div>
        </div>

        {/* Enhanced Traffic Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
            <ArrowTrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.totalTraffic24h')}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{selectedTimeRange}</span>
            <div className="ml-auto flex items-center gap-2" />
          </div>
          {trafficSeries.length > 0 ? (
            <>
            <div className="h-48 sm:h-56 md:h-72 cursor-pointer" onClick={() => setIsTrafficModalOpen(true)} ref={trafficChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradDashIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="gradDashOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentChartConfig.gridColor} />
                  <XAxis 
                    dataKey="timestamp" 
                    minTickGap={24} 
                    tick={{ fontSize: 9, fill: chartTheme === 'dark' ? '#FFFFFF' : currentChartConfig.textColor }} 
                    tickFormatter={formatAxisTime} 
                  />
                  <YAxis tick={{ fontSize: 9, fill: chartTheme === 'dark' ? '#FFFFFF' : currentChartConfig.textColor }} tickFormatter={(v) => formatMbps(v)} />
                  <Tooltip 
                    content={<CustomTooltip formatter={formatTooltipTime} valueFormatter={(n)=>formatMbps(n)} />}
                    labelFormatter={(l) => formatTooltipTime(l)} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="inBps" 
                    name="In" 
                    stroke="#8B5CF6" 
                    fill="url(#gradDashIn)" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="outBps" 
                    name="Out" 
                    stroke="#F59E0B" 
                    fill="url(#gradDashOut)" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </>
          ) : isLoading ? (
            <LoadingSkeleton className="h-48 sm:h-56 md:h-72" />
          ) : (
            <div className="h-48 sm:h-56 md:h-72 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400 px-3 sm:px-4">
                <ChartBarIcon className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                {trafficError ? (
                  <>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-red-600 mb-2">{t('dashboard.trafficError') || 'Error loading traffic data'}</p>
                    <p className="text-xs sm:text-sm text-red-500 mb-3">{trafficError}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm sm:text-base md:text-lg font-medium mb-2">{t('dashboard.noTrafficData') || 'No traffic data available'}</p>
                    <p className="text-xs sm:text-sm mb-3">{t('dashboard.trafficDataDescription') || 'This could be due to:'}</p>
                    <ul className="text-xs text-gray-400 mb-3 space-y-1">
                      <li>• No SNMP devices configured</li>
                      <li>• Prometheus not collecting metrics</li>
                      <li>• Network connectivity issues</li>
                    </ul>
                  </>
                )}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={handleRefresh}
                    icon={ArrowPathIcon}
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    {t('dashboard.refreshData') || 'Refresh Data'}
                  </Button>
                  <Button
                    onClick={() => {
                      // Generate sample data for testing
                      const sampleData = [];
                      const now = new Date();
                      for (let i = 23; i >= 0; i--) {
                        const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
                        sampleData.push({
                          timestamp: timestamp.toISOString(),
                          inBps: Math.random() * 1000000000 + 100000000,
                          outBps: Math.random() * 800000000 + 80000000
                        });
                      }
                      setTrafficSeries(sampleData);
                    }}
                    variant="secondary"
                    size="sm"
                    icon={ChartBarIcon}
                    className="text-xs sm:text-sm"
                  >
                    {t('dashboard.generateSampleData') || 'Generate Sample Data'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Traffic Modal */}
        <Transition appear show={isTrafficModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsTrafficModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
              leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                  leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-4xl sm:max-w-5xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-4 sm:p-5 md:p-6 text-left align-middle shadow-2xl">
                    <Dialog.Title className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                        {t('dashboard.totalTraffic24h')} {selectedTimeRange}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => downloadChartPng(trafficModalChartRef, 'traffic_24h.png')} variant="secondary" size="sm" className="!px-2 !py-1 flex items-center gap-1 text-xs">
                          <PhotoIcon className="w-3 h-3 sm:w-4 sm:h-4" /> PNG
                        </Button>
                        <Button onClick={exportTrafficCsv} variant="secondary" size="sm" className="!px-2 !py-1 flex items-center gap-1 text-xs">
                          <ArrowDownTrayIcon className="w-3 h-3 sm:w-4 sm:h-4" /> CSV
                        </Button>
                        <Button onClick={() => setIsTrafficModalOpen(false)} variant="secondary" size="sm" icon={XCircleIcon} className="!p-1">
                          Close
                        </Button>
                      </div>
                    </Dialog.Title>
                    <div className="h-[320px] sm:h-[420px] md:h-[460px]" ref={trafficModalChartRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficSeries} margin={{ top: 10, right: 20, left: 8, bottom: 10 }}>
                          <defs>
                            <linearGradient id="gradModalIn" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.85} />
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.25} />
                            </linearGradient>
                            <linearGradient id="gradModalOut" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.85} />
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.25} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={currentChartConfig.gridColor} />
                  <XAxis dataKey="timestamp" minTickGap={24} tick={{ fontSize: 10, fill: chartTheme === 'dark' ? '#FFFFFF' : currentChartConfig.textColor }} tickFormatter={formatAxisTime} />
                  <YAxis tick={{ fontSize: 10, fill: chartTheme === 'dark' ? '#FFFFFF' : currentChartConfig.textColor }} tickFormatter={(v)=>formatMbps(v)} label={{ value: 'Mbps', angle: -90, position: 'insideLeft', fill: chartTheme === 'dark' ? '#FFFFFF' : currentChartConfig.textColor, fontSize: 10, offset: 6 }} />
                          <Tooltip content={<CustomTooltip formatter={formatTooltipTime} valueFormatter={(n)=>formatMbps(n)} />} labelFormatter={(l)=>formatTooltipTime(l)} />
                          <Legend />
                          <Area type="monotone" dataKey="inBps" name="In" stroke="#8B5CF6" fill="url(#gradModalIn)" strokeWidth={2} dot={false} />
                          <Area type="monotone" dataKey="outBps" name="Out" stroke="#F59E0B" fill="url(#gradModalOut)" strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Enhanced Uptime & Downtime Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.uptimeDowntimeTrend24h')} {selectedTimeRange}</h2>
          </div>
          {uptimeSeries.length > 0 ? (
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={uptimeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentChartConfig.gridColor} />
                  <XAxis 
                    dataKey="timestamp" 
                    minTickGap={24} 
                    tick={{ fontSize: 10, fill: currentChartConfig.textColor }} 
                    tickFormatter={formatAxisTime} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: currentChartConfig.textColor }} 
                            tickFormatter={formatPercent} 
                  />
                  <Tooltip 
                    content={<CustomTooltip formatter={(l)=>l} valueFormatter={(n)=>formatPercent(n)} />}
                    formatter={formatPercent} 
                    labelFormatter={(l) => formatTooltipTime(l)} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="upPercent" 
                    name="Uptime %" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={false}
                    strokeDasharray="5 5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="downPercent" 
                    name="Downtime %" 
                    stroke="#EF4444" 
                    strokeWidth={3} 
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <LoadingSkeleton className="h-48 sm:h-64" />
          )}
        </div>

        {/* Detailed Uptime & Downtime Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircleSolidIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <XCircleSolidIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.uptimeDowntimeStats24h')} {selectedTimeRange}</h2>
          </div>
          
          {uptimeSeries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Current Status */}
              <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {uptimeSeries[uptimeSeries.length - 1]?.upPercent?.toFixed(1) || 0}%
                </div>
                <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">{t('dashboard.currentUptime')}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {uptimeSeries[uptimeSeries.length - 1]?.devicesUp || 0} {t('dashboard.devicesOnline', { total: uptimeSeries[uptimeSeries.length - 1]?.totalDevices || 0 })}
                </div>
              </div>
              
              <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                  {uptimeSeries[uptimeSeries.length - 1]?.downPercent?.toFixed(1) || 0}%
                </div>
                <div className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">{t('dashboard.currentDowntime')}</div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {uptimeSeries[uptimeSeries.length - 1]?.devicesDown || 0} {t('dashboard.devicesOffline', { total: uptimeSeries[uptimeSeries.length - 1]?.totalDevices || 0 })}
                </div>
              </div>
              
              <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {uptimeSeries[uptimeSeries.length - 1]?.totalDevices || 0}
                </div>
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">{t('dashboard.totalDevices')}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {t('dashboard.monitoredBy')} SNMP
                </div>
              </div>
            </div>
          ) : (
            <LoadingSkeleton className="h-24" />
          )}
          
          {/* Historical Summary */}
          {uptimeSeries.length > 0 && (
            <div className="mt-6 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('dashboard.historicalSummary')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.max(...uptimeSeries.map(s => s.upPercent)).toFixed(1)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{t('dashboard.peakUptime')}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                    {Math.max(...uptimeSeries.map(s => s.downPercent)).toFixed(1)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{t('dashboard.peakDowntime')}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(uptimeSeries.reduce((sum, s) => sum + s.upPercent, 0) / uptimeSeries.length).toFixed(1)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{t('dashboard.averageUptime')}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {uptimeSeries.filter(s => s.downPercent > 0).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{t('dashboard.downtimeEvents')}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Individual Device Uptime & Downtime */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ServerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.deviceUptimeDetails')} {selectedTimeRange}</h2>
            </div>
            <Button 
              onClick={handleRefresh}
              icon={ArrowPathIcon}
              size="sm"
              className="w-full sm:w-auto"
            >
              {t('dashboard.refresh')}
            </Button>
          </div>
          
          {uptimeSeries.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3">
                {deviceUptimeData.length > 0 ? (
                  deviceUptimeData.map((device, index) => (
                    <div key={device.instance} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <ServerIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {getDeviceLabel(device.instance)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {device.uptimePercent?.toFixed(1) || 0}%
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">Uptime</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">
                            {device.downtimePercent?.toFixed(1) || 0}%
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400">Downtime</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          device.lastStatus === 'UP'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {device.lastStatus}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTooltipTime(device.lastCheck)}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${device.uptimePercent || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : uptimeSeries[uptimeSeries.length - 1]?.totalDevices > 0 ? (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <ServerIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{t('dashboard.allSnmpDevices')}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {uptimeSeries[uptimeSeries.length - 1]?.upPercent?.toFixed(1) || 0}%
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">Uptime</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {uptimeSeries[uptimeSeries.length - 1]?.downPercent?.toFixed(1) || 0}%
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">Downtime</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        uptimeSeries[uptimeSeries.length - 1]?.downPercent === 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {uptimeSeries[uptimeSeries.length - 1]?.downPercent === 0 ? t('common.up') : t('common.down')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTooltipTime(uptimeSeries[uptimeSeries.length - 1]?.timestamp)}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uptimeSeries[uptimeSeries.length - 1]?.upPercent || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ServerIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No device data available</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Table View */}
              <table className="hidden lg:table w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">{t('common.name')}</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">{t('dashboard.currentStatus')}</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">{t('dashboard.uptimePercent')}</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">{t('dashboard.downtimePercent')}</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">{t('dashboard.lastCheck')}</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white">{t('dashboard.health')}</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceUptimeData.length > 0 ? (
                    deviceUptimeData.map((device, index) => (
                      <tr key={device.instance} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <ServerIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            <span className="font-medium truncate max-w-[120px] sm:max-w-none">{getDeviceLabel(device.instance)}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">({device.instance})</span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                          <span className={`inline-flex items-center px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                            device.lastStatus === 'UP'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {device.lastStatus}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-green-600 dark:text-green-400 font-medium">
                          {device.uptimePercent?.toFixed(1) || 0}%
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-red-600 dark:text-red-400 font-medium">
                          {device.downtimePercent?.toFixed(1) || 0}%
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-600 dark:text-gray-400 text-xs">
                          {formatTooltipTime(device.lastCheck)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${device.uptimePercent || 0}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : uptimeSeries[uptimeSeries.length - 1]?.totalDevices > 0 ? (
                    // Fallback to summary data if individual device data is not available
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <ServerIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                          <span className="text-xs sm:text-sm">{t('dashboard.allSnmpDevices')}</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                        <span className={`inline-flex items-center px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          uptimeSeries[uptimeSeries.length - 1]?.downPercent === 0 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {uptimeSeries[uptimeSeries.length - 1]?.downPercent === 0 ? t('common.up') : t('common.down')}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-green-600 dark:text-green-400 font-medium">
                        {uptimeSeries[uptimeSeries.length - 1]?.upPercent?.toFixed(1) || 0}%
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-red-600 dark:text-red-400 font-medium">
                        {uptimeSeries[uptimeSeries.length - 1]?.downPercent?.toFixed(1) || 0}%
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-600 dark:text-gray-400 text-xs">
                        {formatTooltipTime(uptimeSeries[uptimeSeries.length - 1]?.timestamp)}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uptimeSeries[uptimeSeries.length - 1]?.upPercent || 0}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No device data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <LoadingSkeleton className="h-32" />
          )}
        </div>

        {/* Enhanced Up/Down Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircleSolidIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <XCircleSolidIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.deviceStatusDistribution')}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={upDownPie} 
                    dataKey="value" 
                    nameKey="name" 
                    outerRadius={80} 
                    innerRadius={40}
                    paddingAngle={5}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {upDownPie.map((entry, index) => (
                      <Cell 
                        key={`cell-updown-${index}`} 
                        fill={entry.color}
                        className="transition-all duration-300 hover:opacity-80 hover:scale-105 cursor-pointer"
                      >
                        <animate attributeName="opacity" from="0" to="1" dur="1s" />
                      </Cell>
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Status Summary */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">{devicesUp}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.onlineDevices')}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {totalDevices > 0 ? `${((devicesUp / totalDevices) * 100).toFixed(1)}% ${t('dashboard.devicesOnlinePercent')}` : '0%'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400">{devicesDown}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.offlineDevices')}</div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {totalDevices > 0 ? `${((devicesDown / totalDevices) * 100).toFixed(1)}% ${t('dashboard.devicesOfflinePercent')}` : '0%'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.recentAlerts')}</h2>
              {alertsSummary.total > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                  {t('dashboard.activeAlertsCount', { count: alertsSummary.total })}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString()}
            </div>
          </div>
          {alertsSummary.recent.length ? (
            <div className="space-y-2 sm:space-y-3">
              {alertsSummary.recent.map((alert) => (
                <button onClick={() => navigate('/alerts')} key={alert._id} className="w-full text-left flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-orange-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm mb-1">
                        <span className="truncate">{getAlertDeviceName(alert) || t('devices.deviceName')}</span>
                        {getAlertDeviceIp(alert) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">{getAlertDeviceIp(alert)}</span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {t(`alerts.severity.${(alert._derivedSeverity || 'info')}`)} • {new Date(alert.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' })}
                      </div>
                      {alert.title && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-2">{alert.title}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                      String(alert.newStatus).toUpperCase() === 'DOWN' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                      {String(alert.newStatus).toUpperCase() === 'DOWN' ? t('common.down') : t('common.up')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert._derivedStatus === 'acknowledged' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : alert._derivedStatus === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {t(`alerts.status.${alert._derivedStatus}`)}
                  </span>
                </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
              <CheckCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm sm:text-base">{t('dashboard.noCriticalAlerts')}</p>
              <p className="text-xs sm:text-sm">{t('dashboard.allSystemsRunning')}</p>
            </div>
          )}
        </div>

        {/* Enhanced Modal: All Devices Traffic */}
        <Transition appear show={isTopDevicesOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsTopDevicesOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
              leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                  leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-4xl sm:max-w-5xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-4 sm:p-5 md:p-6 text-left align-middle shadow-2xl">
                    <Dialog.Title className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        All Devices by Traffic
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => downloadChartPng(topDevicesChartRef, 'devices_by_traffic.png')} variant="secondary" size="sm" className="!px-2 !py-1 flex items-center gap-1 text-xs">
                          <PhotoIcon className="w-3 h-3 sm:w-4 sm:h-4" /> PNG
                        </Button>
                        <Button onClick={exportTopDevicesCsv} variant="secondary" size="sm" className="!px-2 !py-1 flex items-center gap-1 text-xs">
                          <ArrowDownTrayIcon className="w-3 h-3 sm:w-4 sm:h-4" /> CSV
                        </Button>
                        <Button
                        onClick={() => setIsTopDevicesOpen(false)} 
                          variant="secondary"
                          size="sm"
                          icon={XCircleIcon}
                          className="!p-1"
                      >
                          Close
                        </Button>
                      </div>
                    </Dialog.Title>

                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                      <div className="relative flex-1">
                        <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('dashboard.searchDevicePlaceholder')}
                          value={searchDevice}
                          onChange={(e) => setSearchDevice(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{t('dashboard.sort')}:</span>
                        <Button 
                          onClick={() => setSortDesc(true)} 
                          variant={sortDesc ? "primary" : "secondary"}
                          size="sm"
                          className="text-xs"
                        >
                          Descending
                        </Button>
                        <Button 
                          onClick={() => setSortDesc(false)} 
                          variant={!sortDesc ? "primary" : "secondary"}
                          size="sm"
                          className="text-xs"
                        >
                          Ascending
                        </Button>
                      </div>
                    </div>

                    <div className="h-[320px] sm:h-[420px] md:h-[460px]" ref={topDevicesChartRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredDevices} margin={{ top: 10, right: 20, left: 8, bottom: 70 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={currentChartConfig.gridColor} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 10, fill: currentChartConfig.textColor }} 
                            interval={0} 
                            angle={-30} 
                            textAnchor="end" 
                            height={80} 
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: currentChartConfig.textColor }} 
                            tickFormatter={formatMbps} 
                            label={{ value: 'Mbps', angle: -90, position: 'insideLeft', fill: currentChartConfig.textColor, fontSize: 10, offset: 6 }}
                          />
                          <Tooltip 
                            content={<CustomTooltip formatter={(l)=>l} valueFormatter={(n)=>`${formatNumber(n,2)} Mbps`} />}
                          />
                          <defs>
                            <linearGradient id="barGradientAll" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.95} />
                              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.75} />
                            </linearGradient>
                          </defs>
                          <Bar 
                            dataKey="mbps" 
                            fill="url(#barGradientAll)"
                            radius={[6,6,0,0]}
                            isAnimationActive
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                      {t('dashboard.showing')} {filteredDevices.length} {t('dashboard.of')} {allDevicesTraffic.length} {t('dashboard.totalDevices').toLowerCase()}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default Dashboard;
