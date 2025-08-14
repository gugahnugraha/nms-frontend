import React from 'react';

const LiveInterfaceTable = ({ loading, error, interfaces = [], recentSnapshots = [] }) => {
  if (loading) return <div className="text-sm text-gray-500">Loading interfaces...</div>;
  if (error) return <div className="text-sm text-red-600">{String(error)}</div>;
  if (!interfaces.length) return <div className="text-sm text-gray-500">No interfaces</div>;

  return null; // hide table in favor of charts view
};

export default LiveInterfaceTable;


