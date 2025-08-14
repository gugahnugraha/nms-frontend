import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SunIcon, MoonIcon, LanguageIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => changeLanguage(language === 'en' ? 'id' : 'en');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
          title={language === 'en' ? 'Switch to Indonesian' : 'Ganti ke Bahasa Inggris'}
        >
          <div className="flex items-center gap-1">
            <LanguageIcon className="h-4 w-4" />
            <span className="text-xs font-semibold">{(language || 'en').toUpperCase()}</span>
          </div>
        </button>
        
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Login Form Container */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-blue-200/70">
            © {new Date().getFullYear()} Network Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;