import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import sessionService from '../services/sessionService';

const SessionWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkSessionExpiry = () => {
      if (sessionService.isSessionExpiringSoon()) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.token) {
          try {
            // Decode JWT token to get exact expiry time
            const payload = JSON.parse(atob(user.token.split('.')[1]));
            const expiryTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expiryTime - currentTime;
            
            if (timeUntilExpiry > 0 && timeUntilExpiry < (10 * 60 * 1000)) { // Less than 10 minutes
              setTimeLeft(Math.ceil(timeUntilExpiry / 1000 / 60)); // Convert to minutes
              setShowWarning(true);
              
              // Show toast warning
              toast.warning(
                `Session Anda akan berakhir dalam ${Math.ceil(timeUntilExpiry / 1000 / 60)} menit. Silakan refresh halaman atau login ulang.`,
                {
                  autoClose: false,
                  toastId: 'session-warning',
                  position: 'top-center'
                }
              );
            }
          } catch (error) {
            console.error('Error checking session expiry:', error);
          }
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkSessionExpiry, 60 * 1000);
    
    // Initial check
    checkSessionExpiry();

    return () => {
      clearInterval(interval);
      toast.dismiss('session-warning');
    };
  }, []);

  const handleRefreshSession = async () => {
    try {
      await sessionService.refreshToken();
      setShowWarning(false);
      toast.success('Session berhasil diperpanjang!', { toastId: 'session-refreshed' });
    } catch (error) {
      toast.error('Gagal memperpanjang session. Silakan login ulang.', { toastId: 'session-refresh-failed' });
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  };

  const handleLogout = () => {
    setShowWarning(false);
    toast.dismiss('session-warning');
    // Trigger logout
    window.location.href = '/login';
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="font-medium">
            ⚠️ Session Anda akan berakhir dalam {timeLeft} menit
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshSession}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Perpanjang Session
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;
