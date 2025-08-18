import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDevices } from '../redux/slices/deviceSlice';
import Button from '../components/ui/Button';
import {
  ChartBarIcon,
  PrinterIcon,
  TableCellsIcon,
  ClockIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentChartBarIcon,
  ShareIcon,
  BookmarkIcon,
  EnvelopeIcon,
  CpuChipIcon,
  MemoryChipIcon,
  WifiIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { devices, loading: devicesLoading } = useSelector((state) => state.devices);
  const { user } = useSelector((state) => state.auth);
  
  // State variables
  const [reportType, setReportType] = useState('deviceStatus');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Report management state
  const [savedReports, setSavedReports] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [reportName, setReportName] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showSavedReportsDialog, setShowSavedReportsDialog] = useState(false);
  
  // Chart theming for light/dark
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const chartTextColor = isDark ? '#FFFFFF' : '#374151';
  const chartGridColor = isDark ? '#374151' : '#e5e7eb';
  
  // Report types with enhanced metadata
  const reportTypes = useMemo(() => [
    { 
      id: 'deviceStatus', 
      icon: ServerIcon, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'performance', 
      icon: CpuChipIcon, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    },
    { 
      id: 'availability', 
      icon: ClockIcon, 
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      borderColor: 'border-green-200'
    },
    { 
      id: 'incidents', 
      icon: ExclamationTriangleIcon, 
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100',
      borderColor: 'border-red-200'
    },
    { 
      id: 'inventory', 
      icon: TableCellsIcon, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200'
    }
  ], []);
  
  // Fetch devices on mount
  useEffect(() => {
    if (!devices.length) {
      dispatch(getDevices());
    }
  }, [dispatch, devices.length]);
  
  // Load saved reports from localStorage on mount
  useEffect(() => {
    const loadSavedReports = () => {
      try {
        const savedReportsJSON = localStorage.getItem('savedReports');
        if (savedReportsJSON) {
          setSavedReports(JSON.parse(savedReportsJSON));
        }
      } catch (error) {
        console.error('Error loading saved reports:', error);
      }
    };
    
    loadSavedReports();
  }, []);
  
  // Save current report
  const saveReport = useCallback(() => {
    if (!reportData) return;
    
    const newReport = {
      id: Date.now(),
      name: reportName || `${t(`reports.types.${reportType}.name`)} - ${new Date().toLocaleDateString()}`,
      type: reportType,
      dateRange,
      data: reportData,
      createdAt: new Date().toISOString()
    };
    
    const updatedReports = [...savedReports, newReport];
    setSavedReports(updatedReports);
    
    try {
      localStorage.setItem('savedReports', JSON.stringify(updatedReports));
      setShowSaveDialog(false);
      setReportName('');
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }, [reportData, reportName, reportType, savedReports, dateRange, t]);
  
  // Load a saved report
  const loadSavedReport = useCallback((report) => {
    setReportType(report.type);
    setDateRange(report.dateRange);
    setReportData(report.data);
    setShowSavedReportsDialog(false);
  }, []);
  
  // Delete a saved report
  const deleteSavedReport = useCallback((id) => {
    const updatedReports = savedReports.filter(report => report.id !== id);
    setSavedReports(updatedReports);
    
    try {
      localStorage.setItem('savedReports', JSON.stringify(updatedReports));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  }, [savedReports]);
  
  // Share report via email (mock function)
  const shareReport = useCallback(() => {
    console.log(`Sharing report to: ${shareEmail}`);
    setShowShareDialog(false);
    setShareEmail('');
  }, [shareEmail]);
  
  // Generate report based on report type
  const generateReport = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      // Sample device data
      const exampleDevices = [
        { _id: 'db1', id: 'db1', name: t('topology.deviceNames.dbRekamKTP'), ip: '10.32.4.208', type: 'server', status: 'down', cpu: '85%', memory: '72%', uptime: '99.2%', incidents: 3, location: t('topology.locationNames.serverRoom1') },
        { _id: 'db2', id: 'db2', name: t('topology.deviceNames.dbCetakKTP'), ip: '10.32.4.179', type: 'server', status: 'down', cpu: '62%', memory: '58%', uptime: '100%', incidents: 0, location: t('topology.locationNames.serverRoom1') },
        { _id: 'siak1', id: 'siak1', name: t('topology.deviceNames.siak135'), ip: '10.32.4.135', type: 'server', status: 'down', cpu: '34%', memory: '45%', uptime: '95.8%', incidents: 2, location: t('topology.locationNames.serverRoom2') },
        { _id: 'siak2', id: 'siak2', name: t('topology.deviceNames.siak133'), ip: '10.32.4.133', type: 'server', status: 'down', cpu: '28%', memory: '32%', uptime: '99.5%', incidents: 1, location: t('topology.locationNames.serverRoom2') },
        { _id: 'kw1', id: 'kw1', name: t('topology.deviceNames.kutawaringin'), ip: '172.16.99.46', type: 'router', status: 'down', cpu: '42%', memory: '25%', uptime: '97.5%', incidents: 4, location: t('topology.branchOffice') },
        { _id: 'cg1', id: 'cg1', name: t('topology.deviceNames.cangkuang'), ip: '172.16.99.44', type: 'router', status: 'down', cpu: '38%', memory: '22%', uptime: '98.4%', incidents: 2, location: t('topology.branchOffice') },
        { _id: 'rb1', id: 'rb1', name: t('topology.deviceNames.rancabali'), ip: '172.16.99.40', type: 'router', status: 'down', cpu: '22%', memory: '18%', uptime: '99.9%', incidents: 0, location: t('topology.remoteSite') }
      ];
      
      const reportDevices = devices.length > 0 
        ? devices.map(d => ({
            id: d._id || d.id,
            name: d.name,
            ip: d.ip,
            type: d.type,
            status: d.status?.toLowerCase() || 'down',
            cpu: `${Math.floor(Math.random() * 70) + 20}%`,
            memory: `${Math.floor(Math.random() * 60) + 15}%`,
            uptime: `${(97 + Math.random() * 3).toFixed(1)}%`,
            incidents: Math.floor(Math.random() * 5),
            location: d.location || 'Data Center'
          }))
        : exampleDevices;
      
      // Availability statistics
      const availabilityStats = {
        uptimeNow: '97.5%',
        downtimeNow: '5.0%',
        onlineDevices: 19,
        offlineDevices: 1,
        totalMonitored: 20,
        monitoredBy: 'SNMP',
        peakUptime: '100.0%',
        peakDowntime: '100.0%',
        avgUptime: '97.6%',
        downtimeEvents: 35
      };

      // Incident samples
      const incidentSamples = [
        { id: 1, device: t('topology.deviceNames.dbRekamKTP'), type: t('reports.incidentTypes.highCpu'), severity: t('alerts.severity.critical'), time: '2025-08-13 14:32:45', duration: '24m', status: t('reports.incidentStatus.resolved') },
        { id: 2, device: t('topology.deviceNames.siak135'), type: t('reports.incidentTypes.deviceDown'), severity: t('alerts.severity.critical'), time: '2025-08-13 08:17:22', duration: '1h 12m', status: t('reports.incidentStatus.resolved') },
        { id: 3, device: t('topology.deviceNames.kutawaringin'), type: t('reports.incidentTypes.highMemory'), severity: t('alerts.severity.warning'), time: '2025-08-14 06:45:11', duration: '15m', status: t('reports.incidentStatus.active') },
        { id: 4, device: t('topology.deviceNames.cangkuang'), type: t('reports.incidentTypes.networkIssue'), severity: t('alerts.severity.warning'), time: '2025-08-14 05:22:33', duration: '32m', status: t('reports.incidentStatus.resolved') },
        { id: 5, device: t('topology.deviceNames.siak135'), type: t('reports.incidentTypes.highCpu'), severity: t('alerts.severity.warning'), time: '2025-08-12 19:11:05', duration: '47m', status: t('reports.incidentStatus.resolved') }
      ];

      // Device types and locations
      const deviceTypes = [
        { type: 'server', count: 4 },
        { type: 'router', count: 3 },
        { type: 'switch', count: 5 },
        { type: 'firewall', count: 1 }
      ];

      const deviceLocations = [
        { location: t('topology.locationNames.serverRoom1'), count: 2 },
        { location: t('topology.locationNames.serverRoom2'), count: 2 },
        { location: t('topology.branchOffice'), count: 2 },
        { location: t('topology.remoteSite'), count: 1 },
        { location: 'Data Center', count: 6 }
      ];
      
      // Generate report data based on type
      let reportResult = {};
      
      switch(reportType) {
        case 'deviceStatus':
          const deviceCount = reportDevices.length;
          const upDevices = 28;
          const downDevices = 8;
          const upPercentage = Math.round((upDevices / (upDevices + downDevices)) * 100);
          
          reportResult = {
            title: t('reports.types.deviceStatus.name'),
            generatedAt: new Date().toISOString(),
            reportType: 'deviceStatus',
            summary: {
              total: upDevices + downDevices,
              up: upDevices,
              down: downDevices,
              upPercentage: `${upPercentage}%`
            },
            table: reportDevices,
            tableColumns: ['name', 'ip', 'type', 'status']
          };
          break;
          
        case 'performance':
          reportResult = {
            title: t('reports.types.performance.name'),
            generatedAt: new Date().toISOString(),
            reportType: 'performance',
            summary: {
              avgCpu: '42%',
              avgMemory: '37%',
              highCpuDevices: '3',
              highMemoryDevices: '2'
            },
            charts: [
              { type: 'cpu', title: t('reports.charts.cpuUsage') },
              { type: 'memory', title: t('reports.charts.memoryUsage') }
            ],
            table: reportDevices,
            tableColumns: ['name', 'ip', 'type', 'cpu', 'memory']
          };
          break;
          
        case 'availability':
          reportResult = {
            title: t('reports.types.availability.name'),
            generatedAt: new Date().toISOString(),
            reportType: 'availability',
            summary: {
              uptimeNow: availabilityStats.uptimeNow,
              downtimeNow: availabilityStats.downtimeNow,
              onlineDevices: availabilityStats.onlineDevices,
              offlineDevices: availabilityStats.offlineDevices,
              totalMonitored: availabilityStats.totalMonitored,
              monitoredBy: availabilityStats.monitoredBy,
              peakUptime: availabilityStats.peakUptime,
              peakDowntime: availabilityStats.peakDowntime,
              avgUptime: availabilityStats.avgUptime,
              downtimeEvents: availabilityStats.downtimeEvents
            },
            charts: [
              { type: 'uptime', title: 'Uptime & Downtime 24 Jam' }
            ],
            table: reportDevices,
            tableColumns: ['name', 'ip', 'type', 'uptime', 'incidents']
          };
          break;
          
        case 'incidents':
          reportResult = {
            title: t('reports.types.incidents.name'),
            generatedAt: new Date().toISOString(),
            reportType: 'incidents',
            summary: {
              total: '23',
              critical: '5',
              warning: '11',
              info: '7'
            },
            charts: [
              { type: 'incidentsBySeverity', title: t('reports.charts.incidentsBySeverity') },
              { type: 'incidentsByType', title: t('reports.charts.incidentsByType') }
            ],
            table: incidentSamples,
            tableColumns: ['device', 'type', 'severity', 'time', 'duration', 'status']
          };
          break;
          
        case 'inventory':
          reportResult = {
            title: t('reports.types.inventory.name'),
            generatedAt: new Date().toISOString(),
            reportType: 'inventory',
            summary: {
              total: reportDevices.length,
              types: deviceTypes.length,
              locations: deviceLocations.length
            },
            typeDistribution: deviceTypes,
            locationDistribution: deviceLocations,
            charts: [
              { type: 'typeDistribution', title: t('reports.charts.typeDistribution') }
            ],
            table: reportDevices,
            tableColumns: ['name', 'ip', 'type', 'location']
          };
          break;
          
        default:
          reportResult = {
            title: t(`reports.types.${reportType}.name`) || 'Laporan',
            generatedAt: new Date().toISOString(),
            reportType: reportType,
            summary: {},
            table: reportDevices,
            tableColumns: ['name', 'ip', 'type', 'status']
          };
      }
      
      setReportData(reportResult);
      setIsGenerating(false);
    }, 1500);
  }, [devices, reportType, t]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl shadow-2xl mb-8">
            <DocumentChartBarIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-gray-700 dark:from-white dark:via-primary-400 dark:to-gray-300 bg-clip-text text-transparent mb-6">
          {t('reports.title')}
        </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {t('reports.description')}
        </p>
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Panel */}
          <motion.div 
            className="xl:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 p-8 backdrop-blur-xl">
              {/* Report Types Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
              {t('reports.reportTypes')}
            </label>
                <div className="grid grid-cols-2 gap-3">
                  {reportTypes.map((type, index) => (
                    <motion.button
                  key={type.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                  onClick={() => setReportType(type.id)}
                      className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                    reportType === type.id
                          ? `bg-gradient-to-br ${type.color} text-white shadow-xl shadow-primary-500/25 transform scale-105`
                          : `bg-gradient-to-br ${type.bgColor} dark:from-gray-700/50 dark:to-gray-800/50 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-105`
                      }`}
                    >
                      <type.icon className={`w-8 h-8 mb-2 transition-transform duration-300 ${
                        reportType === type.id ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <span className="text-xs font-semibold text-center leading-tight">
                    {t(`reports.types.${type.id}.name`)}
                  </span>
                      {reportType === type.id && (
                        <motion.div
                          layoutId="activeReportType"
                          className={`absolute inset-0 bg-gradient-to-br ${type.color} rounded-2xl -z-10`}
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.button>
              ))}
            </div>
          </div>
          
              {/* Enhanced Date Range Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
              {t('reports.dateRange')}
            </label>
                <div className="space-y-3">
              <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('reports.startDate')}
                </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                    </div>
              </div>
              <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('reports.endDate')}
                </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                    </div>
              </div>
            </div>
          </div>
          
              {/* Enhanced Export Format Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
              {t('reports.exportFormat')}
            </label>
                <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={PrinterIcon}
                disabled={!reportData || isExporting}
                    className="h-12 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              >
                {isExporting ? t('common.loading') : t('reports.exportFormats.pdf')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={DocumentArrowDownIcon}
                disabled={!reportData || isExporting}
                    className="h-12 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              >
                {isExporting ? t('common.loading') : t('reports.exportFormats.excel')}
              </Button>
            </div>
          </div>
          
              {/* Enhanced Actions Section */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
              {t('reports.actions')}
            </label>
                <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                icon={BookmarkIcon}
                onClick={() => setShowSaveDialog(true)}
                disabled={!reportData}
                    className="w-full h-12 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 justify-start px-4"
              >
                {t('reports.save')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ShareIcon}
                onClick={() => setShowShareDialog(true)}
                disabled={!reportData}
                    className="w-full h-12 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 justify-start px-4"
              >
                {t('reports.share')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={DocumentChartBarIcon}
                onClick={() => setShowSavedReportsDialog(true)}
                    className="w-full h-12 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white transition-all duration-200 justify-start px-4"
              >
                {t('reports.savedReports')}
              </Button>
            </div>
          </div>
          
              {/* Enhanced Generate Report Button */}
              <div className="pt-4">
            <Button
              onClick={generateReport}
              disabled={isGenerating || devicesLoading}
                  className="w-full h-16 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 text-lg font-bold"
            >
              {isGenerating ? (
                    <ArrowPathIcon className="w-7 h-7 animate-spin" />
              ) : (
                    <DocumentChartBarIcon className="w-7 h-7" />
              )}
              {isGenerating ? t('reports.generating') : t('reports.generateReport')}
            </Button>
          </div>
        </div>
          </motion.div>

          {/* Enhanced Main Content Area */}
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 p-8 backdrop-blur-xl">
          {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-2xl">
                      <ArrowPathIcon className="w-12 h-12 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                {t('reports.generating')}
              </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md text-center leading-relaxed text-lg">
                {t('reports.generationDescription')}
              </p>
                  <div className="mt-8 w-80 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
            </div>
          ) : reportData ? (
            <div>
                  {/* Enhanced Report Header */}
                  <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-xl mb-6">
                      <DocumentChartBarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                  {reportData.title}
                </h2>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-full shadow-lg">
                      <ClockIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-base text-gray-600 dark:text-gray-400 font-medium">
                  {t('reports.generatedAt')}: {new Date(reportData.generatedAt).toLocaleString()}
                      </span>
                    </div>
              </div>
              
                  {/* Enhanced Availability Report Section */}
              {reportData.reportType === 'availability' ? (
                    <div className="mb-10">
                      {/* Current Status Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <motion.div 
                          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-3xl border border-green-200/50 dark:border-green-700/50 shadow-xl"
                          whileHover={{ scale: 1.02, y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                              <ClockIcon className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-3">
                        {reportData.summary.uptimeNow || "97.5%"}
                      </div>
                            <div className="text-xl font-bold text-green-700 dark:text-green-300 mb-3">
                        {t('reports.uptimeNow')}
                      </div>
                            <div className="text-base text-green-600 dark:text-green-400">
                        {reportData.summary.onlineDevices || "19"} {t('reports.devicesOnline')}
                      </div>
                    </div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-8 rounded-3xl border border-red-200/50 dark:border-red-700/50 shadow-xl"
                          whileHover={{ scale: 1.02, y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                              <ExclamationTriangleIcon className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-3">
                        {reportData.summary.downtimeNow || "5.0%"}
                      </div>
                            <div className="text-xl font-bold text-red-700 dark:text-red-300 mb-3">
                        {t('reports.downtimeNow')}
                      </div>
                            <div className="text-base text-red-600 dark:text-red-400">
                        {reportData.summary.offlineDevices || "1"} {t('reports.devicesOffline')}
                      </div>
                    </div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-3xl border border-blue-200/50 dark:border-blue-700/50 shadow-xl"
                          whileHover={{ scale: 1.02, y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                              <ServerIcon className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                        {reportData.summary.totalMonitored || "20"}
                      </div>
                            <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-3">
                        {t('reports.monitoredDevices')}
                      </div>
                            <div className="text-base text-blue-600 dark:text-blue-400">
                        {t('reports.monitoredBy')} {reportData.summary.monitoredBy || "SNMP"}
                      </div>
                    </div>
                        </motion.div>
                  </div>
                  
                      {/* Historical Summary */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-3xl p-8 border border-gray-200/50 dark:border-gray-600/50 shadow-xl">
                        <h5 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                          {t('reports.historicalSummary')}
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <motion.div 
                            className="bg-white dark:bg-gray-700 p-6 rounded-2xl text-center shadow-lg border border-gray-200/50 dark:border-gray-600/50"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {reportData.summary.peakUptime || "100.0%"}
                      </div>
                            <div className="text-base font-semibold text-green-700 dark:text-green-300">
                        {t('reports.peakUptime')}
                      </div>
                          </motion.div>
                          <motion.div 
                            className="bg-white dark:bg-gray-700 p-6 rounded-2xl text-center shadow-lg border border-gray-200/50 dark:border-gray-600/50"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                        {reportData.summary.peakDowntime || "100.0%"}
                      </div>
                            <div className="text-base font-semibold text-red-700 dark:text-red-300">
                        {t('reports.peakDowntime')}
                      </div>
                          </motion.div>
                          <motion.div 
                            className="bg-white dark:bg-gray-700 p-6 rounded-2xl text-center shadow-lg border border-gray-200/50 dark:border-gray-600/50"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {reportData.summary.avgUptime || "97.6%"}
                      </div>
                            <div className="text-base font-semibold text-blue-700 dark:text-blue-300">
                        {t('reports.avgUptime')}
                      </div>
                          </motion.div>
                          <motion.div 
                            className="bg-white dark:bg-gray-700 p-6 rounded-2xl text-center shadow-lg border border-gray-200/50 dark:border-gray-600/50"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        {reportData.summary.downtimeEvents || "35"}
                      </div>
                            <div className="text-base font-semibold text-orange-700 dark:text-orange-300">
                        {t('reports.downtimeEvents')}
                      </div>
                          </motion.div>
                    </div>
                  </div>
                </div>
              ) : (
                    <div className="mb-10">
                      <h5 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        {t('reports.summary')}
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {Object.keys(reportData.summary).map((key, index) => (
                          <motion.div 
                            key={key} 
                            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                          >
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <ChartBarIcon className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        {t(`reports.summaryLabels.${key}`)}
                      </h3>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {reportData.summary[key]}
                      </p>
                    </div>
                          </motion.div>
                  ))}
                      </div>
                </div>
              )}
              
                  {/* Enhanced Data Table */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-3xl p-8 border border-gray-200/50 dark:border-gray-600/50 shadow-xl">
                    <h5 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                      {t('reports.details')}
                    </h5>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <tr>
                            {/* Dynamic columns based on report type */}
                      {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('name') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.device')}
                        </th>
                      )}
                      {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('ip') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.ip')}
                        </th>
                      )}
                      {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('type') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.type')}
                        </th>
                      )}
                      {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('status') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.status')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('cpu') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.cpu')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('memory') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.memory')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('uptime') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.uptime')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('incidents') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.incidents')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('location') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.location')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('device') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.device')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('severity') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.severity')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('time') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.time')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('duration') && (
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('reports.table.duration')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-800">
                          {reportData.table.slice(0, 10).map((item, index) => (
                            <motion.tr 
                              key={item.id || item.name}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors duration-200"
                            >
                              {/* Dynamic cells based on report type */}
                        {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('name') && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                            {item.name}
                          </td>
                        )}
                        {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('ip') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.ip}
                          </td>
                        )}
                        {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('type') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.type}
                          </td>
                        )}
                        {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('status') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === 'up' 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {item.status === 'up' ? t('common.up') : t('common.down')}
                            </span>
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('cpu') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2 dark:bg-gray-700">
                                    <div className={`h-3 rounded-full transition-all duration-300 ${parseInt(item.cpu) > 80 ? 'bg-red-600' : parseInt(item.cpu) > 60 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: item.cpu }}></div>
                            </div>
                                  <span className="text-xs font-medium">{item.cpu}</span>
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('memory') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2 dark:bg-gray-700">
                                    <div className={`h-3 rounded-full transition-all duration-300 ${parseInt(item.memory) > 80 ? 'bg-red-600' : parseInt(item.memory) > 60 ? 'bg-yellow-400' : 'bg-blue-500'}`} style={{ width: item.memory }}></div>
                            </div>
                                  <span className="text-xs font-medium">{item.memory}</span>
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('uptime') && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                            {item.uptime}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('incidents') && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                            {item.incidents}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('location') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.location}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('device') && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                            {item.device}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('severity') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                              item.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                              {item.severity}
                            </span>
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('time') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.time}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('duration') && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                            {item.duration}
                          </td>
                        )}
                            </motion.tr>
                    ))}
                  </tbody>
                </table>
                    </div>
              </div>
            </div>
          ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                    <DocumentChartBarIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('reports.noData')}
              </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md text-center leading-relaxed text-lg mb-8">
                {t('reports.description')}
              </p>
                  <Button
                    onClick={generateReport}
                    disabled={isGenerating || devicesLoading}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg font-bold"
                  >
                    {t('reports.generateReport')}
                  </Button>
            </div>
          )}
        </div>
          </motion.div>
      </div>
      
      {/* Save Report Dialog */}
        <AnimatePresence>
      {showSaveDialog && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-200/50 dark:border-gray-700/50"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                    <BookmarkIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports.saveDialog.title')}</h3>
            </div>
            
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('reports.saveDialog.reportName')}
              </label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder={t('reports.saveDialog.placeholder')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && saveReport()}
              />
            </div>
            
                <div className="flex items-center gap-4">
              <Button
                onClick={saveReport}
                    className="flex-1 h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('reports.save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setReportName('');
                }}
                    className="flex-1 h-12 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              >
                {t('common.cancel')}
              </Button>
            </div>
              </motion.div>
            </motion.div>
      )}
        </AnimatePresence>
      
      {/* Share Report Dialog */}
        <AnimatePresence>
      {showShareDialog && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-200/50 dark:border-gray-700/50"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                    <ShareIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports.shareDialog.title')}</h3>
            </div>
            
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('reports.shareDialog.email')}
              </label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder={t('reports.shareDialog.emailPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="font-medium">{t('reports.types.' + reportType + '.name')}</span>
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold">
                  {dateRange.start} - {dateRange.end}
                </span>
              </div>
              
              <Button
                icon={EnvelopeIcon}
                onClick={shareReport}
                    className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('reports.shareDialog.send')}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareDialog(false);
                  setShareEmail('');
                }}
                    className="w-full h-12 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              >
                {t('common.cancel')}
              </Button>
            </div>
              </motion.div>
            </motion.div>
      )}
        </AnimatePresence>
      
      {/* Saved Reports Dialog */}
        <AnimatePresence>
      {showSavedReportsDialog && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-5xl w-full mx-4 max-h-[85vh] flex flex-col border border-gray-200/50 dark:border-gray-700/50"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                      <DocumentChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports.savedReportsDialog.title')}</h3>
              </div>
              <button 
                onClick={() => setShowSavedReportsDialog(false)}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
                <div className="overflow-y-auto flex-1 -mx-8 px-8">
              {savedReports.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <DocumentChartBarIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">{t('reports.savedReportsDialog.empty')}</p>
                </div>
              ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedReports.map((report, index) => (
                        <motion.div
                      key={report.id}
                          className="bg-white dark:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate text-lg" title={report.name}>
                          {report.name}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(t('reports.savedReportsDialog.confirmDelete'))) {
                              deleteSavedReport(report.id);
                            }
                          }}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-lg flex items-center justify-center transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarIcon className="w-4 h-4" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                            <div className="mt-2">
                              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded-lg text-xs font-semibold">
                            {t('reports.types.' + report.type + '.name')}
                          </span>
                        </div>
                      </div>
                      
                          <div className="flex mt-4">
                        <Button
                              size="sm"
                          variant="outline"
                          icon={EyeIcon}
                          onClick={() => loadSavedReport(report)}
                              className="flex-1 h-10 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                        >
                          {t('reports.savedReportsDialog.load')}
                        </Button>
                      </div>
                        </motion.div>
                  ))}
                </div>
              )}
            </div>
            
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowSavedReportsDialog(false)}
                    className="w-full h-12 rounded-xl border-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              >
                {t('common.close')}
              </Button>
            </div>
              </motion.div>
            </motion.div>
      )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reports;
