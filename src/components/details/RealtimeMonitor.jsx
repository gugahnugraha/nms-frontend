import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Progress = ({ label, value, color }) => {
  const clamped = Math.max(0, Math.min(100, Number(value || 0)));
  const barColor = color || (clamped >= 90 ? 'bg-red-500' : clamped >= 70 ? 'bg-orange-500' : clamped >= 40 ? 'bg-yellow-500' : 'bg-emerald-500');
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{clamped.toFixed(0)}%</div>
      </div>
      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
};

const RealtimeMonitor = ({
  deviceId,
  interfaces,
  chartType,
  setChartType,
  selectedTimeRange,
  setSelectedTimeRange,
  refreshInterval,
  setRefreshInterval,
  isRealtimeActive,
  chartData,
  snmpLoading,
  isLoadingTimeSeries,
  t,
  formatBandwidth
}) => {
  const latest = chartData?.[chartData.length - 1] || {};

  const areaData = useMemo(() => {
    return (chartData || []).map((d) => ({
      timestamp: d.timestamp,
      cpu: Number(d.cpu ?? d.metrics?.cpuUsage ?? 0),
      memory: Number(d.memory ?? d.metrics?.memoryUsage ?? 0),
      inBps: Number(d.bandwidthIn ?? d.metrics?.bandwidthIn ?? 0),
      outBps: Number(d.bandwidthOut ?? d.metrics?.bandwidthOut ?? 0)
    }));
  }, [chartData]);

  // Compute top interfaces by current utilization if interfaces prop contains speed or recent snapshot (fallback to name list)
  const topInterfaces = useMemo(() => {
    const list = (interfaces || []).slice(0, 5).map((it) => ({ name: it.name, status: it.status }));
    return list;
  }, [interfaces]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">{t?.('common.chart') || 'Chart'}</label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="input">
            <option value="usage">{t?.('monitoring.usage') || 'Usage'}</option>
            <option value="bandwidth">{t?.('monitoring.bandwidth') || 'Bandwidth'}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">{t?.('common.range') || 'Range'}</label>
          <select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value)} className="input">
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="6h">6h</option>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">{t?.('common.auto') || 'Auto'}</label>
          <select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} className="input">
            <option value={0}>Off</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>60s</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Progress label="CPU" value={latest.cpu ?? 0} />
        <Progress label="Memory" value={latest.memory ?? 0} />
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">In</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatBandwidth?.(latest.bandwidthIn || 0)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Out</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatBandwidth?.(latest.bandwidthOut || 0)}</div>
        </div>
      </div>

      {/* Top Interfaces & Ping RTT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold mb-2">Top Interfaces</div>
          <ul className="text-sm">
            {topInterfaces.map((it) => (
              <li key={it.name} className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="font-mono">{it.name}</span>
                <span className={`text-xs ${String(it.status).toLowerCase()==='up'?'text-green-600':'text-red-600'}`}>{String(it.status).toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold mb-2">Ping RTT (10m)</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Min: — • Avg: — • Max: — • Loss: —</div>
        </div>
      </div>

      {(snmpLoading || isLoadingTimeSeries) && (
        <div className="text-sm text-gray-500">Loading metrics...</div>
      )}
      {areaData?.length === 0 && !snmpLoading && !isLoadingTimeSeries && (
        <div className="text-sm text-gray-500">No data</div>
      )}

      {areaData?.length > 0 && (
        <div className="h-72 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
              <XAxis dataKey="timestamp" minTickGap={24} tick={{ fontSize: 12, fill: '#FFFFFF' }} />
              <YAxis tick={{ fontSize: 12, fill: '#FFFFFF' }} tickFormatter={(v) => (chartType === 'bandwidth' ? (formatBandwidth?.(v) || v) : `${v}%`)} width={80} />
              <Tooltip contentStyle={{ background: '#111827', color: '#FFFFFF', borderColor: '#374151' }} formatter={(v) => (chartType === 'bandwidth' ? (formatBandwidth?.(v) || v) : `${Number(v).toFixed(0)}%`)} labelFormatter={(l)=> new Date(l).toLocaleTimeString()} />
              <Legend wrapperStyle={{ color: '#FFFFFF' }} />
              {chartType === 'usage' ? (
                <>
                  <Area type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" fill="url(#gradCpu)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="memory" name="Memory" stroke="#10b981" fill="url(#gradMem)" strokeWidth={2} dot={false} />
                </>
              ) : (
                <>
                  <Area type="monotone" dataKey="inBps" name="In" stroke="#8b5cf6" fill="url(#gradIn)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="outBps" name="Out" stroke="#f59e0b" fill="url(#gradOut)" strokeWidth={2} dot={false} />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RealtimeMonitor;


