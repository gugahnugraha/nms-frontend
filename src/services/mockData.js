// src/services/mockData.js

/**
 * This file contains mock data generators for demo mode
 * When REACT_APP_DEMO_MODE is set to true, these mock services 
 * will be used instead of actual API calls
 */

// Mock device data
export const mockDevices = [
  {
    id: "d001",
    name: "Core Router",
    ip: "10.0.0.1",
    type: "router",
    status: "up",
    uptime: 9845623,
    location: "Server Room 1",
    group: "Core Infrastructure",
    lastChecked: new Date().toISOString(),
    interfaces: [
      { name: "GigabitEthernet0/0", status: "up", speed: "1 Gbps", traffic: 756234 },
      { name: "GigabitEthernet0/1", status: "up", speed: "1 Gbps", traffic: 458723 },
      { name: "GigabitEthernet0/2", status: "down", speed: "1 Gbps", traffic: 0 }
    ]
  },
  {
    id: "d002",
    name: "Edge Switch 1",
    ip: "10.0.0.2",
    type: "switch",
    status: "up",
    uptime: 7523410,
    location: "Server Room 1",
    group: "Edge Devices",
    lastChecked: new Date().toISOString(),
    interfaces: [
      { name: "Ethernet1/1", status: "up", speed: "10 Gbps", traffic: 1256234 },
      { name: "Ethernet1/2", status: "up", speed: "10 Gbps", traffic: 958723 }
    ]
  },
  {
    id: "d003",
    name: "Web Server 1",
    ip: "10.0.1.10",
    type: "server",
    status: "up",
    uptime: 4523410,
    location: "Server Room 2",
    group: "Application Servers",
    lastChecked: new Date().toISOString(),
    interfaces: [
      { name: "eth0", status: "up", speed: "1 Gbps", traffic: 356234 }
    ]
  },
  {
    id: "d004",
    name: "Database Server",
    ip: "10.0.1.11",
    type: "server",
    status: "warning",
    uptime: 2523410,
    location: "Server Room 2",
    group: "Database Servers",
    lastChecked: new Date().toISOString(),
    interfaces: [
      { name: "eth0", status: "up", speed: "1 Gbps", traffic: 156234 },
      { name: "eth1", status: "up", speed: "1 Gbps", traffic: 56234 }
    ]
  },
  {
    id: "d005",
    name: "Access Point 1",
    ip: "10.0.2.1",
    type: "wireless",
    status: "up",
    uptime: 1523410,
    location: "Office Floor 1",
    group: "Wireless",
    lastChecked: new Date().toISOString(),
    interfaces: [
      { name: "wifi0", status: "up", speed: "54 Mbps", traffic: 123456 }
    ]
  },
  {
    id: "d006",
    name: "Backup Server",
    ip: "10.0.1.12",
    type: "server",
    status: "down",
    uptime: 0,
    location: "Server Room 2",
    group: "Backup Infrastructure",
    lastChecked: new Date().toISOString(),
    interfaces: [
      { name: "eth0", status: "down", speed: "1 Gbps", traffic: 0 }
    ]
  }
];

// Mock alerts
export const mockAlerts = [
  {
    id: "a001",
    deviceId: "d006",
    deviceName: "Backup Server",
    title: "Device Down",
    message: "Backup Server (10.0.1.12) is not responding",
    severity: "critical",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    acknowledged: false,
    resolved: false
  },
  {
    id: "a002",
    deviceId: "d004",
    deviceName: "Database Server",
    title: "High CPU Usage",
    message: "CPU usage on Database Server exceeds 90%",
    severity: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    acknowledged: true,
    resolved: false
  },
  {
    id: "a003",
    deviceId: "d001",
    deviceName: "Core Router",
    title: "Interface Down",
    message: "Interface GigabitEthernet0/2 on Core Router is down",
    severity: "major",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    acknowledged: true,
    resolved: false
  },
  {
    id: "a004",
    deviceId: "d002",
    deviceName: "Edge Switch 1",
    title: "High Traffic",
    message: "Unusual traffic spike on Edge Switch 1",
    severity: "minor",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    acknowledged: true,
    resolved: true
  }
];

