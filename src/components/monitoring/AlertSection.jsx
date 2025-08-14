import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const AlertSection = ({ alerts = [] }) => {
  if (!alerts.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <div className="text-gray-600">No recent alerts</div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alerts</h3>
      <div className="space-y-2">
        {alerts.map((a) => (
          <div key={a._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">{a.title || 'Alert'}</div>
              <div className="text-sm text-gray-500">{a.message}</div>
            </div>
            <div className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertSection;


