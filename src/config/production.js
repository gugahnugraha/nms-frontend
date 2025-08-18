// Production Configuration
// File ini berisi konfigurasi khusus untuk production mode

export const PRODUCTION_CONFIG = {
  // API Configuration
  API: {
    TIMEOUT: 15000, // 15 seconds for production
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  // Socket Configuration
  SOCKET: {
    RECONNECTION_ATTEMPTS: 5,
    RECONNECTION_DELAY: 2000,
    MAX_RECONNECTION_DELAY: 10000,
  },
  
  // Security Configuration
  SECURITY: {
    WITH_CREDENTIALS: true,
    CORS_ORIGIN: true,
  },
  
  // Performance Configuration
  PERFORMANCE: {
    CACHE_CONTROL: 'public, max-age=3600', // 1 hour cache
    ETAG: true,
    COMPRESSION: true,
  },
  
  // Monitoring Configuration
  MONITORING: {
    ENABLE_LOGGING: false, // Disable logging in production
    LOG_LEVEL: 'error', // Only log errors in production
    ENABLE_METRICS: true,
  }
};

// Get production config with fallbacks
export const getProductionConfig = (key, defaultValue = null) => {
  const keys = key.split('.');
  let value = PRODUCTION_CONFIG;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};

// Check if running in production
export const isProductionMode = () => {
  return process.env.NODE_ENV === 'production' || 
         process.env.REACT_APP_ENVIRONMENT === 'PRODUCTION';
};

// Get appropriate config based on environment
export const getConfig = (key, defaultValue = null) => {
  if (isProductionMode()) {
    return getProductionConfig(key, defaultValue);
  }
  
  // Development defaults
  const devDefaults = {
    'API.TIMEOUT': 10000,
    'API.RETRY_ATTEMPTS': 1,
    'API.RETRY_DELAY': 500,
    'SOCKET.RECONNECTION_ATTEMPTS': 3,
    'SOCKET.RECONNECTION_DELAY': 1000,
    'SECURITY.WITH_CREDENTIALS': false,
    'PERFORMANCE.CACHE_CONTROL': 'no-cache',
    'MONITORING.ENABLE_LOGGING': true, // Enable logging in development
    'MONITORING.LOG_LEVEL': 'debug'
  };
  
  return devDefaults[key] || defaultValue;
};
