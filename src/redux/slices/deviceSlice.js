import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS } from '../../config/api';

const initialState = {
  devices: [],
  device: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
};

// Get all devices
export const getDevices = createAsyncThunk(
  'devices/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await api.get(API_ENDPOINTS.DEVICES, config);
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

// Get device by ID
export const getDeviceById = createAsyncThunk(
  'devices/getById',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await api.get(API_ENDPOINTS.DEVICE(id), config);
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

// Create new device
export const createDevice = createAsyncThunk(
  'devices/create',
  async (deviceData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await api.post(API_ENDPOINTS.DEVICES, deviceData, config);
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

// Update device
export const updateDevice = createAsyncThunk(
  'devices/update',
  async ({ id, deviceData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await api.put(API_ENDPOINTS.DEVICE(id), deviceData, config);
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

// Delete device
export const deleteDevice = createAsyncThunk(
  'devices/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await api.delete(API_ENDPOINTS.DEVICE(id), config);
      return id;
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

// Ping device
export const pingDevice = createAsyncThunk(
  'devices/ping',
  async (id, thunkAPI) => {
    try {
      const response = await api.post(API_ENDPOINTS.PING_DEVICE(id));
      
      if (response.data.success) {
        const result = response.data.data;
        thunkAPI.dispatch(setDeviceStatus({
          id: result.deviceId,
          status: result.status
        }));
        return result;
      }
      
      return thunkAPI.rejectWithValue('Ping failed');
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

export const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    reset: (state) => initialState,
    setDeviceStatus: (state, action) => {
      const { id, status } = action.payload;
      const device = state.devices.find((d) => d._id === id);
      if (device) {
        device.status = status;
      }
      // Jangan ubah isLoading, isError, atau isSuccess saat update status
      // Ini mencegah loading spinner muncul saat socket update
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDevices.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(getDevices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Memastikan kita mengambil array devices dari response.data
        state.devices = action.payload?.data || [];
      })
      .addCase(getDevices.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.devices = []; // Reset devices ke array kosong saat error
      })
      .addCase(getDeviceById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getDeviceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.device = action.payload?.data;
      })
      .addCase(getDeviceById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createDevice.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.devices.push(action.payload);
      })
      .addCase(createDevice.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.devices = state.devices.map(device => 
          device._id === action.payload._id ? action.payload : device
        );
        state.device = action.payload;
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.devices = state.devices.filter(device => device._id !== action.payload);
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(pingDevice.pending, (state) => {
        // Don't set isLoading to true for ping requests
        // This prevents the UI from showing loading spinner during ping operations
        // state.isLoading = true;
      })
      .addCase(pingDevice.fulfilled, (state, action) => {
        // Don't change isLoading state for ping requests
        // state.isLoading = false;
        state.isSuccess = true;
        
        // Update device status if ping result contains alive status
        if (action.payload && action.payload.alive !== undefined) {
          const deviceId = action.meta.arg; // Get the device ID from the action
          const deviceIndex = state.devices.findIndex(device => device._id === deviceId);
          
          if (deviceIndex !== -1) {
            // Update device status based on ping result
            const newStatus = action.payload.alive ? 'UP' : 'DOWN';
            
            // Only update if status changed
            if (state.devices[deviceIndex].status !== newStatus) {
              console.log(`Updating device ${deviceId} status from ${state.devices[deviceIndex].status} to ${newStatus}`);
              state.devices[deviceIndex].status = newStatus;
              
              // Also update the current device if it's the same one
              if (state.device && state.device._id === deviceId) {
                state.device.status = newStatus;
              }
            }
          }
        }
      })
      .addCase(pingDevice.rejected, (state, action) => {
        // Don't change isLoading state for ping requests
        // state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, setDeviceStatus } = deviceSlice.actions;
export default deviceSlice.reducer;