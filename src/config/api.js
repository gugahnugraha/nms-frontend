import axios from 'axios';
import { getEnvironmentConfig, getEnvironmentInfo } from './environment.js';
import { getConfig } from './production.js';

// Get environment configuration
const envConfig = getEnvironmentConfig();

// API configuration with environment-aware URLs
const API_BASE_URL = process.env.REACT_APP_API_URL || envConfig.API_BASE_URL;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || envConfig.SOCKET_URL;

// Create axios instance with environment-aware config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: getConfig('API.TIMEOUT', 10000),
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials for production
  withCredentials: getConfig('SECURITY.WITH_CREDENTIALS', false),
  // Retry configuration
  retry: getConfig('API.RETRY_ATTEMPTS', 1),
  retryDelay: getConfig('API.RETRY_DELAY', 500),
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    // Only log in development mode
    if (process.env.NODE_ENV === 'development' && getConfig('MONITORING.ENABLE_LOGGING', false)) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Only log in development mode
    if (process.env.NODE_ENV === 'development' && getConfig('MONITORING.ENABLE_LOGGING', false)) {
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Always log errors for debugging
    console.error('[API] Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Import session service dynamically to avoid circular dependency
        const sessionService = await import('../services/sessionService.js');
        const token = await sessionService.default.refreshToken();
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Token refresh failed, redirecting to login:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints - using relative paths for better flexibility
const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  UPLOAD_AVATAR: '/auth/profile/avatar',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Device endpoints
  DEVICES: '/devices',
  DEVICE: (id) => `/devices/${id}`,
  PING_DEVICE: (id) => `/devices/${id}/ping`,
  
  // SNMP endpoints
  SNMP_DATA: '/snmp',
  SNMP_DEVICE: (id) => `/snmp/devices/${id}/metrics`,
  SNMP_DEVICE_TIMESERIES: (id) => `/snmp/devices/${id}/metrics/timeseries`,
  SNMP_DEVICE_INTERFACES: (id) => `/snmp/devices/${id}/interfaces`,
  SNMP_METRICS: '/snmp/metrics',
  SNMP_COLLECTOR_STATUS: '/snmp/collector/status',
  
  // Reports endpoints
  REPORTS_NETWORK_SUMMARY: '/reports/network/summary',
  REPORTS_NETWORK_UPTIME: '/reports/network/uptime_timeseries',
  REPORTS_HEALTH: '/reports/health',
  
  // History endpoints
  HISTORY: '/history',
  SNMP_HISTORY: (id) => `/history/snmp/${id}`,
  INTERFACE_HISTORY: (id) => `/history/interfaces/${id}`,
  
  // User endpoints
  USERS: '/users',
  USER: (id) => `/users/${id}`,
  USER_STATUS: (id) => `/users/${id}/status`,
  USER_LOOKUP: (q) => `/users/lookup?q=${encodeURIComponent(q)}`,
  
  // Messaging endpoints
  MESSAGES: '/messages',
  MESSAGE_DELIVERED: (id) => `/messages/${id}/delivered`,
  MESSAGE_READ: (id) => `/messages/${id}/read`,
  MESSAGES_CLEAR: '/messages/clear',
  MESSAGES_WITH: (userId) => `/messages/with/${userId}`,
  MESSAGES_GROUP: (groupId) => `/messages/group/${groupId}`,
  MESSAGES_GLOBAL: '/messages/global',
  CONVERSATIONS: '/messages/conversations',
  GROUPS: '/messages/groups',
  GROUPS_MINE: '/messages/groups/mine',
  GROUP_JOIN: (groupId) => `/messages/groups/${groupId}/join`,
  GROUP_LEAVE: (groupId) => `/messages/groups/${groupId}/leave`,
  CHAT_USERS_BASIC: (idsCsv) => `/messages/users/basic?ids=${encodeURIComponent(idsCsv)}`,
  CHAT_USERS_ALL: '/messages/users/all',
  
  // Alerts
  ALERTS: '/alerts',
  
  // Health check
  HEALTH: '/health',
};

// Export axios instance as default
export default api;

// Named exports
export { API_BASE_URL, SOCKET_URL, API_ENDPOINTS };

// Export environment info for debugging
export const getApiEnvironmentInfo = () => {
  return {
    ...getEnvironmentInfo(),
    apiBaseUrl: API_BASE_URL,
    socketUrl: SOCKET_URL,
    endpoints: API_ENDPOINTS,
    config: {
      timeout: getConfig('API.TIMEOUT'),
      retryAttempts: getConfig('API.RETRY_ATTEMPTS'),
      withCredentials: getConfig('SECURITY.WITH_CREDENTIALS'),
      isProduction: getConfig('MONITORING.ENABLE_LOGGING') === false
    }
  };
};