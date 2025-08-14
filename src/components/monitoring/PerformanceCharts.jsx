import React, { useMemo } from 'react';

const PerformanceCharts = ({ device, deviceData = [], timeRange, onTimeRangeChange }) => {
  const latest = useMemo(() => {
    return deviceData?.[deviceData.length - 1]?.metrics || {};
  }, [deviceData]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">Performance</div>
        <select value={timeRange} onChange={(e) => onTimeRangeChange?.(e.target.value)} className="input">
          <option value="1h">1h</option>
          <option value="6h">6h</option>
          <option value="24h">24h</option>
          <option value="7d">7d</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-500">CPU</div>
          <div className="text-2xl font-bold">{latest.cpu ?? latest.cpuUsage ?? 0}%</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-500">Memory</div>
          <div className="text-2xl font-bold">{latest.memory ?? latest.memoryUsage ?? 0}%</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-500">Bandwidth In</div>
          <div className="text-lg font-bold">{latest.bandwidthIn ?? 0}</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-500">Bandwidth Out</div>
          <div className="text-lg font-bold">{latest.bandwidthOut ?? 0}</div>
        </div>
      </div>
      {(!deviceData || deviceData.length === 0) && (
        <div className="text-sm text-gray-500 mt-4">No time-series data</div>
      )}
    </div>
  );
};

export default PerformanceCharts;


