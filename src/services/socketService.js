import { io } from 'socket.io-client';
import api, { SOCKET_URL, API_ENDPOINTS } from '../config/api';
import { setDeviceStatus } from '../redux/slices/deviceSlice';
import { addNotification, incrementUnreadMessages } from '../redux/slices/uiSlice';
import soundNotification from '../utils/soundUtils';

let socket;
let reconnectAttempts = 0;
let isInitialized = false;
let listenersAttached = false;
let windowEventsAttached = false;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;

const socketOptions = {
  reconnection: true,
  reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
  reconnectionDelay: RECONNECT_INTERVAL,
  reconnectionDelayMax: RECONNECT_INTERVAL * 2,
  timeout: 10000,
  autoConnect: false,
  transports: ['websocket', 'polling'] // Tambahkan polling sebagai fallback
};

export const initSocket = (store) => {
  
  
  // Prevent multiple socket instances (React StrictMode, re-mounts)
  if (isInitialized && socket) {
    
    return socket;
  }

  socket = io(SOCKET_URL, socketOptions);
  
  isInitialized = true;

  // Socket connection events
  socket.on('connect', () => {
    
    reconnectAttempts = 0;
    // Identify current user for personal messaging
    try {
      const authUser = store.getState().auth?.user;
      if (authUser?._id) {
        socket.emit('identify', authUser._id);
      }
    } catch {}
    
    // Re-subscribe to device updates
    const devices = store.getState().devices.devices;
    
    
    if (devices && devices.length > 0) {
      
      const deviceIds = devices.map(d => d._id);
      
      socket.emit('subscribeDevices', deviceIds);
    } else {
      
      // Retry subscription after a delay in case devices are still loading
      setTimeout(() => {
        const retryDevices = store.getState().devices.devices;
        
        if (retryDevices && retryDevices.length > 0) {
          
          const retryDeviceIds = retryDevices.map(d => d._id);
          
          socket.emit('subscribeDevices', retryDeviceIds);
        }
      }, 2000);
    }

    // Join all groups the user is a member of for group messaging (only when authenticated)
    ;(async () => {
      try {
        const authUser = store.getState().auth?.user;
        const onLoginPage = typeof window !== 'undefined' && window.location?.pathname === '/login';
        const blocked = typeof window !== 'undefined' && sessionStorage.getItem('joinGroupsBlocked') === '1';
        if (!authUser?.token || onLoginPage || blocked) {
          
          return;
        }
        const res = await api.get(API_ENDPOINTS.GROUPS_MINE);
        const groups = res.data?.data || [];
        groups.forEach((g) => socket.emit('joinGroup', g._id));
      } catch (e) {
      
        if (e?.response?.status === 401) {
          try { sessionStorage.setItem('joinGroupsBlocked', '1'); } catch {}
        }
      }
    })();
  });

  socket.on('connect_error', (error) => {
    
    reconnectAttempts++;
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      
      store.dispatch(addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to server. Please check your connection.'
      }));
    }
  });

  socket.on('disconnect', (reason) => {
    
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, try to reconnect
      setTimeout(() => {
        
        socket.connect();
      }, RECONNECT_INTERVAL);
    }
  });

  // Listen for device status change (only show toast if status changed)
  if (!listenersAttached) {
  socket.on('deviceStatusChange', (data) => {
    
    
    // Update device status in Redux store
    store.dispatch(setDeviceStatus({
      id: data.deviceId,
      status: data.status
    }));
    
    // Hanya tampilkan toast jika bukan dari manual ping
    // Manual ping akan menampilkan dialog, bukan toast
    const state = store.getState();
    const suppress = state.ui?.suppressNextDeviceStatusToast;
    
    
    if (!suppress) {
      
      
      // Play sound notification based on status
      if (data.status === 'UP') {
        // Device came back online - success sound
        soundNotification.playSuccess();
      } else if (data.status === 'DOWN') {
        // Device went offline - error sound
        soundNotification.playError();
      } else if (data.status === 'WARNING') {
        // Device has warning - warning sound
        soundNotification.playWarning();
      } else {
        // Other status changes - info sound
        soundNotification.playInfo();
      }
      
      store.dispatch(addNotification({
        type: 'device-status',
        severity: data.status === 'UP' ? 'success' : 'error',
        deviceId: data.deviceId,
        deviceName: data.name,
        ip: data.ip,
        status: data.status,
        title: `Device ${data.status}`,
        message: `${data.name} (${data.ip}) is now ${data.status}`,
        time: Date.now()
      }));
      // increment alerts badge (bell) count persisted in localStorage
      try {
        const cur = Number(localStorage.getItem('alertsUnread') || 0) + 1;
        localStorage.setItem('alertsUnread', String(cur));
      } catch {}
    } else {
      
      // Reset suppress flag setelah digunakan
      store.dispatch({ type: 'ui/setSuppressNextDeviceStatusToast', payload: false });
    }
  });

  // Listen for device status sync (badge update, no toast)
  socket.on('deviceStatusSync', (data) => {
    
    // Update device status in Redux store for real-time updates
    store.dispatch(setDeviceStatus({
      id: data.deviceId,
      status: data.status
    }));
  });

  // Test event listener
  socket.on('test', (data) => {
    
  });

  // Global chat message notifications (badge + sound only; no toast)
  socket.on('message:new', ({ message }) => {
    console.log('[SOCKET] message:new received', message);
    try {
      soundNotification.playInfo();
      // increase unread badge only if chat page is not open
      try {
        const chatOpen = localStorage.getItem('isChatOpen') === 'true';
        if (!chatOpen) {
          store.dispatch(incrementUnreadMessages(1));
        }
      } catch {}
    } catch {}
  });
  listenersAttached = true;
  }

  // Error handling
  socket.on('error', (error) => {
    
    store.dispatch(addNotification({
      type: 'error',
      title: 'Socket Error',
      message: 'An error occurred with the real-time connection.'
    }));
  });

  // Cleanup function
  const cleanup = () => {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
  };

  // Handle window focus/blur to optimize performance
  if (!windowEventsAttached) {
    window.addEventListener('focus', () => {
      if (socket && !socket.connected) {
        
        socket.connect();
      }
    });
    window.addEventListener('blur', () => {
      // keep connection
    });
    windowEventsAttached = true;
  }

  // Connect socket
  
  socket.connect();

  return { socket, cleanup };
};

export const getSocket = () => socket;

export const subscribeToDevices = (deviceIds) => {
  if (socket && socket.connected && deviceIds && deviceIds.length > 0) {
    
    socket.emit('subscribeDevices', deviceIds);
  }
};

export const closeSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
  }
};