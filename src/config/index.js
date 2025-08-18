// Configuration Index
// File ini memudahkan import semua konfigurasi

// Export main configuration
export * from './environment.js';
export * from './env.js';
export * from './production.js';
export * from './constants.js';

// Export API configuration
export { default as api, API_BASE_URL, SOCKET_URL, API_ENDPOINTS, getApiEnvironmentInfo } from './api.js';

// Export Socket configuration
export { createSocket, defaultSocket, SOCKET_CONFIG, getSocketInfo } from './socket.js';

// Main configuration getter
export const getConfig = () => {
  return {
    environment: {
      ...require('./environment.js'),
      ...require('./env.js')
    },
    production: require('./production.js'),
    api: require('./api.js'),
    socket: require('./socket.js'),
    constants: require('./constants.js')
  };
};

// Quick access to common configs
export const getApiConfig = () => {
  const { getEnvironmentConfig } = require('./environment.js');
  return getEnvironmentConfig();
};

export const getSocketConfig = () => {
  const { SOCKET_CONFIG } = require('./socket.js');
  return SOCKET_CONFIG;
};

// Environment detection helpers
export const isDevelopment = () => {
  const { isDevelopment } = require('./environment.js');
  return isDevelopment();
};

export const isDevelopmentLocalhost = () => {
  const { isDevelopmentLocalhost } = require('./environment.js');
  return isDevelopmentLocalhost();
};

export const isDevelopmentIP = () => {
  const { isDevelopmentIP } = require('./environment.js');
  return isDevelopmentIP();
};

export const isProduction = () => {
  const { isProduction } = require('./environment.js');
  return isProduction();
};

export const isProductionDomain = () => {
  const { isProductionDomain } = require('./environment.js');
  return isProductionDomain();
};

export const isProductionIP = () => {
  const { isProductionIP } = require('./environment.js');
  return isProductionIP();
};
