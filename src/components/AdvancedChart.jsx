import React, { useState, useMemo, useCallback, memo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, ComposedChart, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

/**
 * AdvancedChart - A comprehensive React chart component built with Recharts
 * 
 * @param {string} type - Chart type: 'area', 'line', 'bar', 'pie', 'scatter', 'radar', 'composed', 'heatmap', 'candlestick', 'funnel', 'treemap'
 * @param {Array} data - Chart data array
 * @param {number} height - Chart height in pixels
 * @param {boolean} loading - Loading state
 * @param {string|null} error - Error message
 * @param {Object} config - Chart configuration object
 * @param {string} className - Additional CSS classes
 * @param {Function} onDataPointClick - Callback for data point clicks
 * @param {boolean} enableAnimations - Enable chart animations
 * @param {boolean} showGrid - Show chart grid
 * @param {boolean} showLegend - Show chart legend
 * @param {boolean} showTooltip - Show tooltips
 * @param {boolean} enableZoom - Enable zoom functionality
 * @param {boolean} enablePan - Enable pan functionality
 * @param {boolean} enableResponsive - Enable responsive container
 * @param {number} aspect - Chart aspect ratio
 * @param {Function} onChartLoad - Callback when chart loads
 * @param {boolean} enableTypeSelector - Enable chart type selector dropdown
 * @param {Function} onTypeChange - Callback when chart type changes
 */

// Memoized Custom Tooltip for better performance
const CustomTooltip = memo(({ active, payload, label, formatter, labelFormatter, chartType = 'default', additionalInfo = null }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm z-50 max-w-xs">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}:</span>
              <span className="text-sm" style={{ color: entry.color }}>
                {formatter ? formatter(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
        {additionalInfo && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {additionalInfo}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
});

// Memoized Loading Skeleton
const LoadingSkeleton = memo(({ height = 300, className = "" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} style={{ height }}>
    <div className="h-full flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
    </div>
  </div>
));

// Memoized Error Display
const ErrorDisplay = memo(({ error, height = 300, className = "", onRetry = null }) => (
  <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`} style={{ height }}>
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="text-red-600 dark:text-red-400 text-center">
        <div className="font-medium">Chart Error</div>
        <div className="text-sm">{error}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
));

// Memoized No Data Display
const NoDataDisplay = memo(({ height = 300, className = "", message = "No Data Available" }) => (
  <div className={`bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`} style={{ height }}>
    <div className="h-full flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400 text-center">
        <div className="font-medium">{message}</div>
        <div className="text-sm">Select a different time range or check your data source</div>
      </div>
    </div>
  </div>
));

const AdvancedChart = memo(({ 
  type = 'area',
  data = [],
  height = 300,
  loading = false,
  error = null,
  config = {},
  className = "",
  onDataPointClick = null,
  enableAnimations = true,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  enableZoom = false,
  enablePan = false,
  enableResponsive = true,
  aspect = 2,
  onChartLoad = null,
  enableTypeSelector = false,
  onTypeChange = null
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  const [retryCount, setRetryCount] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const [annotations, setAnnotations] = useState([]);

  // Data validation function
  const validateData = useCallback((chartData) => {
    if (!Array.isArray(chartData)) return false;
    if (chartData.length === 0) return false;
    
    // Check if data has required properties based on chart type
    switch (type) {
      case 'area':
      case 'line':
        return chartData.every(item => item.timestamp !== undefined);
      case 'bar':
        return chartData.every(item => item.name !== undefined);
      case 'pie':
        return chartData.every(item => item.name !== undefined && item.value !== undefined);
      case 'scatter':
        return chartData.every(item => item.x !== undefined && item.y !== undefined);
      case 'radar':
        return chartData.every(item => item.subject !== undefined);
      case 'heatmap':
        return chartData.every(item => item.x !== undefined && item.y !== undefined);
      case 'candlestick':
        return chartData.every(item => 
          item.date !== undefined && 
          item.open !== undefined && 
          item.high !== undefined && 
          item.low !== undefined && 
          item.close !== undefined
        );
      case 'funnel':
        return chartData.every(item => item.name !== undefined && item.value !== undefined);
      case 'treemap':
        return chartData.every(item => item.name !== undefined && item.value !== undefined);
      default:
        return true;
    }
  }, [type]);

  // Memoized chart configuration for better performance
  const chartConfig = useMemo(() => {
    const themes = {
      light: {
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'],
        gridColor: '#e5e7eb',
        textColor: '#374151',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb'
      },
      dark: {
        colors: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee', '#f472b6', '#a3e635'],
        gridColor: '#374151',
        textColor: '#d1d5db',
        backgroundColor: '#1f2937',
        borderColor: '#374151'
      }
    };

    const currentTheme = themes.dark; // You can make this configurable

    return {
      colors: currentTheme.colors,
      gridColor: currentTheme.gridColor,
      textColor: currentTheme.textColor,
      backgroundColor: currentTheme.backgroundColor,
      borderColor: currentTheme.borderColor,
      animationDuration: 300,
      ...config
    };
  }, [config]);

  // Memoized common chart props
  const commonProps = useMemo(() => ({
    data: processedData,
    margin: { top: 10, right: 20, left: 0, bottom: 0 },
    ...(enableAnimations && { animationDuration: chartConfig.animationDuration }),
    ...(enableZoom && { zoom: true }),
    ...(enablePan && { pan: true })
  }), [processedData, enableAnimations, chartConfig.animationDuration, enableZoom, enablePan]);

  // Memoized axis configuration
  const axisConfig = useMemo(() => ({
    tick: { fontSize: 12, fill: chartConfig.textColor },
    axisLine: { stroke: chartConfig.gridColor },
    tickLine: { stroke: chartConfig.gridColor }
  }), [chartConfig.textColor, chartConfig.gridColor]);

  // Handle data point click
  const handleDataPointClick = useCallback((data, index) => {
    if (onDataPointClick) {
      onDataPointClick(data, index);
    }
    setSelectedDataPoint(data);
  }, [onDataPointClick]);

  // Handle mouse events
  const handleMouseEnter = useCallback((index) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // Handle chart load
  const handleChartLoad = useCallback(() => {
    if (onChartLoad) {
      onChartLoad();
    }
  }, [onChartLoad]);

  // Performance monitoring
  const measureRenderTime = useCallback(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };
  }, []);

  // Export chart data as CSV
  const exportChartData = useCallback(() => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `chart-data-${type}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, type]);

  // Debounced resize handler
  const debouncedResize = useCallback(
    debounce((width, height) => {
      setChartDimensions({ width, height });
    }, 150),
    []
  );

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Add annotation
  const addAnnotation = useCallback((text, x, y) => {
    setAnnotations(prev => [...prev, { id: Date.now(), text, x, y }]);
  }, []);

  // Retry handler
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    // You can add additional retry logic here
  }, []);

  // Data processing utilities
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort data by timestamp if available
    if (data[0].timestamp) {
      return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    
    // Sort data by name if available
    if (data[0].name) {
      return [...data].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return data;
  }, [data]);

  // Early returns for loading, error, and no data states
  if (loading) {
    return <LoadingSkeleton height={height} className={className} />;
  }

  if (error) {
    return <ErrorDisplay error={error} height={height} className={className} onRetry={handleRetry} />;
  }

  if (!data || data.length === 0 || !validateData(data)) {
    return <NoDataDisplay height={height} className={className} />;
  }

  // Memoized chart rendering function
  const renderChart = useCallback(() => {
    const stopMeasure = measureRenderTime();
    
    const chartProps = {
      ...commonProps,
      onLoad: () => {
        handleChartLoad();
        stopMeasure();
      }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            {/* SVG Definitions for gradients */}
            <defs>
              {config.areas?.map((area, index) => (
                <linearGradient key={`gradient${index + 1}`} id={`gradient${index + 1}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors[index % chartConfig.colors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartConfig.colors[index % chartConfig.colors.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis 
              dataKey="timestamp" 
              {...axisConfig}
              tickFormatter={config.xAxisFormatter}
            />
            <YAxis 
              {...axisConfig}
              tickFormatter={config.yAxisFormatter}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip formatter={config.tooltipFormatter} labelFormatter={config.labelFormatter} />}
              />
            )}
            {showLegend && <Legend />}
            {config.areas?.map((area, index) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                name={area.name}
                stroke={chartConfig.colors[index % chartConfig.colors.length]}
                fill={`url(#gradient${index + 1})`}
                strokeWidth={2}
                dot={false}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={handleDataPointClick}
                className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
              />
            ))}
          </AreaChart>
        );

      case 'line':
        return (
          <LineChart {...chartProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis 
              dataKey="timestamp" 
              {...axisConfig}
              tickFormatter={config.xAxisFormatter}
            />
            <YAxis 
              {...axisConfig}
              tickFormatter={config.yAxisFormatter}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip formatter={config.tooltipFormatter} labelFormatter={config.labelFormatter} />}
              />
            )}
            {showLegend && <Legend />}
            {config.lines?.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={chartConfig.colors[index % chartConfig.colors.length]}
                strokeWidth={3}
                dot={false}
                strokeDasharray={line.dashed ? "5 5" : undefined}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={handleDataPointClick}
                className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...chartProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis 
              dataKey="name" 
              {...axisConfig}
              tickFormatter={config.xAxisFormatter}
            />
            <YAxis 
              {...axisConfig}
              tickFormatter={config.yAxisFormatter}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip formatter={config.tooltipFormatter} />}
              />
            )}
            {showLegend && <Legend />}
            {config.bars?.map((bar, index) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                fill={chartConfig.colors[index % chartConfig.colors.length]}
                radius={[4, 4, 0, 0]}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={handleDataPointClick}
                className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
              onClick={handleDataPointClick}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={chartConfig.colors[index % chartConfig.colors.length]}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...chartProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis 
              dataKey="x" 
              {...axisConfig}
              tickFormatter={config.xAxisFormatter}
            />
            <YAxis 
              {...axisConfig}
              tickFormatter={config.yAxisFormatter}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip formatter={config.tooltipFormatter} />}
              />
            )}
            {showLegend && <Legend />}
            {config.scatters?.map((scatter, index) => (
              <Scatter
                key={scatter.key}
                dataKey={scatter.key}
                name={scatter.name}
                fill={chartConfig.colors[index % chartConfig.colors.length]}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={handleDataPointClick}
                className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
              />
            ))}
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart {...chartProps}>
            <PolarGrid stroke={chartConfig.gridColor} />
            <PolarAngleAxis dataKey="subject" {...axisConfig} />
            <PolarRadiusAxis {...axisConfig} />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip formatter={config.tooltipFormatter} />}
              />
            )}
            {showLegend && <Legend />}
            {config.radars?.map((radar, index) => (
              <Radar
                key={radar.key}
                dataKey={radar.key}
                name={radar.name}
                stroke={chartConfig.colors[index % chartConfig.colors.length]}
                fill={chartConfig.colors[index % chartConfig.colors.length]}
                fillOpacity={0.3}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={handleDataPointClick}
                className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
              />
            ))}
          </RadarChart>
        );

      case 'composed':
        return (
          <ComposedChart {...chartProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis 
              dataKey="name" 
              {...axisConfig}
            />
            <YAxis 
              {...axisConfig}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {config.series?.map((series, index) => {
              if (series.type === 'bar') {
                return (
                  <Bar
                    key={series.key}
                    dataKey={series.key}
                    name={series.name}
                    fill={chartConfig.colors[index % chartConfig.colors.length]}
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleDataPointClick}
                    className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
                  />
                );
              }
              if (series.type === 'line') {
                return (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.name}
                    stroke={chartConfig.colors[index % chartConfig.colors.length]}
                    strokeWidth={2}
                    dot={false}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleDataPointClick}
                    className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
                  />
                );
              }
              if (series.type === 'area') {
                return (
                  <Area
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.name}
                    stroke={chartConfig.colors[index % chartConfig.colors.length]}
                    fill={chartConfig.colors[index % chartConfig.colors.length]}
                    fillOpacity={0.3}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleDataPointClick}
                    className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
                  />
                );
              }
              return null;
            })}
          </ComposedChart>
        );

      case 'heatmap':
        return (
          <ComposedChart {...chartProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis 
              dataKey="x" 
              {...axisConfig}
              type="category"
            />
            <YAxis 
              {...axisConfig}
              type="category"
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip formatter={config.tooltipFormatter} />}
              />
            )}
            {showLegend && <Legend />}
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || chartConfig.colors[index % chartConfig.colors.length]}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleDataPointClick(entry, index)}
                className={`transition-opacity cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : 'opacity-100'}`}
              />
            ))}
          </ComposedChart>
        );

      case 'candlestick':
        return (
          <ComposedChart {...chartProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis 
              dataKey="date" 
              {...axisConfig}
              type="category"
            />
            <YAxis 
              {...axisConfig}
              tickFormatter={config.yAxisFormatter}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip formatter={config.tooltipFormatter} />}
              />
            )}
            {showLegend && <Legend />}
            {data.map((entry, index) => (
              <g key={`candlestick-${index}`}>
                {/* High-Low line */}
                <line
                  x1={index * 20 + 10}
                  y1={entry.low}
                  x2={index * 20 + 10}
                  y2={entry.high}
                  stroke={chartConfig.textColor}
                  strokeWidth={1}
                />
                {/* Open-Close rectangle */}
                <rect
                  x={index * 20 + 5}
                  y={Math.min(entry.open, entry.close)}
                  width={10}
                  height={Math.abs(entry.close - entry.open)}
                  fill={entry.close >= entry.open ? chartConfig.colors[0] : chartConfig.colors[3]}
                  stroke={chartConfig.textColor}
                  strokeWidth={1}
                />
              </g>
            ))}
          </ComposedChart>
        );

      case 'funnel':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {data.map((entry, index) => {
              const width = 100 - (index * 15); // Decreasing width for funnel effect
              const height = 40;
              const y = index * (height + 10);
              
              return (
                <div
                  key={`funnel-${index}`}
                  className="relative flex items-center justify-center"
                  style={{
                    width: `${width}%`,
                    height: height,
                    backgroundColor: chartConfig.colors[index % chartConfig.colors.length],
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleDataPointClick(entry, index)}
                >
                  <span className="text-white font-medium text-sm">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case 'treemap':
        return (
          <div className="w-full h-full p-4">
            <div className="grid grid-cols-2 gap-2 h-full">
              {data.map((entry, index) => {
                const area = Math.sqrt(entry.value) * 10;
                const color = chartConfig.colors[index % chartConfig.colors.length];
                
                return (
                  <div
                    key={`treemap-${index}`}
                    className="relative flex items-center justify-center text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: color,
                      minHeight: `${area}px`
                    }}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleDataPointClick(entry, index)}
                  >
                    <div className="text-center">
                      <div className="font-bold">{entry.name}</div>
                      <div className="text-xs opacity-90">{entry.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return <div className="text-center text-gray-500 dark:text-gray-400 py-8">Unsupported chart type: {type}</div>;
    }
  }, [type, commonProps, chartConfig, config, axisConfig, showGrid, showTooltip, showLegend, hoveredIndex, handleMouseEnter, handleMouseLeave, handleDataPointClick]);

  return (
    <div 
      className={className} 
      style={{ height }}
      role="region"
      aria-label={`${type} chart`}
      aria-describedby={`chart-description-${type}`}
    >
      {/* Chart Controls */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Chart Type: <span className="font-medium capitalize">{type}</span>
          </div>
          {enableTypeSelector && (
            <select
              value={type}
              onChange={(e) => onTypeChange && onTypeChange(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="area">Area</option>
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
              <option value="scatter">Scatter</option>
              <option value="radar">Radar</option>
              <option value="composed">Composed</option>
              <option value="heatmap">Heatmap</option>
              <option value="candlestick">Candlestick</option>
              <option value="funnel">Funnel</option>
              <option value="treemap">Treemap</option>
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportChartData}
            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            title="Export data as CSV"
            aria-label="Export chart data as CSV file"
          >
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            title="Print chart"
            aria-label="Print chart"
          >
            Print
          </button>
        </div>
      </div>

      {/* Hidden description for screen readers */}
      <div id={`chart-description-${type}`} className="sr-only">
        {`${type} chart displaying ${data.length} data points`}
      </div>

      {/* Data Summary */}
      <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Data Points: {data.length}</span>
        {data.length > 0 && (
          <>
            <span className="mx-2">•</span>
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            {renderTime > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>Render Time: {renderTime.toFixed(2)}ms</span>
              </>
            )}
          </>
        )}
      </div>

      {enableResponsive ? (
        <ResponsiveContainer width="100%" height="calc(100% - 40px)" aspect={aspect}>
          {renderChart()}
        </ResponsiveContainer>
      ) : (
        <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
          {renderChart()}
        </div>
      )}
      
      {/* Selected Data Point Indicator */}
      {selectedDataPoint && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Selected: {JSON.stringify(selectedDataPoint)}
          </div>
        </div>
      )}

      {/* Annotations */}
      {annotations.length > 0 && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mb-1">
            Annotations ({annotations.length})
          </div>
          {annotations.map(annotation => (
            <div key={annotation.id} className="text-xs text-yellow-700 dark:text-yellow-300">
              • {annotation.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AdvancedChart.displayName = 'AdvancedChart';

export default AdvancedChart;
