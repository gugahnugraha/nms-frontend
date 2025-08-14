import React from 'react';

const DeviceList = ({ devices = [], selectedDevice, onSelectDevice, deviceStatuses = {} }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">Devices</div>
      <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
        {devices.map((d) => {
          const isSelected = selectedDevice?._id === d._id;
          const status = (deviceStatuses[d._id]?.status || d.status || '').toUpperCase();
          return (
            <button
              key={d._id}
              onClick={() => onSelectDevice?.(d)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.ip}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  status === 'UP' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {status || 'N/A'}
                </span>
              </div>
            </button>
          );
        })}
        {!devices.length && <div className="text-sm text-gray-500">No devices</div>}
      </div>
    </div>
  );
};

export default DeviceList;


