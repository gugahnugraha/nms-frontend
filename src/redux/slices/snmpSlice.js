import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS } from '../../config/api';

const initialState = {
  deviceData: null,
  deviceTimeSeries: [],
  isLoading: false,
  isLoadingTimeSeries: false,
  error: null,
};

export const getDeviceSnmpData = createAsyncThunk('snmp/getDeviceData', async (deviceId, thunkAPI) => {
  try {
    const res = await api.get(API_ENDPOINTS.SNMP_DEVICE(deviceId));
    return res.data?.data || null;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message || 'Failed to fetch device SNMP data');
  }
});

export const getDeviceTimeSeries = createAsyncThunk('snmp/getDeviceTimeSeries', async ({ deviceId, params }, thunkAPI) => {
  try {
    const res = await api.get(API_ENDPOINTS.SNMP_DEVICE_TIMESERIES(deviceId), { params: params || {} });
    return res.data?.data || [];
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message || 'Failed to fetch device time series');
  }
});

const snmpSlice = createSlice({
  name: 'snmp',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDeviceSnmpData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDeviceSnmpData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deviceData = action.payload;
      })
      .addCase(getDeviceSnmpData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getDeviceTimeSeries.pending, (state) => {
        state.isLoadingTimeSeries = true;
        state.error = null;
      })
      .addCase(getDeviceTimeSeries.fulfilled, (state, action) => {
        state.isLoadingTimeSeries = false;
        state.deviceTimeSeries = action.payload;
      })
      .addCase(getDeviceTimeSeries.rejected, (state, action) => {
        state.isLoadingTimeSeries = false;
        state.error = action.payload;
      });
  }
});

export default snmpSlice.reducer;


