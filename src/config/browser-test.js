// Browser Test Configuration
// File ini untuk testing konfigurasi di browser console

// Fungsi untuk testing konfigurasi di browser
export const testInBrowser = () => {
  console.log('🚀 NMS Frontend Configuration Test');
  console.log('=====================================');
  
  // Test environment detection
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  
  console.log('📍 Current Location:');
  console.log('- Hostname:', hostname);
  console.log('- Port:', port);
  console.log('- Protocol:', protocol);
  console.log('- Full URL:', window.location.href);
  console.log('');
  
  // Import dan test konfigurasi
  import('./environment.js').then(({ 
    getEnvironmentConfig, 
    getCurrentEnvironment, 
    isDevelopment, 
    isDevelopmentLocalhost, 
    isDevelopmentIP, 
    isProduction,
    isProductionDomain,
    isProductionIP 
  }) => {
    const currentEnv = getCurrentEnvironment();
    const envConfig = getEnvironmentConfig();
    
    console.log('🔧 Environment Configuration:');
    console.log('- Detected Environment:', currentEnv);
    console.log('- API Base URL:', envConfig.API_BASE_URL);
    console.log('- Socket URL:', envConfig.SOCKET_URL);
    console.log('- Base URL:', envConfig.BASE_URL);
    console.log('- Proxy:', envConfig.PROXY);
    console.log('');
    
    console.log('✅ Environment Checks:');
    console.log('- isDevelopment():', isDevelopment());
    console.log('- isDevelopmentLocalhost():', isDevelopmentLocalhost());
    console.log('- isDevelopmentIP():', isDevelopmentIP());
    console.log('- isProduction():', isProduction());
    console.log('- isProductionDomain():', isProductionDomain());
    console.log('- isProductionIP():', isProductionIP());
    console.log('');
    
    // Test API configuration
    import('./api.js').then(({ getApiEnvironmentInfo }) => {
      const apiInfo = getApiEnvironmentInfo();
      
      console.log('🌐 API Configuration:');
      console.log('- API Base URL:', apiInfo.apiBaseUrl);
      console.log('- Socket URL:', apiInfo.socketUrl);
      console.log('- Is Production:', apiInfo.config.isProduction);
      console.log('- With Credentials:', apiInfo.config.withCredentials);
      console.log('');
      
      console.log('🎯 Expected Behavior:');
      if (isDevelopmentLocalhost()) {
        console.log('✅ Development Mode (localhost) - Using localhost:5000');
      } else if (isDevelopmentIP()) {
        console.log('✅ Development Mode (IP) - Using 10.10.100.44:5000');
      } else if (isProductionDomain()) {
        console.log('✅ Production Mode (Domain) - Using nms.gugahnugraha.my.id');
      } else if (isProductionIP()) {
        console.log('✅ Production Mode (IP) - Using 10.10.100.44:80');
      } else {
        console.log('❓ Unknown Environment - Check configuration');
      }
      console.log('');
      
      console.log('🔍 Configuration Summary:');
      console.log('Environment:', currentEnv);
      console.log('API URL:', envConfig.API_BASE_URL);
      console.log('Socket URL:', envConfig.SOCKET_URL);
      console.log('Is Development:', isDevelopment());
      console.log('Is Production:', isProduction());
      
    }).catch(error => {
      console.error('❌ Error loading API config:', error);
    });
    
  }).catch(error => {
    console.error('❌ Error loading environment config:', error);
  });
};

// Export untuk penggunaan di browser
export default testInBrowser;

// Auto-run jika di browser
if (typeof window !== 'undefined') {
  // Tambahkan ke window object untuk akses dari console
  window.testNMSConfig = testInBrowser;
  
  console.log('💡 Type "testNMSConfig()" in console to test configuration');
}
