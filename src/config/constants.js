// Application constants

// Device types
export const DEVICE_TYPES = {
  ROUTER: 'router',
  SWITCH: 'switch',
  BRIDGE: 'bridge',
  SERVER: 'server',
  DESKTOP: 'desktop',
  OTHER: 'other'
};

// Device status
export const DEVICE_STATUS = {
  UP: 'up',
  DOWN: 'down'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Theme settings
export const THEME = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3'
};

// Chart colors
export const CHART_COLORS = {
  CPU: '#2196f3',
  MEMORY: '#f44336',
  TEMPERATURE: '#ff9800',
  BANDWIDTH_IN: '#4caf50',
  BANDWIDTH_OUT: '#9c27b0'
};

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 60000, // 1 minute
  DEVICE_STATUS: 30000, // 30 seconds
  CHARTS: 60000, // 1 minute
  AUTO_PING: 5000 // 5 seconds
};