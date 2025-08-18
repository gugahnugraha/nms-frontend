import api, { API_ENDPOINTS } from '../config/api';

class SessionService {
  constructor() {
    this.sessionTimeout = null;
    this.refreshTimeout = null;
    this.isRefreshing = false;
    this.failedQueue = [];
    
    // Bind methods
    this.startSessionTimer = this.startSessionTimer.bind(this);
    this.clearSessionTimer = this.clearSessionTimer.bind(this);
    this.handleSessionTimeout = this.handleSessionTimeout.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.processQueue = this.processQueue.bind(this);
  }

  // Start session timer (6 hours = 6 * 60 * 60 * 1000 ms)
  startSessionTimer() {
    this.clearSessionTimer();
    
    // Set timeout for 6 hours
    this.sessionTimeout = setTimeout(() => {
      this.handleSessionTimeout();
    }, 6 * 60 * 60 * 1000);

    // Set refresh timer to refresh 5 minutes before expiry
    this.refreshTimeout = setTimeout(() => {
      this.refreshToken();
    }, (6 * 60 - 5) * 60 * 1000);
  }

  // Clear session timer
  clearSessionTimer() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  // Handle session timeout
  handleSessionTimeout() {
    console.log('Session expired, redirecting to login...');
    
    // Clear user data
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  // Refresh access token
  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken: user.refreshToken
      });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Update user data in localStorage
        const updatedUser = {
          ...user,
          ...userData,
          token
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update Redux state - dispatch action manually
        // This will be handled by the component that uses this service

        // Restart session timer
        this.startSessionTimer();

        // Process failed requests
        this.processQueue(null, token);

        return token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Process failed requests with error
      this.processQueue(error, null);
      
      // If refresh fails, logout user
      this.handleSessionTimeout();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Process failed requests queue
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Check if session is about to expire (within 10 minutes)
  isSessionExpiringSoon() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.token) return true;

    try {
      // Decode JWT token to get expiry
      const payload = JSON.parse(atob(user.token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      // Return true if session expires within 10 minutes
      return timeUntilExpiry < (10 * 60 * 1000);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return true;
    }
  }

  // Initialize session service
  init() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      this.startSessionTimer();
    }
  }

  // Initialize session service without store dependency
  initWithoutStore() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      this.startSessionTimer();
    }
  }

  // Cleanup on logout
  cleanup() {
    this.clearSessionTimer();
    this.isRefreshing = false;
    this.failedQueue = [];
  }
}

// Create singleton instance
const sessionService = new SessionService();

export default sessionService;
