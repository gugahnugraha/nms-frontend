# NMS Frontend Configuration

Konfigurasi frontend untuk mendukung mode development dan production dengan auto-detection environment yang sudah diperbaiki.

## 🚀 **Perbaikan Terbaru (Environment Detection)**

### **Masalah yang Diperbaiki:**
- ✅ **Auto-detection logic** sudah diperbaiki
- ✅ **Development IP mode** sekarang berfungsi dengan benar
- ✅ **Port detection** lebih akurat
- ✅ **Console logging** untuk debugging
- ✅ **Test functions** untuk verifikasi

### **Environment Detection Logic:**
```javascript
// Development mode - IP lokal dengan port 3000
if (hostname === '10.10.100.44' && port === '3000') {
  return 'DEVELOPMENT_IP';  // Menggunakan port 5000
}

// Production IP mode - IP lokal dengan port 80
if (hostname === '10.10.100.44' && (port === '80' || port === '')) {
  return 'PRODUCTION_IP';   // Menggunakan port 80
}
```

## 📁 **Struktur File**

```
src/config/
├── index.js              # Main configuration index
├── environment.js        # Environment detection & configuration (FIXED)
├── env.js               # Environment variables & configs
├── production.js        # Production-specific configuration
├── api.js               # API configuration & endpoints
├── socket.js            # Socket.io configuration
├── constants.js         # Application constants
├── test-environment.js  # Environment testing functions (NEW)
└── README.md            # This file
```

## 🌍 **Environment Modes**

### **1. Development Mode - Localhost**
- **URL:** `http://localhost:5000/api`
- **Socket:** `http://localhost:5000`
- **Base:** `http://localhost:3000`
- **Auto-detected:** Ketika hostname = `localhost` atau `127.0.0.1`

### **2. Development Mode - IP Lokal** ✅ **FIXED**
- **URL:** `http://10.10.100.44:5000/api`
- **Socket:** `http://10.10.100.44:5000`
- **Base:** `http://10.10.100.44:3000`
- **Auto-detected:** Ketika hostname = `10.10.100.44` dan port = `3000`

### **3. Production Domain Mode**
- **URL:** `https://nms.gugahnugraha.my.id/api`
- **Socket:** `https://nms.gugahnugraha.my.id`
- **Base:** `https://nms.gugahnugraha.my.id`
- **Auto-detected:** Ketika hostname = `nms.gugahnugraha.my.id`

### **4. Production IP Mode**
- **URL:** `http://10.10.100.44:80/api`
- **Socket:** `http://10.10.100.44:80`
- **Base:** `http://10.10.100.44:80`
- **Auto-detected:** Ketika hostname = `10.10.100.44` dan port = `80`

## 🔍 **Auto-Detection Logic**

Sistem akan otomatis mendeteksi environment berdasarkan:

1. **Hostname + Port** - Jika diakses dari browser
2. **NODE_ENV** - Environment variable
3. **REACT_APP_ENVIRONMENT** - Manual override

### **Detection Logic (FIXED):**
- `localhost:3000` → **Development Localhost** (port 5000)
- `10.10.100.44:3000` → **Development IP** (port 5000) ✅ **FIXED**
- `10.10.100.44:80` → **Production IP** (port 80)
- `nms.gugahnugraha.my.id` → **Production Domain**

## 🧪 **Testing Environment**

### **Test Functions:**
```javascript
import { 
  testEnvironmentDetection, 
  testEnvironmentInfo, 
  testAllConfigurations 
} from './config';

// Test environment detection
testEnvironmentDetection();

// Test all configurations
testAllConfigurations();
```

### **Browser Console:**
```javascript
// Auto-available in browser console
testNMSEnvironment();  // Test lengkap environment
```

## 🚀 **Usage**

### **Basic Import:**
```javascript
import { api, API_ENDPOINTS, SOCKET_URL } from './config';
```

### **Environment Detection:**
```javascript
import { 
  isDevelopment, 
  isDevelopmentLocalhost, 
  isDevelopmentIP, 
  isProduction, 
  getEnvironmentConfig 
} from './config';

if (isDevelopment()) {
  console.log('Running in development mode');
}

if (isDevelopmentIP()) {
  console.log('Running on IP lokal (development)');
}

const config = getEnvironmentConfig();
console.log('API URL:', config.API_BASE_URL);
```