// Mock users
export const mockUsers = [
  {
    id: "u001",
    username: "admin",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "administrator",
    lastLogin: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: "u002",
    username: "operator",
    email: "operator@example.com",
    firstName: "Network",
    lastName: "Operator",
    role: "operator",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: "u003",
    username: "viewer",
    email: "viewer@example.com",
    firstName: "Guest",
    lastName: "Viewer",
    role: "viewer",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

// Mock performance data generator
export const generatePerformanceData = (deviceId, metric, timespan = 24) => {
  const now = Date.now();
  const data = [];
  
  // Different base values and variations for different metrics
  let baseValue = 50;
  let variation = 15;
  
  switch (metric) {
    case 'cpu':
      baseValue = deviceId === 'd004' ? 85 : 40;
      variation = 15;
      break;
    case 'memory':
      baseValue = 60;
      variation = 10;
      break;
    case 'traffic':
      baseValue = 70;
      variation = 25;
      break;
    case 'errors':
      baseValue = 2;
      variation = 3;
      break;
    default:
      baseValue = 50;
      variation = 15;
  }
  
  // Generate data points
  for (let i = 0; i < timespan; i++) {
    // Add some randomness but keep within logical bounds
    let value = baseValue + (Math.random() * variation * 2) - variation;
    
    // Add some trends
    if (i > timespan * 0.7) {
      // Slight upward trend at the end
      value += (i - (timespan * 0.7)) * (variation / 10);
    }
    
    // Ensure values are within realistic bounds
    value = Math.max(0, Math.min(100, value));
    
    // Special case for the "down" device
    if (deviceId === 'd006' && i > timespan * 0.8) {
      value = 0;
    }
    
    data.push({
      timestamp: new Date(now - (timespan - i) * 1000 * 60 * 60).toISOString(),
      value: value.toFixed(2)
    });
  }
  
  return data;
};

// Network topology data
export const mockTopology = {
  nodes: [
    { id: "d001", label: "Core Router", type: "router", status: "up" },
    { id: "d002", label: "Edge Switch 1", type: "switch", status: "up" },
    { id: "d003", label: "Web Server 1", type: "server", status: "up" },
    { id: "d004", label: "Database Server", type: "server", status: "warning" },
    { id: "d005", label: "Access Point 1", type: "wireless", status: "up" },
    { id: "d006", label: "Backup Server", type: "server", status: "down" },
    { id: "d007", label: "Edge Switch 2", type: "switch", status: "up" },
    { id: "d008", label: "Firewall", type: "security", status: "up" },
    { id: "d009", label: "Internet Gateway", type: "router", status: "up" }
  ],
  edges: [
    { from: "d009", to: "d008", label: "10 Gbps" },
    { from: "d008", to: "d001", label: "10 Gbps" },
    { from: "d001", to: "d002", label: "1 Gbps" },
    { from: "d001", to: "d007", label: "1 Gbps" },
    { from: "d002", to: "d003", label: "1 Gbps" },
    { from: "d002", to: "d004", label: "1 Gbps" },
    { from: "d007", to: "d005", label: "1 Gbps" },
    { from: "d007", to: "d006", label: "1 Gbps" }
  ]
};

// Mock reports data
export const mockReports = [
  {
    id: "r001",
    name: "Monthly Availability Report",
    type: "availability",
    created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    period: "Last 30 days",
    format: "pdf"
  },
  {
    id: "r002",
    name: "Weekly Performance Report",
    type: "performance",
    created: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    period: "Last 7 days",
    format: "pdf"
  },
  {
    id: "r003",
    name: "Device Status Summary",
    type: "status",
    created: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    period: "Current",
    format: "pdf"
  }
];

// Helper function to generate random performance data for reports
export const generateReportData = (reportType) => {
  switch (reportType) {
    case 'availability':
      return {
        summary: {
          overallAvailability: "99.7%",
          downtimeEvents: 3,
          longestDowntime: "45 minutes",
          totalDowntime: "1.2 hours"
        },
        devices: mockDevices.map(device => ({
          id: device.id,
          name: device.name,
          availability: device.id === 'd006' ? "45.2%" : (95 + Math.random() * 4.9).toFixed(1) + "%",
          downtimeCount: device.id === 'd006' ? 2 : Math.floor(Math.random() * 2)
        }))
      };
      
    case 'performance':
      return {
        summary: {
          averageCpuUsage: "42.3%",
          peakCpuUsage: "87.2%",
          averageMemoryUsage: "58.4%",
          peakMemoryUsage: "76.9%",
          totalTraffic: "5.7 TB"
        },
        devices: mockDevices.map(device => ({
          id: device.id,
          name: device.name,
          averageCpu: device.id === 'd004' ? "85.3%" : (30 + Math.random() * 30).toFixed(1) + "%",
          peakCpu: device.id === 'd004' ? "97.8%" : (60 + Math.random() * 30).toFixed(1) + "%",
          averageMemory: (40 + Math.random() * 40).toFixed(1) + "%",
          traffic: (0.1 + Math.random() * 1.5).toFixed(2) + " TB"
        }))
      };
      
    case 'status':
      return {
        summary: {
          totalDevices: mockDevices.length,
          devicesUp: mockDevices.filter(d => d.status === 'up').length,
          devicesWarning: mockDevices.filter(d => d.status === 'warning').length,
          devicesDown: mockDevices.filter(d => d.status === 'down').length
        },
        devices: mockDevices.map(device => ({
          id: device.id,
          name: device.name,
          status: device.status,
          uptime: device.uptime,
          lastChecked: device.lastChecked
        }))
      };
      
    default:
      return {};
  }
};

// Mock service to simulate API calls
export const mockDeviceService = {
  getDevices: () => Promise.resolve(mockDevices),
  
  getDeviceById: (id) => {
    const device = mockDevices.find(d => d.id === id);
    return Promise.resolve(device || null);
  },
  
  addDevice: (deviceData) => {
    const newDevice = {
      id: 'd' + (mockDevices.length + 1).toString().padStart(3, '0'),
      ...deviceData,
      lastChecked: new Date().toISOString()
    };
    mockDevices.push(newDevice);
    return Promise.resolve(newDevice);
  },
  
  updateDevice: (id, deviceData) => {
    const index = mockDevices.findIndex(d => d.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Device not found'));
    }
    
    mockDevices[index] = { ...mockDevices[index], ...deviceData };
    return Promise.resolve(mockDevices[index]);
  },
  
  deleteDevice: (id) => {
    const index = mockDevices.findIndex(d => d.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Device not found'));
    }
    
    mockDevices.splice(index, 1);
    return Promise.resolve({ success: true });
  },
  
  pingDevice: (id) => {
    const device = mockDevices.find(d => d.id === id);
    if (!device) {
      return Promise.reject(new Error('Device not found'));
    }
    
    // Simulate ping response
    return Promise.resolve({
      success: device.status !== 'down',
      responseTime: device.status === 'down' ? null : Math.floor(Math.random() * 20) + 5
    });
  },
  
  getDeviceInterfaces: (id) => {
    const device = mockDevices.find(d => d.id === id);
    if (!device) {
      return Promise.reject(new Error('Device not found'));
    }
    
    return Promise.resolve(device.interfaces || []);
  },
  
  getDevicePerformance: (id, metric, timespan) => {
    const device = mockDevices.find(d => d.id === id);
    if (!device) {
      return Promise.reject(new Error('Device not found'));
    }
    
    return Promise.resolve(generatePerformanceData(id, metric, timespan));
  }
};

export const mockAlertService = {
  getAlerts: () => Promise.resolve(mockAlerts),
  
  getAlertById: (id) => {
    const alert = mockAlerts.find(a => a.id === id);
    return Promise.resolve(alert || null);
  },
  
  acknowledgeAlert: (id) => {
    const alert = mockAlerts.find(a => a.id === id);
    if (!alert) {
      return Promise.reject(new Error('Alert not found'));
    }
    
    alert.acknowledged = true;
    return Promise.resolve(alert);
  },
  
  resolveAlert: (id) => {
    const alert = mockAlerts.find(a => a.id === id);
    if (!alert) {
      return Promise.reject(new Error('Alert not found'));
    }
    
    alert.resolved = true;
    return Promise.resolve(alert);
  }
};

export const mockAuthService = {
  login: (username, password) => {
    // In demo mode, accept any credentials
    const user = {
      id: "demo",
      username: username || "demo",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      role: "administrator"
    };
    
    return Promise.resolve({
      token: "demo-token-123456789",
      user
    });
  },
  
  logout: () => Promise.resolve({ success: true }),
  
  register: (userData) => {
    const newUser = {
      id: "u" + (mockUsers.length + 1).toString().padStart(3, '0'),
      ...userData,
      role: userData.role || "viewer"
    };
    
    mockUsers.push(newUser);
    return Promise.resolve(newUser);
  },
  
  getProfile: () => {
    return Promise.resolve({
      id: "demo",
      username: "demo",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      role: "administrator"
    });
  },
  
  updateProfile: (profileData) => {
    return Promise.resolve({
      id: "demo",
      username: "demo",
      ...profileData
    });
  }
};

export const mockReportService = {
  getReports: () => Promise.resolve(mockReports),
  
  getReportById: (id) => {
    const report = mockReports.find(r => r.id === id);
    return Promise.resolve(report || null);
  },
  
  generateReport: (reportType, parameters) => {
    const newReport = {
      id: "r" + (mockReports.length + 1).toString().padStart(3, '0'),
      name: parameters.name || `New ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      type: reportType,
      created: new Date().toISOString(),
      period: parameters.period || "Custom",
      format: parameters.format || "pdf"
    };
    
    mockReports.push(newReport);
    return Promise.resolve({
      report: newReport,
      data: generateReportData(reportType)
    });
  },
  
  downloadReport: (id) => {
    const report = mockReports.find(r => r.id === id);
    if (!report) {
      return Promise.reject(new Error('Report not found'));
    }
    
    // In a real implementation, this would return a file
    return Promise.resolve({
      success: true,
      data: generateReportData(report.type),
      filename: `${report.name.replace(/\s+/g, '_')}.${report.format}`
    });
  }
};

export const mockTopologyService = {
  getTopology: () => Promise.resolve(mockTopology)
};

// Mock WebSocket events generator
export const createMockSocketEvents = (callbacks) => {
  const generateRandomEvent = () => {
    const eventTypes = ['deviceStatusChange', 'newAlert', 'performanceThreshold', 'interfaceStatusChange'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    switch (randomType) {
      case 'deviceStatusChange': {
        const device = mockDevices[Math.floor(Math.random() * mockDevices.length)];
        const newStatus = Math.random() > 0.7 ? 'warning' : 'up';
        if (device.status !== newStatus) {
          device.status = newStatus;
          return { type: 'deviceStatusChange', data: { deviceId: device.id, status: newStatus } };
        }
        break;
      }
      
      case 'newAlert': {
        const device = mockDevices[Math.floor(Math.random() * mockDevices.length)];
        const severity = Math.random() > 0.7 ? 'critical' : (Math.random() > 0.5 ? 'warning' : 'minor');
        const alert = {
          id: "a" + (mockAlerts.length + 1).toString().padStart(3, '0'),
          deviceId: device.id,
          deviceName: device.name,
          title: severity === 'critical' ? 'Critical Issue Detected' : 'Performance Warning',
          message: `${severity === 'critical' ? 'Critical issue' : 'Warning'} on ${device.name}`,
          severity,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          resolved: false
        };
        mockAlerts.unshift(alert);
        return { type: 'newAlert', data: alert };
      }
      
      case 'performanceThreshold': {
        const device = mockDevices[Math.floor(Math.random() * mockDevices.length)];
        const metrics = ['CPU', 'Memory', 'Disk', 'Network'];
        const metric = metrics[Math.floor(Math.random() * metrics.length)];
        const value = Math.floor(Math.random() * 30) + 70;
        return { 
          type: 'performanceThreshold', 
          data: { 
            deviceId: device.id, 
            deviceName: device.name, 
            metric, 
            value: `${value}%`, 
            threshold: '70%' 
          } 
        };
      }
      
      case 'interfaceStatusChange': {
        const device = mockDevices[Math.floor(Math.random() * mockDevices.length)];
        if (device.interfaces && device.interfaces.length) {
          const interface = device.interfaces[Math.floor(Math.random() * device.interfaces.length)];
          const newStatus = interface.status === 'up' ? 'down' : 'up';
          interface.status = newStatus;
          return { 
            type: 'interfaceStatusChange', 
            data: { 
              deviceId: device.id, 
              deviceName: device.name, 
              interfaceName: interface.name, 
              status: newStatus 
            } 
          };
        }
        break;
      }
    }
    
    // Default fallback
    return { type: 'heartbeat', data: { timestamp: new Date().toISOString() } };
  };
  
  // Setup event generation intervals
  const intervals = [];
  
  // Heartbeat every 30 seconds
  intervals.push(setInterval(() => {
    if (callbacks.onEvent) {
      callbacks.onEvent({ type: 'heartbeat', data: { timestamp: new Date().toISOString() } });
    }
  }, 30000));
  
  // Random events every 1-2 minutes
  intervals.push(setInterval(() => {
    if (callbacks.onEvent) {
      const event = generateRandomEvent();
      if (event) {
        callbacks.onEvent(event);
      }
    }
  }, Math.floor(Math.random() * 60000) + 60000));
  
  // Return a cleanup function
  return () => {
    intervals.forEach(interval => clearInterval(interval));
  };
};

// Mock service provider setup
export const setupMockServices = () => {
  if (process.env.REACT_APP_DEMO_MODE !== 'true') {
    return false;
  }
  
  console.log('Setting up mock services for demo mode');
  
  // You could implement more sophisticated service mocking here,
  // such as intercepting API calls or replacing service implementations
  
  return true;
};
