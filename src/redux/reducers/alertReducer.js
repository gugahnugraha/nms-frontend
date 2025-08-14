import { createSlice } from '@reduxjs/toolkit';
import { getAlerts, acknowledgeAlert } from '../actions/alertActions';

const initialState = {
  alerts: [],
  loading: false,
  error: null,
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(getAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const index = state.alerts.findIndex((alert) => alert._id === action.payload._id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
      });
  },
});

export default alertSlice.reducer;