### **API Usage:**
```javascript
import { api, API_ENDPOINTS } from './config';

// Login
const response = await api.post(API_ENDPOINTS.LOGIN, {
  username: 'admin',
  password: 'password'
});

// Get devices
const devices = await api.get(API_ENDPOINTS.DEVICES);
```

## 🔧 **Troubleshooting**

### **Jika Masih Ada Error Axios:**

1. **Check Console Logs:**
   ```javascript
   // Lihat environment detection logs
   [ENV] Detecting environment: { hostname: "10.10.100.44", port: "3000" }
   [ENV] Detected: DEVELOPMENT_IP (10.10.100.44:3000)
   ```

2. **Verify Environment:**
   ```javascript
   // Test di browser console
   testNMSEnvironment();
   ```

3. **Check API Base URL:**
   ```javascript
   // Seharusnya: http://10.10.100.44:5000/api
   console.log('API Base URL:', getEnvironmentConfig().API_BASE_URL);
   ```

### **Common Issues:**
- ❌ **Port 80** → Backend tidak running di port 80
- ❌ **Port 5000** → Backend tidak running di port 5000
- ❌ **Environment Mismatch** → Check auto-detection logic

## 📊 **Environment Variables**

### **Development IP (Recommended):**
```bash
REACT_APP_ENVIRONMENT=DEVELOPMENT_IP
REACT_APP_API_URL=http://10.10.100.44:5000/api
REACT_APP_SOCKET_URL=http://10.10.100.44:5000
```

### **Production:**
```bash
REACT_APP_ENVIRONMENT=PRODUCTION_IP
REACT_APP_API_URL=http://10.10.100.44:80/api
REACT_APP_SOCKET_URL=http://10.10.100.44:80
```

## 🎯 **Migration to Nginx**

Ketika frontend di-migrasi ke Nginx:

1. **Domain Access:** Akan otomatis menggunakan `https://nms.gugahnugraha.my.id`
2. **IP Access:** Akan otomatis menggunakan `http://10.10.100.44:80`
3. **Development IP:** Tetap tersedia di `http://10.10.100.44:3000`
4. **No Code Changes:** Tidak perlu mengubah kode frontend
5. **Auto-fallback:** Jika domain tidak tersedia, akan fallback ke IP

## ✨ **Features**

- ✅ **Auto-environment detection (FIXED)**
- ✅ **Development modes (localhost + IP lokal)**
- ✅ **Production modes (domain + IP)**
- ✅ **Port-based detection (FIXED)**
- ✅ **Domain & IP support**
- ✅ **Socket.io configuration**
- ✅ **API endpoint management**
- ✅ **Production optimizations**
- ✅ **Logging & monitoring (ENHANCED)**
- ✅ **Error handling**
- ✅ **Retry mechanisms**
- ✅ **Test functions (NEW)**

## 🔍 **Debug**

Untuk debugging environment:

```javascript
import { getApiEnvironmentInfo, getSocketInfo } from './config';

console.log('API Environment:', getApiEnvironmentInfo());
console.log('Socket Info:', getSocketInfo());

// Test environment detection
testAllConfigurations();
```

## 📝 **Notes**

- Endpoints menggunakan relative paths untuk fleksibilitas
- Socket connection otomatis dikonfigurasi berdasarkan environment
- Production mode memiliki timeout dan retry yang lebih robust
- Logging hanya aktif di development mode
- Credentials otomatis ditambahkan di production mode
- Development mode tersedia di localhost dan IP lokal dengan port berbeda
- **Environment detection sudah diperbaiki dan di-test** ✅

## 🚨 **Important Fixes Applied:**

1. **Port Detection Logic** - Sekarang lebih akurat
2. **Development IP Mode** - Berfungsi dengan benar
3. **Console Logging** - Untuk debugging environment
4. **Test Functions** - Untuk verifikasi konfigurasi
5. **Auto-detection** - Lebih reliable

**Environment detection sudah diperbaiki dan siap untuk development dan production!** 🎉
