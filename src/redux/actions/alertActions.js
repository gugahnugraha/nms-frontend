import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const getAlerts = createAsyncThunk('alerts/getAll', async (_, thunkAPI) => {
  try {
    const res = await api.get('/alerts');
    return res.data?.data || [];
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message || 'Failed to fetch alerts');
  }
});

export const acknowledgeAlert = createAsyncThunk('alerts/ack', async (id, thunkAPI) => {
  try {
    const res = await api.post(`/alerts/${id}/ack`);
    return res.data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message || 'Failed to acknowledge alert');
  }
});


