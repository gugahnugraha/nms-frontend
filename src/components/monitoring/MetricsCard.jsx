import React from 'react';

const colorMap = {
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
};

const MetricsCard = ({ title, value, icon, color = 'blue', trend = null }) => {
  const colors = colorMap[color] || colorMap.blue;
  return (
    <div className={`rounded-xl p-5 border border-gray-200 dark:border-gray-700 ${colors}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
          {trend !== null && (
            <div className="text-xs text-gray-500 mt-1">{trend}%</div>
          )}
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
  );
};

export default MetricsCard;


