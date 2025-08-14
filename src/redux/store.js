import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import deviceReducer from './slices/deviceSlice';
import uiReducer from './slices/uiSlice';
import alertsReducer from './reducers/alertReducer';
import snmpReducer from './slices/snmpSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    devices: deviceReducer,
    ui: uiReducer,
    alerts: alertsReducer,
    snmp: snmpReducer,
  }
});


