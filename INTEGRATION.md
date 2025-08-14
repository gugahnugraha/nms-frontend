# Backend Integration Guide

This document provides detailed information about integrating the NMS frontend with the backend API and monitoring stack.

## Table of Contents

- [Backend API Integration](#backend-api-integration)
- [API Service Structure](#api-service-structure)
- [Authentication](#authentication)
- [WebSocket Integration](#websocket-integration)
- [Error Handling](#error-handling)
- [Monitoring Stack Integration](#monitoring-stack-integration)
- [Prometheus Integration](#prometheus-integration)
- [SNMP Exporter Configuration](#snmp-exporter-configuration)
- [Troubleshooting](#troubleshooting)

## Backend API Integration

The NMS frontend is designed to work with a RESTful API backend. The API integration is handled primarily through the `src/services` directory, which contains service modules for each API domain.

### API Configuration

The API base URL is configured in `.env` file and imported in `src/config/api.js`:

```javascript
// src/config/api.js
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
export const PROMETHEUS_URL = process.env.REACT_APP_PROMETHEUS_URL || 'http://localhost:9090';
```

### API Service Structure

Each API domain has its own service file that handles API requests and responses:

```javascript
// Example: src/services/deviceService.js
import axios from 'axios';
import { API_URL } from '../config/api';

// Create Axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Device API methods
export const fetchDevices = async () => {
  const response = await api.get('/devices');
  return response.data;
};

export const fetchDeviceById = async (id) => {
  const response = await api.get(`/devices/${id}`);
  return response.data;
};

export const createDevice = async (deviceData) => {
  const response = await api.post('/devices', deviceData);
  return response.data;
};

export const updateDevice = async (id, deviceData) => {
  const response = await api.put(`/devices/${id}`, deviceData);
  return response.data;
};

export const deleteDevice = async (id) => {
  const response = await api.delete(`/devices/${id}`);
  return response.data;
};

export const pingDevice = async (id) => {
  const response = await api.post(`/devices/${id}/ping`);
  return response.data;
};
```

## Authentication

Authentication is implemented using JWT (JSON Web Tokens). The authentication flow works as follows:

1. User enters login credentials on the login page
2. Credentials are sent to `/api/auth/login` endpoint
3. Backend validates credentials and returns a JWT token
4. Frontend stores the token in localStorage
5. Token is included in the Authorization header for all subsequent API requests
6. Token is refreshed as needed to maintain the session

### Authentication Service

```javascript
// src/services/authService.js
import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};
```

## WebSocket Integration

Real-time updates are handled through WebSocket connections using Socket.IO. The WebSocket integration is implemented in `src/services/socketService.js`:

```javascript
// src/services/socketService.js
import io from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    }
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    if (token) {
      return initializeSocket(token);
    }
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Using WebSockets in Components

```javascript
// Example: Using WebSockets in a React component
import React, { useEffect, useState } from 'react';
import { getSocket } from '../services/socketService';

const AlertNotification = () => {
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    const socket = getSocket();
    
    // Listen for new alerts
    socket.on('newAlert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });
    
    // Listen for alert updates
    socket.on('updateAlert', (updatedAlert) => {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === updatedAlert.id ? updatedAlert : alert
        )
      );
    });
    
    return () => {
      socket.off('newAlert');
      socket.off('updateAlert');
    };
  }, []);
  
  return (
    <div>
      <h3>Recent Alerts</h3>
      {alerts.length === 0 ? (
        <p>No alerts</p>
      ) : (
        <ul>
          {alerts.map(alert => (
            <li key={alert.id}>
              {alert.title} - {alert.severity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertNotification;
```

## Error Handling

API error handling is implemented at multiple levels:

1. **Service Level**: Catches and formats API errors
2. **Redux Level**: Dispatches error actions for global state
3. **Component Level**: Displays error messages to users

### Example Error Handling in Services

```javascript
// Example error handling in a service
export const fetchDevices = async () => {
  try {
    const response = await api.get('/devices');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch devices' 
    };
  }
};
```

### Example Error Handling in Redux

```javascript
// Example from redux slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDevices } from '../../services/deviceService';

export const getDevices = createAsyncThunk(
  'devices/getDevices',
  async (_, { rejectWithValue }) => {
    const result = await fetchDevices();
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    return result.data;
  }
);

const deviceSlice = createSlice({
  name: 'devices',
  initialState: {
    devices: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDevices.fulfilled, (state, action) => {
        state.devices = action.payload;
        state.loading = false;
      })
      .addCase(getDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default deviceSlice.reducer;
```

## Monitoring Stack Integration

The NMS frontend integrates with a monitoring stack consisting of Prometheus and SNMP Exporter.

### Prometheus Integration

The frontend queries Prometheus for metrics data. The integration is implemented in `src/services/prometheusService.js`:

```javascript
// src/services/prometheusService.js
import axios from 'axios';
import { PROMETHEUS_URL } from '../config/api';

const api = axios.create({
  baseURL: PROMETHEUS_URL,
  timeout: 15000
});

export const queryInstant = async (query) => {
  try {
    const response = await api.get('/api/v1/query', {
      params: { query }
    });
    return { success: true, data: response.data.data.result };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to query Prometheus'
    };
  }
};

export const queryRange = async (query, start, end, step) => {
  try {
    const response = await api.get('/api/v1/query_range', {
      params: { query, start, end, step }
    });
    return { success: true, data: response.data.data.result };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to query Prometheus range'
    };
  }
};

export const getMetricNames = async () => {
  try {
    const response = await api.get('/api/v1/label/__name__/values');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get metric names'
    };
  }
};
```

### Example Usage in a Custom Hook

```javascript
// src/hooks/useMetrics.js
import { useState, useEffect } from 'react';
import { queryRange } from '../services/prometheusService';

export const useMetrics = (query, start, end, step = '5m') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await queryRange(query, start, end, step);
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
        setData([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [query, start, end, step]);

  return { data, loading, error };
};
```

## SNMP Exporter Configuration

The SNMP Exporter is configured using YAML files in the `monitoring` directory:

1. `snmp.yml`: Main configuration file for SNMP Exporter
2. `snmp-upstream.yml`: Defines devices to be monitored

### Example SNMP Exporter Configuration

```yaml
# monitoring/snmp.yml
modules:
  # Network device module
  network:
    walk:
      - 1.3.6.1.2.1.1            # System
      - 1.3.6.1.2.1.2            # Interfaces
      - 1.3.6.1.2.1.31.1.1       # ifXTable
    version: 2
    auth:
      community: public
  
  # Server module with more metrics
  server:
    walk:
      - 1.3.6.1.2.1.1            # System
      - 1.3.6.1.2.1.2            # Interfaces
      - 1.3.6.1.2.1.25.1         # Host Resources - System
      - 1.3.6.1.2.1.25.2         # Host Resources - Storage
      - 1.3.6.1.2.1.25.3         # Host Resources - Devices
      - 1.3.6.1.2.1.25.4         # Host Resources - Running Software
      - 1.3.6.1.2.1.25.5         # Host Resources - Run Parameters
    version: 2
    auth:
      community: public
```

### Example Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'snmp'
    file_sd_configs:
      - files:
        - 'snmp-upstream.yml'
    metrics_path: /snmp
    params:
      module: [network]
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: 'snmp_exporter:9116'
```

### Example Device Targets Configuration

```yaml
# monitoring/snmp-upstream.yml
- targets:
  - 10.0.0.1  # Router
  - 10.0.0.2  # Switch
  labels:
    module: network

- targets:
  - 10.0.0.10  # Server 1
  - 10.0.0.11  # Server 2
  labels:
    module: server
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Issues

**Problem**: Unable to authenticate with the backend API.

**Solutions**:
- Check if the token is correctly stored in localStorage
- Verify the token is included in API requests
- Check if the token has expired
- Ensure the backend auth endpoint is correctly configured

#### 2. WebSocket Connection Issues

**Problem**: WebSocket connection fails or disconnects.

**Solutions**:
- Verify the WebSocket server URL in the `.env` file
- Check if the token is passed for authentication
- Look for CORS issues in the browser console
- Ensure the WebSocket server is running

#### 3. Prometheus Query Issues

**Problem**: Unable to fetch metrics from Prometheus.

**Solutions**:
- Verify the Prometheus URL in the `.env` file
- Check if Prometheus is accessible from the browser
- Verify the query syntax
- Check if the metric exists in Prometheus

#### 4. SNMP Exporter Issues

**Problem**: SNMP metrics are not showing up in Prometheus.

**Solutions**:
- Verify the SNMP Exporter is running
- Check if the SNMP device is reachable
- Verify the community string and SNMP version
- Check the Prometheus scrape configuration
- Look for errors in the SNMP Exporter logs

### Logging and Debugging

To enable more detailed logging for debugging:

1. Add this to your `.env` file:
   ```
   REACT_APP_DEBUG=true
   ```

2. Use the debug utility in your code:
   ```javascript
   import { debug } from '../utils/debug';
   
   function myComponent() {
     debug('Detailed debug info', { data: someData });
     // Rest of component code
   }
   ```

This will output detailed logs in the browser console when the debug flag is enabled.
