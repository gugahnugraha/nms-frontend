import React, { useEffect, useState, Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import api from '../../config/api';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { 
  WifiIcon, 
  SignalIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function formatBps(v) {
  if (v >= 1e9) return (v/1e9).toFixed(2) + ' Gbps';
  if (v >= 1e6) return (v/1e6).toFixed(2) + ' Mbps';
  if (v >= 1e3) return (v/1e3).toFixed(2) + ' Kbps';
  return Math.round(v) + ' bps';
}

const TZ = 'Asia/Jakarta';
const formatTimeAxis = (ts) => {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};
const formatTimeTooltip = (ts) => {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d) + ' WIB';
};

// Mini Utilization Meter Component
const UtilizationMeter = ({ value, max, label, color = '#3b82f6' }) => {
  const percentage = Math.min(100, (value / max) * 100);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
            className="dark:stroke-gray-600"
          />
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatBps(value)}
        </div>
      </div>
    </div>
  );
};

// Sparkline Component for mini trend visualization
const Sparkline = ({ data, color = '#3b82f6' }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <div className="w-24 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const InterfaceCharts = ({ deviceId, iface, selectedTimeRange, setSelectedTimeRange }) => {
  const { t } = useTranslation();
  const [data, setData] = useState({ series: [], summary: {} });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Time range configurations
  const timeRangeConfigs = {
    '1h': { windowSec: 3600, step: '60s' },
    '6h': { windowSec: 21600, step: '300s' },
    '24h': { windowSec: 86400, step: '900s' },
    '7d': { windowSec: 604800, step: '3600s' },
    '30d': { windowSec: 2592000, step: '14400s' }
  };

  const currentConfig = timeRangeConfigs[selectedTimeRange || '1h'];

  useEffect(() => {
    if (!deviceId || !iface?.index) return;
    setLoading(true);
    api.get(`/snmp/devices/${deviceId}/interfaces/${iface.index}/timeseries`, { 
      params: { 
        windowSec: currentConfig.windowSec, 
        step: currentConfig.step 
      } 
    })
      .then((res) => setData(res.data?.data || { series: [], summary: {} }))
      .finally(() => setLoading(false));
  }, [deviceId, iface?.index, selectedTimeRange, currentConfig.windowSec, currentConfig.step]);

  // Computed values for enhanced display
  const computedStats = useMemo(() => {
    const series = data.series || [];
    if (series.length === 0) return null;

    const latest = series[series.length - 1];
    const maxSpeed = data.summary?.speedBps || 1000000000; // Default 1Gbps
    
    // Calculate utilization percentages
    const inUtilization = (latest?.inBps || 0) / maxSpeed * 100;
    const outUtilization = (latest?.outBps || 0) / maxSpeed * 100;
    
    // Calculate peak values
    const peakIn = Math.max(...series.map(s => s.inBps || 0));
    const peakOut = Math.max(...series.map(s => s.outBps || 0));
    
    // Prepare sparkline data (last 20 points)
    const sparklineData = series.slice(-20).map((s, i) => ({
      value: (s.inBps + s.outBps) / 2
    }));
    
    return {
      current: {
        inBps: latest?.inBps || 0,
        outBps: latest?.outBps || 0,
        inUtilization,
        outUtilization
      },
      peak: { inBps: peakIn, outBps: peakOut },
      maxSpeed,
      sparklineData,
      trend: series.length > 1 ? 
        ((latest?.inBps || 0) + (latest?.outBps || 0)) - 
        ((series[series.length - 2]?.inBps || 0) + (series[series.length - 2]?.outBps || 0)) : 0
    };
  }, [data]);

  if (!iface) return null;

  const status = String(iface.status || '').toLowerCase();
  const isUp = status === 'up';
  const isDown = status === 'down';
  const borderClass = isUp ? 'border-green-500' : isDown ? 'border-red-500' : 'border-gray-300 dark:border-gray-600';
  const statusColor = isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-gray-500';

  const SmallChart = () => (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.series} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <defs>
            {/* Enhanced gradients with multiple stops */}
            <linearGradient id="gradIfaceIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="25%" stopColor="#60a5fa" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#93c5fd" stopOpacity={0.4} />
              <stop offset="75%" stopColor="#dbeafe" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#eff6ff" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradIfaceOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="25%" stopColor="#a78bfa" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity={0.4} />
              <stop offset="75%" stopColor="#e9d5ff" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f5f3ff" stopOpacity={0.05} />
            </linearGradient>
            {/* Glow effects */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-600"
            opacity={0.5}
          />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 11, fill: '#FFFFFF' }} 
            minTickGap={24} 
            tickFormatter={formatTimeAxis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatBps} 
            tick={{ fontSize: 11, fill: '#FFFFFF' }} 
            width={70}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(v, name) => [formatBps(v), name === 'inBps' ? t('deviceDetail.inbound') : t('deviceDetail.outbound')]}
            labelFormatter={(l) => formatTimeTooltip(l)}
            contentStyle={{
              backgroundColor: '#111827',
              color: '#FFFFFF',
              border: '1px solid #374151',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)'
            }}
            cursor={{ stroke: '#6b7280', strokeDasharray: '5 5' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px', color: '#FFFFFF' }}
            iconType="circle"
          />
          <Area 
            type="monotone" 
            dataKey="inBps" 
            name={t('deviceDetail.inbound')} 
            stroke="#3b82f6" 
            fill="url(#gradIfaceIn)" 
            strokeWidth={3}
            dot={false}
            activeDot={{ 
              r: 6, 
              stroke: '#3b82f6', 
              strokeWidth: 2, 
              fill: '#ffffff',
              filter: 'url(#glow)'
            }}
            className="transition-all duration-300"
          />
          <Area 
            type="monotone" 
            dataKey="outBps" 
            name={t('deviceDetail.outbound')} 
            stroke="#8b5cf6" 
            fill="url(#gradIfaceOut)" 
            strokeWidth={3}
            dot={false}
            activeDot={{ 
              r: 6, 
              stroke: '#8b5cf6', 
              strokeWidth: 2, 
              fill: '#ffffff',
              filter: 'url(#glow)'
            }}
            className="transition-all duration-300"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const LargeChart = () => (
    <div className="h-[420px] md:h-[480px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.series} margin={{ top: 20, right: 30, bottom: 10, left: 0 }}>
          <defs>
            {/* Enhanced large chart gradients */}
            <linearGradient id="gradLargeIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
              <stop offset="20%" stopColor="#60a5fa" stopOpacity={0.7} />
              <stop offset="40%" stopColor="#93c5fd" stopOpacity={0.5} />
              <stop offset="70%" stopColor="#dbeafe" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#eff6ff" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradLargeOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
              <stop offset="20%" stopColor="#a78bfa" stopOpacity={0.7} />
              <stop offset="40%" stopColor="#c4b5fd" stopOpacity={0.5} />
              <stop offset="70%" stopColor="#e9d5ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f5f3ff" stopOpacity={0.05} />
            </linearGradient>
            {/* Enhanced glow for large chart */}
            <filter id="glowLarge">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="2 4" 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-600"
            opacity={0.3}
          />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12, fill: '#FFFFFF' }} 
            minTickGap={24} 
            tickFormatter={formatTimeAxis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatBps} 
            tick={{ fontSize: 12, fill: '#FFFFFF' }} 
            width={90}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(v, name) => [formatBps(v), name === 'inBps' ? t('deviceDetail.inboundTraffic') : t('deviceDetail.outboundTraffic')]}
            labelFormatter={(l) => formatTimeTooltip(l)}
            contentStyle={{
              backgroundColor: '#111827',
              color: '#FFFFFF',
              border: '1px solid #374151',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              padding: '12px 16px'
            }}
            cursor={{ stroke: '#6b7280', strokeDasharray: '3 3', strokeWidth: 2 }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: '#FFFFFF' }}
            iconType="circle"
          />
          <Area 
            type="monotone" 
            dataKey="inBps" 
            name={t('deviceDetail.inboundTraffic')} 
            stroke="#3b82f6" 
            fill="url(#gradLargeIn)" 
            strokeWidth={4}
            dot={false}
            activeDot={{ 
              r: 8, 
              stroke: '#3b82f6', 
              strokeWidth: 3, 
              fill: '#ffffff',
              filter: 'url(#glowLarge)',
              style: { cursor: 'pointer' }
            }}
            className="transition-all duration-300 hover:opacity-80"
          />
          <Area 
            type="monotone" 
            dataKey="outBps" 
            name={t('deviceDetail.outboundTraffic')} 
            stroke="#8b5cf6" 
            fill="url(#gradLargeOut)" 
            strokeWidth={4}
            dot={false}
            activeDot={{ 
              r: 8, 
              stroke: '#8b5cf6', 
              strokeWidth: 3, 
              fill: '#ffffff',
              filter: 'url(#glowLarge)',
              style: { cursor: 'pointer' }
            }}
            className="transition-all duration-300 hover:opacity-80"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      <div
        className={`group bg-white dark:bg-gray-800 rounded-xl border-2 ${borderClass} p-6 mt-4 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm`}
        onClick={() => setOpen(true)}
      >
        {/* Header with status indicator and trend */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {isUp ? (
                <WifiIcon className="h-6 w-6 text-green-500" />
              ) : (
                <WifiIcon className="h-6 w-6 text-red-500" />
              )}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isUp ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{iface.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('deviceDetail.interfaceLabel')} {iface.index} • {formatBps(data.summary?.speedBps || 0)} {t('deviceDetail.capacity')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {computedStats && (
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                computedStats.trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                computedStats.trend < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {computedStats.trend > 0 ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : computedStats.trend < 0 ? (
                  <ArrowDownIcon className="h-3 w-3" />
                ) : (
                  <SignalIcon className="h-3 w-3" />
                )}
                {computedStats.trend === 0 ? t('deviceDetail.stable') : formatBps(Math.abs(computedStats.trend))}
              </div>
            )}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUp ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
              'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {(iface.status || '').toUpperCase()}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-sm text-gray-500">{t('deviceDetail.loading')}</span>
          </div>
        ) : data.series.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <ChartBarIcon className="h-12 w-12 mb-2 opacity-50" />
            <span className="text-sm">{t('deviceDetail.noTrafficData')}</span>
          </div>
        ) : (
          <>
            {/* Current utilization meters */}
            {computedStats && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ArrowDownIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{t('deviceDetail.inbound')}</span>
                    </div>
                    <Sparkline data={computedStats.sparklineData} color="#3b82f6" />
                  </div>
                  <UtilizationMeter 
                    value={computedStats.current.inBps}
                    max={computedStats.maxSpeed}
                    label={t('deviceDetail.current')}
                    color="#3b82f6"
                  />
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    {t('deviceDetail.peak')}: {formatBps(computedStats.peak.inBps)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ArrowUpIcon className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">{t('deviceDetail.outbound')}</span>
                    </div>
                    <Sparkline data={computedStats.sparklineData} color="#8b5cf6" />
                  </div>
                  <UtilizationMeter 
                    value={computedStats.current.outBps}
                    max={computedStats.maxSpeed}
                    label={t('deviceDetail.current')}
                    color="#8b5cf6"
                  />
                  <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                    {t('deviceDetail.peak')}: {formatBps(computedStats.peak.outBps)}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced chart */}
            <div className="relative">
              <SmallChart />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {t('deviceDetail.clickForDetails')}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-4xl rounded-xl bg-white dark:bg-gray-900 p-4 md:p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">{iface.name} — {t('deviceDetail.detailTraffic')}</Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('deviceDetail.interfaceLabel')} {iface.index} • {(iface.status || '').toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedTimeRange || '1h'}
                      onChange={(e) => setSelectedTimeRange && setSelectedTimeRange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="1h">{t('deviceDetail.lastHour')}</option>
                      <option value="6h">{t('deviceDetail.last6Hours')}</option>
                      <option value="24h">{t('deviceDetail.last24Hours')}</option>
                      <option value="7d">{t('deviceDetail.last7Days')}</option>
                      <option value="30d">{t('deviceDetail.last30Days')}</option>
                    </select>
                    <button onClick={() => setOpen(false)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm">{t('common.close')}</button>
                  </div>
                </div>
                
                {/* Enhanced Statistics */}
                {data.series.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="text-xs text-blue-600 dark:text-blue-300">{t('deviceDetail.averageIn')}</div>
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{formatBps(data.summary.avgIn || 0)}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="text-xs text-purple-600 dark:text-purple-300">{t('deviceDetail.averageOut')}</div>
                      <div className="text-lg font-bold text-purple-900 dark:text-purple-100">{formatBps(data.summary.avgOut || 0)}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="text-xs text-green-600 dark:text-green-300">{t('deviceDetail.peakIn')}</div>
                      <div className="text-lg font-bold text-green-900 dark:text-green-100">{formatBps(data.summary.maxIn || 0)}</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                      <div className="text-xs text-orange-600 dark:text-orange-300">{t('deviceDetail.peakOut')}</div>
                      <div className="text-lg font-bold text-orange-900 dark:text-orange-100">{formatBps(data.summary.maxOut || 0)}</div>
                    </div>
                  </div>
                )}
                
                {data.series.length > 0 ? <LargeChart /> : <div className="text-sm text-gray-500">{t('deviceDetail.noData')}</div>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default InterfaceCharts;


