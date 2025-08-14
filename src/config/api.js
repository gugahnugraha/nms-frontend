import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const { token } = JSON.parse(userData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
  UPLOAD_AVATAR: `${API_BASE_URL}/auth/profile/avatar`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  
  // Device endpoints
  DEVICES: `${API_BASE_URL}/devices`,
  DEVICE: (id) => `${API_BASE_URL}/devices/${id}`,
  PING_DEVICE: (id) => `${API_BASE_URL}/devices/${id}/ping`,
  
  // SNMP endpoints
  SNMP_DATA: `${API_BASE_URL}/snmp`,
  SNMP_DEVICE: (id) => `${API_BASE_URL}/snmp/devices/${id}/metrics`,
  SNMP_DEVICE_TIMESERIES: (id) => `${API_BASE_URL}/snmp/devices/${id}/metrics/timeseries`,
  SNMP_DEVICE_INTERFACES: (id) => `${API_BASE_URL}/snmp/devices/${id}/interfaces`,
  SNMP_METRICS: `${API_BASE_URL}/snmp/metrics`,
  SNMP_COLLECTOR_STATUS: `${API_BASE_URL}/snmp/collector/status`,
  
  // History endpoints
  HISTORY: `${API_BASE_URL}/history`,
  SNMP_HISTORY: (id) => `${API_BASE_URL}/history/snmp/${id}`,
  INTERFACE_HISTORY: (id) => `${API_BASE_URL}/history/interfaces/${id}`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/users`,
  USER: (id) => `${API_BASE_URL}/users/${id}`,
  USER_STATUS: (id) => `${API_BASE_URL}/users/${id}/status`,
  USER_LOOKUP: (q) => `${API_BASE_URL}/users/lookup?q=${encodeURIComponent(q)}`,
  
  // Messaging endpoints
  MESSAGES: `${API_BASE_URL}/messages`,
  MESSAGE_DELIVERED: (id) => `${API_BASE_URL}/messages/${id}/delivered`,
  MESSAGE_READ: (id) => `${API_BASE_URL}/messages/${id}/read`,
  MESSAGES_CLEAR: `${API_BASE_URL}/messages/clear`,
  MESSAGES_WITH: (userId) => `${API_BASE_URL}/messages/with/${userId}`,
  MESSAGES_GROUP: (groupId) => `${API_BASE_URL}/messages/group/${groupId}`,
  MESSAGES_GLOBAL: `${API_BASE_URL}/messages/global`,
  CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
  GROUPS: `${API_BASE_URL}/messages/groups`,
  GROUPS_MINE: `${API_BASE_URL}/messages/groups/mine`,
  GROUP_JOIN: (groupId) => `${API_BASE_URL}/messages/groups/${groupId}/join`,
  GROUP_LEAVE: (groupId) => `${API_BASE_URL}/messages/groups/${groupId}/leave`,
  CHAT_USERS_BASIC: (idsCsv) => `${API_BASE_URL}/messages/users/basic?ids=${encodeURIComponent(idsCsv)}`,
  CHAT_USERS_ALL: `${API_BASE_URL}/messages/users/all`,
  // Alerts
  ALERTS: `${API_BASE_URL}/alerts`,
};

// Export axios instance as default
export default api;

// Named exports
export { API_BASE_URL, SOCKET_URL, API_ENDPOINTS };