// Test Configuration
// File ini untuk testing konfigurasi environment

import { 
  getEnvironmentConfig, 
  getCurrentEnvironment, 
  isDevelopment, 
  isDevelopmentLocalhost, 
  isDevelopmentIP, 
  isProduction,
  isProductionDomain,
  isProductionIP
} from './environment.js';

import { getApiEnvironmentInfo } from './api.js';

// Test environment detection
export const testEnvironmentDetection = () => {
  console.log('=== Environment Detection Test ===');
  
  const currentEnv = getCurrentEnvironment();
  const envConfig = getEnvironmentConfig();
  
  console.log('Current Environment:', currentEnv);
  console.log('Environment Config:', envConfig);
  console.log('');
  
  console.log('Environment Checks:');
  console.log('- isDevelopment():', isDevelopment());
  console.log('- isDevelopmentLocalhost():', isDevelopmentLocalhost());
  console.log('- isDevelopmentIP():', isDevelopmentIP());
  console.log('- isProduction():', isProduction());
  console.log('- isProductionDomain():', isProductionDomain());
  console.log('- isProductionIP():', isProductionIP());
  console.log('');
  
  console.log('Configuration Details:');
  console.log('- API_BASE_URL:', envConfig.API_BASE_URL);
  console.log('- SOCKET_URL:', envConfig.SOCKET_URL);
  console.log('- BASE_URL:', envConfig.BASE_URL);
  console.log('- PROXY:', envConfig.PROXY);
  console.log('');
  
  return {
    currentEnv,
    envConfig,
    checks: {
      isDevelopment: isDevelopment(),
      isDevelopmentLocalhost: isDevelopmentLocalhost(),
      isDevelopmentIP: isDevelopmentIP(),
      isProduction: isProduction(),
      isProductionDomain: isProductionDomain(),
      isProductionIP: isProductionIP()
    }
  };
};

// Test API configuration
export const testApiConfiguration = () => {
  console.log('=== API Configuration Test ===');
  
  const apiInfo = getApiEnvironmentInfo();
  
  console.log('API Environment Info:', apiInfo);
  console.log('');
  
  return apiInfo;
};

// Test all configurations
export const testAllConfigurations = () => {
  console.log('=== All Configurations Test ===');
  
  const envTest = testEnvironmentDetection();
  const apiTest = testApiConfiguration();
  
  console.log('=== Summary ===');
  console.log('Environment:', envTest.currentEnv);
  console.log('API Base URL:', envTest.envConfig.API_BASE_URL);
  console.log('Socket URL:', envTest.envConfig.SOCKET_URL);
  console.log('Is Development:', envTest.checks.isDevelopment);
  console.log('Is Production:', envTest.checks.isProduction);
  
  return {
    environment: envTest,
    api: apiTest
  };
};

// Export test functions
export default {
  testEnvironmentDetection,
  testApiConfiguration,
  testAllConfigurations
};
