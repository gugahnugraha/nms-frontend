import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import NetworkTopology from './pages/NetworkTopology';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DeviceMonitoring from './pages/DeviceMonitoring';
import Collector from './pages/Collector';
import About from './pages/About';
import NotFound from './pages/NotFound';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { removeNotification } from './redux/slices/uiSlice';
import soundNotification from './utils/soundUtils';

const App = () => {
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.ui.notifications);
  const dispatch = useDispatch();

  // Show toast for every new notification
  useEffect(() => {
    if (!notifications.length) return;
    const latest = notifications[notifications.length - 1];
    if (latest) {
      // Normalize toast level
      const rawLevel = latest.notifType || latest.severity || latest.level || latest.type || 'info';
      const method = rawLevel === 'warning' ? 'warn' : rawLevel;
      const supported = ['success', 'error', 'info', 'warn'];
      const toastMethod = supported.includes(method) ? method : 'info';
      
      // Play sound notification based on type
      if (toastMethod === 'success') {
        soundNotification.playSuccess();
      } else if (toastMethod === 'error') {
        soundNotification.playError();
      } else if (toastMethod === 'warn') {
        soundNotification.playWarning();
      } else {
        soundNotification.playInfo();
      }
      
      const opts = {
        toastId: latest.id,
        autoClose: (latest.type === 'error' || toastMethod === 'error') ? 7000 : 5000,
        type: toastMethod === 'warn' ? 'warning' : toastMethod,
      };
      // route chat notifications to top-right container
      if (latest?.source === 'chat') {
        toast[toastMethod](latest.message, { ...opts, containerId: 'chat' });
      } else {
        toast[toastMethod](latest.message, { ...opts, containerId: 'default' });
      }
      // Remove notification from redux after shown
      dispatch(removeNotification(latest.id));
    }
  }, [notifications, dispatch]);
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };
  
  // Admin route component (untuk penggunaan di masa depan)
  /* const AdminRoute = ({ children }) => {
    if (!user || user.role !== 'admin') {
      return <Navigate to="/" />;
    }
    return children;
  }; */
  
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="devices" element={<Devices />} />
              <Route path="devices/:id" element={<DeviceDetail />} />
              <Route path="monitoring" element={<DeviceMonitoring />} />
              <Route path="topology" element={<NetworkTopology />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={<Users />} />
              <Route path="profile" element={<Profile />} />
              <Route path="chat" element={<Chat />} />
              <Route path="collector" element={<Collector />} />
              <Route path="about" element={<About />} />
              {/* Add more routes here */}
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          containerId="default"
        />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          containerId="chat"
        />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;