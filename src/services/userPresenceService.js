import { getSocket } from './socketService';
import api, { API_ENDPOINTS } from '../config/api';

class UserPresenceService {
  constructor() {
    this.onlineUsers = new Map(); // userId -> userData
    this.socket = null;
    this.listeners = new Map();
    this.isInitialized = false;
    this.userMap = {}; // Store complete user data from API
  }

  // Initialize the service
  init(store = null) {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.loadUserData();
  }

  // Load complete user data from API like in chat feature
  async loadUserData() {
    try {
      const response = await api.get(API_ENDPOINTS.CHAT_USERS_ALL);
      const users = response.data?.data || [];
      const map = {};
      users.forEach((u) => { 
        map[u._id] = u; 
      });
      this.userMap = map;
      console.log('[PRESENCE] Loaded user data for', users.length, 'users');
    } catch (error) {
      console.error('[PRESENCE] Failed to load user data:', error);
    }
  }

  // Connect to socket and start listening
  connect() {
    if (!this.isInitialized) {
      console.warn('[PRESENCE] Service not initialized, call init() first');
      return;
    }

    this.socket = getSocket();
    if (!this.socket) {
      console.warn('[PRESENCE] Socket not available');
      return;
    }

    // User came online
    this.socket.on('presence:online', (data) => {
      if (data.userId) {
        // Get user data from our loaded userMap
        const userData = this.userMap[data.userId] || { 
          id: data.userId, 
          name: `User ${data.userId.slice(-4)}`,
          username: `user_${data.userId.slice(-4)}`,
          avatarUrl: null,
          role: 'user'
        };
        this.onlineUsers.set(data.userId, userData);
        this.notifyListeners('onlineUsersChanged', this.getOnlineUsersCount());
        console.log('[PRESENCE] User online:', data.userId, userData);
      }
    });

    // User went offline
    this.socket.on('presence:offline', (data) => {
      if (data.userId) {
        this.onlineUsers.delete(data.userId);
        this.notifyListeners('onlineUsersChanged', this.getOnlineUsersCount());
        console.log('[PRESENCE] User offline:', data.userId);
      }
    });

    // Initial presence list
    this.socket.on('presence:list', (data) => {
      if (data.userIds && Array.isArray(data.userIds)) {
        this.onlineUsers.clear();
        
        // Use our loaded userMap for complete user data
        data.userIds.forEach(userId => {
          const userData = this.userMap[userId] || { 
            id: userId, 
            name: `User ${userId.slice(-4)}`,
            username: `user_${userId.slice(-4)}`,
            avatarUrl: null,
            role: 'user'
          };
          this.onlineUsers.set(userId, userData);
        });
        
        this.notifyListeners('onlineUsersChanged', this.getOnlineUsersCount());
        console.log('[PRESENCE] Initial online users:', data.userIds.length);
      }
    });

    // Cleanup on disconnect
    this.socket.on('disconnect', () => {
      console.log('[PRESENCE] Disconnected from presence service');
      // Clear online users when disconnected
      this.onlineUsers.clear();
      this.notifyListeners('onlineUsersChanged', 0);
    });
  }

  // Get count of online users
  getOnlineUsersCount() {
    return this.onlineUsers.size;
  }

  // Get list of online user IDs
  getOnlineUserIds() {
    return Array.from(this.onlineUsers.keys());
  }

  // Get online users with more details
  getOnlineUsersDetails() {
    return Array.from(this.onlineUsers.values());
  }

  // Check if specific user is online
  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  // Add or update user data
  updateUserData(userId, userData) {
    if (this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, { ...this.onlineUsers.get(userId), ...userData });
    }
  }

  // Set current user data when they connect
  setCurrentUserData(userData) {
    if (userData && userData._id) {
      this.onlineUsers.set(userData._id, {
        id: userData._id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        role: userData.role
      });
    }
  }

  // Add event listener
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Remove event listener
  removeListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners of an event
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[PRESENCE] Error in listener callback:', error);
        }
      });
    }
  }

  // Cleanup resources
  cleanup() {
    if (this.socket) {
      this.socket.off('presence:online');
      this.socket.off('presence:offline');
      this.socket.off('presence:list');
      this.socket.off('disconnect');
      this.socket = null;
    }
    
    this.onlineUsers.clear();
    this.listeners.clear();
    this.isInitialized = false;
  }
}

const userPresenceService = new UserPresenceService();
export default userPresenceService;
