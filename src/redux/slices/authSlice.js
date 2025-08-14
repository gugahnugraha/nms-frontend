import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
};

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, userData);
      
      if (response.data) {
        // Menyimpan token dan data user
        const { token, refreshToken, user } = response.data;
        const userData = {
          ...user,
          token,
          refreshToken
        };
        localStorage.setItem('user', JSON.stringify(userData));
        // Audit log to localStorage (optional client-side)
        try {
          const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
          logs.push({ type: 'login', userId: user._id, username: user.username, time: new Date().toISOString() });
          localStorage.setItem('auditLogs', JSON.stringify(logs));
        } catch {}
        return userData;
      }
      
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  // Log logout time to localStorage for auditing (can be sent to server later)
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      logs.push({ type: 'logout', userId: u._id, username: u.username, time: new Date().toISOString() });
      localStorage.setItem('auditLogs', JSON.stringify(logs));
    }
  } catch {}
  localStorage.removeItem('user');
});

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user profile
export const getProfile = createAsyncThunk(
  'auth/profile',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(API_ENDPOINTS.PROFILE, config);
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.user = action.payload;
        // Identify socket user and join groups after successful login
        try {
          const { getSocket } = require('../../services/socketService');
          const { default: api, API_ENDPOINTS } = require('../../config/api');
          const s = getSocket();
          s?.emit?.('identify', action.payload._id);
          // Join groups
          (async () => {
            try {
              const res = await api.get(API_ENDPOINTS.GROUPS_MINE);
              const groups = res.data?.data || [];
              groups.forEach((g) => s?.emit?.('joinGroup', g._id));
            } catch {}
          })();
        } catch {}
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;