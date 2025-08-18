// Environment Configuration
// File ini mendukung switching otomatis antara development dan production

import { getEnvConfig } from './env.js';

// Get environment configuration
const getEnvironmentConfig = () => {
  return getEnvConfig();
};

// Auto-detect environment
const detectEnvironment = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'DEVELOPMENT';
  }

  if (hostname === '10.10.100.44' && port === '3000') {
    return 'DEVELOPMENT_IP';
  }

  if (hostname === 'nms.gugahnugraha.my.id') {
    return 'PRODUCTION_DOMAIN';
  }

  if (hostname === '10.10.100.44' && (port === '80' || port === '')) {
    return 'PRODUCTION_IP';
  }

  if (process.env.NODE_ENV === 'development') {
    return 'DEVELOPMENT';
  }

  return 'PRODUCTION_DOMAIN';
};

// Get current environment
const getCurrentEnvironment = () => {
  // Allow manual override via environment variable
  if (process.env.REACT_APP_ENVIRONMENT) {
    return process.env.REACT_APP_ENVIRONMENT.toUpperCase();
  }

  // Auto-detect if running in browser
  if (typeof window !== 'undefined') {
    return detectEnvironment();
  }

  // Default for build time
  return 'PRODUCTION_DOMAIN';
};

// Environment checks
const isDevelopment = () => {
  const env = getCurrentEnvironment();
  return env === 'DEVELOPMENT' || env === 'DEVELOPMENT_IP';
};

const isProduction = () => getCurrentEnvironment().startsWith('PRODUCTION');
const isDevelopmentLocalhost = () => getCurrentEnvironment() === 'DEVELOPMENT';
const isDevelopmentIP = () => getCurrentEnvironment() === 'DEVELOPMENT_IP';
const isProductionDomain = () => getCurrentEnvironment() === 'PRODUCTION_DOMAIN';
const isProductionIP = () => getCurrentEnvironment() === 'PRODUCTION_IP';

// Get current environment name
const getCurrentEnvironmentName = () => getCurrentEnvironment();

// Debug info
const getEnvironmentInfo = () => {
  const config = getEnvironmentConfig();
  const currentEnv = getCurrentEnvironment();

  return {
    environment: currentEnv,
    config,
    isDevelopment: isDevelopment(),
    isDevelopmentLocalhost: isDevelopmentLocalhost(),
    isDevelopmentIP: isDevelopmentIP(),
    isProduction: isProduction(),
    isProductionDomain: isProductionDomain(),
    isProductionIP: isProductionIP(),
    nodeEnv: process.env.NODE_ENV,
    apiUrl: process.env.REACT_APP_API_URL
  };
};

export {
  getEnvironmentConfig,
  getCurrentEnvironment,
  isDevelopment,
  isDevelopmentLocalhost,
  isDevelopmentIP,
  isProduction,
  isProductionDomain,
  isProductionIP,
  getCurrentEnvironmentName,
  getEnvironmentInfo
};
