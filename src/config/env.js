// Environment Variables Configuration
// File ini berisi konfigurasi environment yang bisa digunakan di development dan production

export const ENV_CONFIG = {
  // Development mode - localhost
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    SOCKET_URL: 'http://localhost:5000',
    BASE_URL: 'http://localhost:3000',
    PROXY: 'http://localhost:5000'
  },
  
  // Development mode - IP lokal
  development_ip: {
    API_BASE_URL: 'http://10.10.100.44:5000/api',
    SOCKET_URL: 'http://10.10.100.44:5000',
    BASE_URL: 'http://10.10.100.44:3000',
    PROXY: 'http://10.10.100.44:5000'
  },
  
  // Production mode - domain publik
  production_domain: {
    API_BASE_URL: 'https://nms.gugahnugraha.my.id/api',
    SOCKET_URL: 'https://nms.gugahnugraha.my.id',
    BASE_URL: 'https://nms.gugahnugraha.my.id',
    PROXY: 'https://nms.gugahnugraha.my.id'
  },
  
  // Production mode - IP lokal
  production_ip: {
    API_BASE_URL: 'http://10.10.100.44:80/api',
    SOCKET_URL: 'http://10.10.100.44:80',
    BASE_URL: 'http://10.10.100.44:80',
    PROXY: 'http://10.10.100.44:80'
  }
};

// Get environment variables with fallbacks
export const getEnvVar = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

// Get current environment
export const getCurrentEnv = () => {
  return process.env.NODE_ENV || 'development';
};

// Get environment config based on current environment
export const getEnvConfig = () => {
  const currentEnv = getCurrentEnv();
  
  // Check for forced environment
  const forcedEnv = getEnvVar('REACT_APP_ENVIRONMENT', '').toLowerCase();
  if (forcedEnv && ENV_CONFIG[forcedEnv]) {
    return ENV_CONFIG[forcedEnv];
  }
  
  // Auto-detect based on hostname if in browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Development mode - localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return ENV_CONFIG.development;
    }
    
    // Development mode - IP lokal dengan port 3000
    if (hostname === '10.10.100.44' && port === '3000') {
      return ENV_CONFIG.development_ip;
    }
    
    // Production domain mode
    if (hostname === 'nms.gugahnugraha.my.id') {
      return ENV_CONFIG.production_domain;
    }
    
    // Production IP mode - IP lokal dengan port 80
    if (hostname === '10.10.100.44' && (port === '80' || !port)) {
      return ENV_CONFIG.production_ip;
    }
  }
  
  // Default based on NODE_ENV
  if (currentEnv === 'production') {
    return ENV_CONFIG.production_domain;
  }
  
  return ENV_CONFIG.development;
};

// Export individual configs for direct access
export const {
  development,
  development_ip,
  production_domain,
  production_ip
} = ENV_CONFIG;
