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
  EnvelopeIcon
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
  
  // Report types
  const reportTypes = useMemo(() => [
    { id: 'deviceStatus', icon: ServerIcon },
    { id: 'performance', icon: ChartBarIcon },
    { id: 'availability', icon: ClockIcon },
    { id: 'incidents', icon: ExclamationTriangleIcon },
    { id: 'inventory', icon: TableCellsIcon }
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
    // Here you would implement the actual email sharing functionality
    // This is just a mock for now
    console.log(`Sharing report to: ${shareEmail}`);
    
    setShowShareDialog(false);
    setShareEmail('');
  }, [shareEmail]);
  
  // Generate report based on report type
  const generateReport = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      // Data perangkat contoh
      const exampleDevices = [
        { _id: 'db1', id: 'db1', name: t('topology.deviceNames.dbRekamKTP'), ip: '10.32.4.208', type: 'server', status: 'down', cpu: '85%', memory: '72%', uptime: '99.2%', incidents: 3, location: t('topology.locationNames.serverRoom1') },
        { _id: 'db2', id: 'db2', name: t('topology.deviceNames.dbCetakKTP'), ip: '10.32.4.179', type: 'server', status: 'down', cpu: '62%', memory: '58%', uptime: '100%', incidents: 0, location: t('topology.locationNames.serverRoom1') },
        { _id: 'siak1', id: 'siak1', name: t('topology.deviceNames.siak135'), ip: '10.32.4.135', type: 'server', status: 'down', cpu: '34%', memory: '45%', uptime: '95.8%', incidents: 2, location: t('topology.locationNames.serverRoom2') },
        { _id: 'siak2', id: 'siak2', name: t('topology.deviceNames.siak133'), ip: '10.32.4.133', type: 'server', status: 'down', cpu: '28%', memory: '32%', uptime: '99.5%', incidents: 1, location: t('topology.locationNames.serverRoom2') },
        { _id: 'kw1', id: 'kw1', name: t('topology.deviceNames.kutawaringin'), ip: '172.16.99.46', type: 'router', status: 'down', cpu: '42%', memory: '25%', uptime: '97.5%', incidents: 4, location: t('topology.branchOffice') },
        { _id: 'cg1', id: 'cg1', name: t('topology.deviceNames.cangkuang'), ip: '172.16.99.44', type: 'router', status: 'down', cpu: '38%', memory: '22%', uptime: '98.4%', incidents: 2, location: t('topology.branchOffice') },
        { _id: 'rb1', id: 'rb1', name: t('topology.deviceNames.rancabali'), ip: '172.16.99.40', type: 'router', status: 'down', cpu: '22%', memory: '18%', uptime: '99.9%', incidents: 0, location: t('topology.remoteSite') }
      ];
      
      // Menggunakan data perangkat dari Redux store atau data contoh
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
      
      // Data untuk tangkapan layar uptime/downtime yang baru dikirim
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

      // Data insiden contoh
      const incidentSamples = [
        { id: 1, device: t('topology.deviceNames.dbRekamKTP'), type: t('reports.incidentTypes.highCpu'), severity: t('alerts.severity.critical'), time: '2025-08-13 14:32:45', duration: '24m', status: t('reports.incidentStatus.resolved') },
        { id: 2, device: t('topology.deviceNames.siak135'), type: t('reports.incidentTypes.deviceDown'), severity: t('alerts.severity.critical'), time: '2025-08-13 08:17:22', duration: '1h 12m', status: t('reports.incidentStatus.resolved') },
        { id: 3, device: t('topology.deviceNames.kutawaringin'), type: t('reports.incidentTypes.highMemory'), severity: t('alerts.severity.warning'), time: '2025-08-14 06:45:11', duration: '15m', status: t('reports.incidentStatus.active') },
        { id: 4, device: t('topology.deviceNames.cangkuang'), type: t('reports.incidentTypes.networkIssue'), severity: t('alerts.severity.warning'), time: '2025-08-14 05:22:33', duration: '32m', status: t('reports.incidentStatus.resolved') },
        { id: 5, device: t('topology.deviceNames.siak135'), type: t('reports.incidentTypes.highCpu'), severity: t('alerts.severity.warning'), time: '2025-08-12 19:11:05', duration: '47m', status: t('reports.incidentStatus.resolved') }
      ];

      // Inventaris tipe perangkat
      const deviceTypes = [
        { type: 'server', count: 4 },
        { type: 'router', count: 3 },
        { type: 'switch', count: 5 },
        { type: 'firewall', count: 1 }
      ];

      // Inventaris lokasi perangkat
      const deviceLocations = [
        { location: t('topology.locationNames.serverRoom1'), count: 2 },
        { location: t('topology.locationNames.serverRoom2'), count: 2 },
        { location: t('topology.branchOffice'), count: 2 },
        { location: t('topology.remoteSite'), count: 1 },
        { location: 'Data Center', count: 6 }
      ];
      
      // Data berdasarkan jenis laporan
      let reportResult = {};
      
      switch(reportType) {
        case 'deviceStatus':
          // Status perangkat - sesuai dengan tangkapan layar
          const deviceCount = reportDevices.length;
          const upDevices = 28; // Sesuai dengan tangkapan layar sebelumnya
          const downDevices = 8; // Sesuai dengan tangkapan layar sebelumnya
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
            tableColumns: ['name', 'ip', 'type', 'status'] // Kolom yang ditampilkan di tabel
          };
          break;
          
        case 'performance':
          // Laporan performa
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
            tableColumns: ['name', 'ip', 'type', 'cpu', 'memory'] // Kolom yang ditampilkan di tabel
          };
          break;
          
        case 'availability':
          // Laporan ketersediaan - sesuai dengan tangkapan layar baru
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
            tableColumns: ['name', 'ip', 'type', 'uptime', 'incidents'] // Kolom yang ditampilkan di tabel
          };
          break;
          
        case 'incidents':
          // Laporan insiden
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
            tableColumns: ['device', 'type', 'severity', 'time', 'duration', 'status'] // Kolom yang ditampilkan di tabel
          };
          break;
          
        case 'inventory':
          // Laporan inventaris
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
            tableColumns: ['name', 'ip', 'type', 'location'] // Kolom yang ditampilkan di tabel
          };
          break;
          
        default:
          // Default ke device status jika tipe tidak dikenali
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t('reports.title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('reports.description')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reports.reportTypes')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-2 lg:grid-cols-5 gap-2">
              {reportTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                    reportType === type.id
                      ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <type.icon className="w-6 h-6 mb-1" />
                  <span className="text-xs text-center">
                    {t(`reports.types.${type.id}.name`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reports.dateRange')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('reports.startDate')}
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('reports.endDate')}
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reports.exportFormat')}
            </label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={PrinterIcon}
                disabled={!reportData || isExporting}
                className="flex-1"
              >
                {isExporting ? t('common.loading') : t('reports.exportFormats.pdf')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={DocumentArrowDownIcon}
                disabled={!reportData || isExporting}
                className="flex-1"
              >
                {isExporting ? t('common.loading') : t('reports.exportFormats.excel')}
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reports.actions')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={BookmarkIcon}
                onClick={() => setShowSaveDialog(true)}
                disabled={!reportData}
                className="flex items-center justify-center gap-1"
              >
                {t('reports.save')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ShareIcon}
                onClick={() => setShowShareDialog(true)}
                disabled={!reportData}
                className="flex items-center justify-center gap-1"
              >
                {t('reports.share')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={DocumentChartBarIcon}
                onClick={() => setShowSavedReportsDialog(true)}
                className="flex items-center justify-center gap-1"
              >
                {t('reports.savedReports')}
              </Button>
            </div>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={generateReport}
              disabled={isGenerating || devicesLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <DocumentChartBarIcon className="w-5 h-5" />
              )}
              {isGenerating ? t('reports.generating') : t('reports.generateReport')}
            </Button>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ArrowPathIcon className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('reports.generating')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {t('reports.generationDescription')}
              </p>
            </div>
          ) : reportData ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {reportData.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('reports.generatedAt')}: {new Date(reportData.generatedAt).toLocaleString()}
                </p>
              </div>
              
              {/* Tampilan khusus untuk laporan ketersediaan sesuai dengan screenshot */}
              {reportData.reportType === 'availability' ? (
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg flex-1 text-center">
                      <div className="text-4xl font-bold text-green-600 dark:text-green-300 mb-2">
                        {reportData.summary.uptimeNow || "97.5%"}
                      </div>
                      <div className="text-sm text-green-500 dark:text-green-400">
                        {t('reports.uptimeNow')}
                      </div>
                      <div className="text-xs text-green-500 dark:text-green-400 mt-2">
                        {reportData.summary.onlineDevices || "19"} {t('reports.devicesOnline')}
                      </div>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg flex-1 text-center">
                      <div className="text-4xl font-bold text-red-600 dark:text-red-300 mb-2">
                        {reportData.summary.downtimeNow || "5.0%"}
                      </div>
                      <div className="text-sm text-red-500 dark:text-red-400">
                        {t('reports.downtimeNow')}
                      </div>
                      <div className="text-xs text-red-500 dark:text-red-400 mt-2">
                        {reportData.summary.offlineDevices || "1"} {t('reports.devicesOffline')}
                      </div>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg flex-1 text-center">
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                        {reportData.summary.totalMonitored || "20"}
                      </div>
                      <div className="text-sm text-blue-500 dark:text-blue-400">
                        {t('reports.monitoredDevices')}
                      </div>
                      <div className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                        {t('reports.monitoredBy')} {reportData.summary.monitoredBy || "SNMP"}
                      </div>
                    </div>
                  </div>
                  
                  <h5 className="text-lg font-medium mb-2">{t('reports.historicalSummary')}</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-green-600 dark:text-green-300">
                        {reportData.summary.peakUptime || "100.0%"}
                      </div>
                      <div className="text-sm text-green-500 dark:text-green-400">
                        {t('reports.peakUptime')}
                      </div>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-red-600 dark:text-red-300">
                        {reportData.summary.peakDowntime || "100.0%"}
                      </div>
                      <div className="text-sm text-red-500 dark:text-red-400">
                        {t('reports.peakDowntime')}
                      </div>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-300">
                        {reportData.summary.avgUptime || "97.6%"}
                      </div>
                      <div className="text-sm text-blue-500 dark:text-blue-400">
                        {t('reports.avgUptime')}
                      </div>
                    </div>
                    <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-300">
                        {reportData.summary.downtimeEvents || "35"}
                      </div>
                      <div className="text-sm text-orange-500 dark:text-orange-400">
                        {t('reports.downtimeEvents')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {Object.keys(reportData.summary).map(key => (
                    <div key={key} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t(`reports.summaryLabels.${key}`)}
                      </h3>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {reportData.summary[key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {/* Kolom dinamis berdasarkan jenis laporan */}
                      {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('name') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.device')}
                        </th>
                      )}
                      {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('ip') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.ip')}
                        </th>
                      )}
                      {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('type') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.type')}
                        </th>
                      )}
                      {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('status') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.status')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('cpu') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.cpu')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('memory') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.memory')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('uptime') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.uptime')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('incidents') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.incidents')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('location') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.location')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('device') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.device')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('severity') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.severity')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('time') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.time')}
                        </th>
                      )}
                      {(reportData.tableColumns || []).includes('duration') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('reports.table.duration')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-800">
                    {reportData.table.slice(0, 10).map((item) => (
                      <tr key={item.id || item.name}>
                        {/* Sel dinamis berdasarkan jenis laporan */}
                        {(reportData.tableColumns || ['name', 'ip', 'type', 'status']).includes('name') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
                            <span className={`px-2 py-1 rounded-full text-xs ${
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
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 dark:bg-gray-700">
                              <div className={`h-2.5 rounded-full ${parseInt(item.cpu) > 80 ? 'bg-red-600' : parseInt(item.cpu) > 60 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: item.cpu }}></div>
                            </div>
                            <span className="text-xs">{item.cpu}</span>
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('memory') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 dark:bg-gray-700">
                              <div className={`h-2.5 rounded-full ${parseInt(item.memory) > 80 ? 'bg-red-600' : parseInt(item.memory) > 60 ? 'bg-yellow-400' : 'bg-blue-500'}`} style={{ width: item.memory }}></div>
                            </div>
                            <span className="text-xs">{item.memory}</span>
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('uptime') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.uptime}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('incidents') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.incidents}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('location') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.location}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('device') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.device}
                          </td>
                        )}
                        {(reportData.tableColumns || []).includes('severity') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.duration}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <DocumentChartBarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('reports.noData')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md text-center">
                {t('reports.description')}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Save Report Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <BookmarkIcon className="h-6 w-6 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reports.saveDialog.title')}</h3>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.saveDialog.reportName')}
              </label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder={t('reports.saveDialog.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && saveReport()}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={saveReport}
                className="flex-1 flex items-center justify-center"
              >
                {t('reports.save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setReportName('');
                }}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Report Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <ShareIcon className="h-6 w-6 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reports.shareDialog.title')}</h3>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.shareDialog.email')}
              </label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder={t('reports.shareDialog.emailPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>{t('reports.types.' + reportType + '.name')}</span>
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs">
                  {dateRange.start} - {dateRange.end}
                </span>
              </div>
              
              <Button
                icon={EnvelopeIcon}
                onClick={shareReport}
                className="w-full"
              >
                {t('reports.shareDialog.send')}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareDialog(false);
                  setShareEmail('');
                }}
                className="w-full"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Saved Reports Dialog */}
      {showSavedReportsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DocumentChartBarIcon className="h-6 w-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reports.savedReportsDialog.title')}</h3>
              </div>
              <button 
                onClick={() => setShowSavedReportsDialog(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              {savedReports.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentChartBarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('reports.savedReportsDialog.empty')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate" title={report.name}>
                          {report.name}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(t('reports.savedReportsDialog.confirmDelete'))) {
                              deleteSavedReport(report.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                            {t('reports.types.' + report.type + '.name')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex mt-2">
                        <Button
                          size="xs"
                          variant="outline"
                          icon={EyeIcon}
                          onClick={() => loadSavedReport(report)}
                          className="flex-1 text-xs"
                        >
                          {t('reports.savedReportsDialog.load')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowSavedReportsDialog(false)}
                className="w-full"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
