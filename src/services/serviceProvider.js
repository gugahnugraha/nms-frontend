// src/services/serviceProvider.js

/**
 * Service provider that switches between real API services and mock services
 * based on the REACT_APP_DEMO_MODE environment variable
 */

import { 
  mockDeviceService, 
  mockAlertService, 
  mockAuthService, 
  mockReportService,
  mockTopologyService,
  createMockSocketEvents,
  setupMockServices
} from './mockData';

// Import real services
// These would be your actual API service implementations
import * as realDeviceService from './deviceService';
import * as realAlertService from './alertService';
import * as realAuthService from './authService';
import * as realReportService from './reportService';
import * as realTopologyService from './topologyService';

// Initialize mock services if in demo mode
const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';
if (isDemoMode) {
  setupMockServices();
  console.log('Running in DEMO MODE - using mock data');
}

// Export the appropriate service implementations based on mode
export const deviceService = isDemoMode ? mockDeviceService : realDeviceService;
export const alertService = isDemoMode ? mockAlertService : realAlertService;
export const authService = isDemoMode ? mockAuthService : realAuthService;
export const reportService = isDemoMode ? mockReportService : realReportService;
export const topologyService = isDemoMode ? mockTopologyService : realTopologyService;

// Special handling for WebSocket connections
export const initializeSocket = (token, callbacks) => {
  if (isDemoMode) {
    console.log('Initializing mock socket events');
    // Return the cleanup function
    return createMockSocketEvents(callbacks);
  } else {
    // This would be your actual WebSocket initialization
    // For example:
    // import io from 'socket.io-client';
    // import { SOCKET_URL } from '../config/api';
    // const socket = io(SOCKET_URL, { auth: { token } });
    // socket.on('event', callbacks.onEvent);
    // return () => socket.disconnect();
    
    // Import your real socket implementation here
    const { initializeSocket: realInitializeSocket } = require('./socketService');
    return realInitializeSocket(token, callbacks);
  }
};
