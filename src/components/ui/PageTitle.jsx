import React from 'react';

const PageTitle = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;