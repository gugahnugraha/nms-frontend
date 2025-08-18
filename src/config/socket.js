import { io } from 'socket.io-client';
import { getEnvironmentConfig } from './environment.js';
import { getConfig } from './production.js';

// Get environment configuration
const envConfig = getEnvironmentConfig();

// Socket configuration with environment-aware URLs
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || envConfig.SOCKET_URL;

// Create socket instance with environment-aware config
const createSocket = (options = {}) => {
  const socketConfig = {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: getConfig('SOCKET.RECONNECTION_ATTEMPTS', 3),
    reconnectionDelay: getConfig('SOCKET.RECONNECTION_DELAY', 1000),
    maxReconnectionDelay: getConfig('SOCKET.MAX_RECONNECTION_DELAY', 5000),
    timeout: getConfig('API.TIMEOUT', 10000),
    forceNew: true,
    ...options
  };

  // Add credentials for production
  if (getConfig('SECURITY.WITH_CREDENTIALS', false)) {
    socketConfig.withCredentials = true;
  }

  const socket = io(SOCKET_URL, socketConfig);

  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    socket.on('connect', () => {
      if (getConfig('MONITORING.ENABLE_LOGGING', false)) {
        console.log('[Socket] Connected to server');
      }
    });

    socket.on('disconnect', (reason) => {
      if (getConfig('MONITORING.ENABLE_LOGGING', false)) {
        console.log('[Socket] Disconnected:', reason);
      }
    });

    socket.on('connect_error', (error) => {
      if (getConfig('MONITORING.ENABLE_LOGGING', false)) {
        console.error('[Socket] Connection error:', error);
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      if (getConfig('MONITORING.ENABLE_LOGGING', false)) {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      }
    });

    socket.on('reconnect_error', (error) => {
      if (getConfig('MONITORING.ENABLE_LOGGING', false)) {
        console.error('[Socket] Reconnection error:', error);
      }
    });
  }

  return socket;
};

// Default socket instance
const defaultSocket = createSocket();

// Export socket configuration
export const SOCKET_CONFIG = {
  URL: SOCKET_URL,
  PATH: '/socket.io',
  TRANSPORTS: ['websocket', 'polling'],
  RECONNECTION: {
    ENABLED: true,
    ATTEMPTS: getConfig('SOCKET.RECONNECTION_ATTEMPTS', 3),
    DELAY: getConfig('SOCKET.RECONNECTION_DELAY', 1000),
    MAX_DELAY: getConfig('SOCKET.MAX_RECONNECTION_DELAY', 5000),
  },
  SECURITY: {
    WITH_CREDENTIALS: getConfig('SECURITY.WITH_CREDENTIALS', false),
  },
  MONITORING: {
    ENABLE_LOGGING: getConfig('MONITORING.ENABLE_LOGGING', false),
    LOG_LEVEL: getConfig('MONITORING.LOG_LEVEL', 'info'),
  }
};

// Export socket functions
export { createSocket, defaultSocket };

// Export socket info for debugging
export const getSocketInfo = () => {
  return {
    url: SOCKET_URL,
    config: SOCKET_CONFIG,
    environment: getEnvironmentConfig(),
    isProduction: getConfig('MONITORING.ENABLE_LOGGING') === false
  };
};
