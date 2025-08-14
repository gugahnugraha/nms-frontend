import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  notifications: [],
  unreadMessagesCount: Number(localStorage.getItem('unreadMessages') || 0),
  suppressNextDeviceStatusToast: false,
  loading: {
    global: false,
    dashboard: false,
    devices: false,
    users: false
  }
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    addNotification: (state, action) => {
      let notifId = Date.now();
      // Jika notifikasi status device, gunakan id konsisten
      if (action.payload && action.payload.type === 'device-status' && action.payload.deviceId) {
        notifId = `device-status-${action.payload.deviceId}`;
      }
      state.notifications.push({
        id: notifId,
        ...action.payload
      });
    },
    incrementUnreadMessages: (state, action) => {
      const by = Number(action.payload || 1);
      state.unreadMessagesCount = Math.max(0, state.unreadMessagesCount + by);
      try { localStorage.setItem('unreadMessages', String(state.unreadMessagesCount)); } catch {}
    },
    resetUnreadMessages: (state) => {
      state.unreadMessagesCount = 0;
      try { localStorage.setItem('unreadMessages', '0'); } catch {}
    },
    setSuppressNextDeviceStatusToast: (state, action) => {
      state.suppressNextDeviceStatusToast = Boolean(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    }
  }
});

export const {
  toggleSidebar,
  toggleDarkMode,
  addNotification,
  incrementUnreadMessages,
  resetUnreadMessages,
  removeNotification,
  setLoading,
  setSuppressNextDeviceStatusToast
} = uiSlice.actions;

export default uiSlice.reducer;