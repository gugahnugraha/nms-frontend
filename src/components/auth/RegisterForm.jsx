import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserIcon,
  KeyIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { register } from '../../redux/slices/authSlice';

const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nik: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { username, email, password, confirmPassword, nik, agreeTerms } = formData;
  const { fullName } = formData;

  const validateForm = () => {
    // Full Name validation
    if (!fullName.trim()) {
      errors.fullName = t('auth.fullNameRequired', 'Nama Lengkap wajib diisi');
    }
    const errors = {};

    // Username validation
    if (!username.trim()) {
      errors.username = t('auth.usernameRequired', 'Username is required');
    } else if (username.length < 3) {
      errors.username = t('auth.usernameTooShort', 'Username must be at least 3 characters');
    }

    // Email validation
    if (!email.trim()) {
      errors.email = t('auth.emailRequired', 'Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('auth.emailInvalid', 'Please enter a valid email');
    }

    // NIK validation
    if (!nik.trim()) {
      errors.nik = t('auth.nikRequired', 'NIK is required');
    } else if (!/^\d{16}$/.test(nik)) {
      errors.nik = t('auth.nikInvalid', 'NIK must be exactly 16 digits');
    }

    // Password validation
    if (!password) {
      errors.password = t('auth.passwordRequired', 'Password is required');
    } else if (password.length < 6) {
      errors.password = t('auth.passwordTooShort', 'Password must be at least 6 characters');
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordsDoNotMatch', 'Passwords do not match');
    }

    // Terms validation
    if (!agreeTerms) {
      errors.agreeTerms = t('auth.termsRequired', 'You must agree to terms and conditions');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const userData = {
        name: fullName,
        username,
        email,
        password,
        nik
      };
      dispatch(register(userData))
        .unwrap()
        .then(() => {
          navigate('/login');
        })
        .catch((error) => {
          console.error('Registration failed:', error);
        });
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4 sm:px-6 lg:px-8">
  <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        {/* App Logo and Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary-500 dark:text-primary-400">
            {t('app.name', 'Network Monitoring System')}
          </h1>
          <p className="mt-2 text-sm text-primary-400 dark:text-primary-300">
            {t('auth.registerDescription', 'Create a new account to get started')}
          </p>
        </div>
        
        {/* Register Card */}
        <div className="relative overflow-hidden backdrop-blur-lg bg-white dark:bg-gray-900/80 border border-gray-300 dark:border-gray-800/50 rounded-2xl shadow-2xl">
          {/* Card Content - Two Columns */}
          <div className="relative z-10 p-6 sm:p-8">
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-5" onSubmit={onSubmit}>
              {/* Nama Lengkap Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t('auth.fullName', 'Nama Lengkap')}
                </label>
                <div className="relative">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className={`block w-full pl-3 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border ${
                      validationErrors.fullName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700/50'
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[220px] sm:min-w-[260px] lg:min-w-[320px]`}
                    placeholder={t('auth.fullNamePlaceholder', 'Masukkan nama lengkap Anda')}
                    value={fullName}
                    onChange={onChange}
                  />
                  {validationErrors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.fullName}</p>
                  )}
                </div>
              </div>
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t('auth.username', 'Username')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border ${
                      validationErrors.username ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700/50'
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[220px] sm:min-w-[260px] lg:min-w-[320px]`}
                    placeholder={t('auth.usernamePlaceholder', 'Enter your username')}
                    value={username}
                    onChange={onChange}
                  />
                  {validationErrors.username && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.username}</p>
                  )}
                </div>
              </div>
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t('auth.email', 'Email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border ${
                      validationErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700/50'
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[220px] sm:min-w-[260px] lg:min-w-[320px]`}
                    placeholder={t('auth.emailPlaceholder', 'Enter your email')}
                    value={email}
                    onChange={onChange}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
              </div>

              {/* NIK Field */}
              <div>
                <label htmlFor="nik" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t('auth.nik', 'NIK (16 Digit)')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <IdentificationIcon className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                  </div>
                  <input
                    id="nik"
                    name="nik"
                    type="text"
                    required
                    maxLength={16}
                    pattern="[0-9]{16}"
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border ${
                      validationErrors.nik ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700/50'
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[220px] sm:min-w-[260px] lg:min-w-[320px]`}
                    placeholder={t('auth.nikPlaceholder', 'Enter your 16-digit NIK')}
                    value={nik}
                    onChange={onChange}
                  />
                  {validationErrors.nik && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.nik}</p>
                  )}
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border ${
                      validationErrors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700/50'
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[220px] sm:min-w-[260px] lg:min-w-[320px]`}
                    placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                    value={password}
                    onChange={onChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
                  )}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t('auth.confirmPassword', 'Confirm Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border ${
                      validationErrors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700/50'
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[220px] sm:min-w-[260px] lg:min-w-[320px]`}
                    placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
                    value={confirmPassword}
                    onChange={onChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              {/* Terms and Conditions */}
              {/* Terms and Conditions at the bottom */}
              <div className="col-span-1 sm:col-span-2 flex items-center pt-2">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  className={`h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 ${
                    validationErrors.agreeTerms ? 'border-red-500' : ''
                  }`}
                  checked={agreeTerms}
                  onChange={onChange}
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.agreeTerms', 'I agree to the')} <a href="/terms" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">{t('auth.terms', 'Terms and Conditions')}</a>
                </label>
              </div>
              {validationErrors.agreeTerms && (
                <p className="col-span-1 sm:col-span-2 mt-1 text-sm text-red-500">{validationErrors.agreeTerms}</p>
              )}
              
              {/* Error Message */}
              {isError && (
                <div className="col-span-1 sm:col-span-2 rounded-lg bg-red-500/20 border border-red-500/30 p-3 flex items-start">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="ml-3 text-sm text-red-200">{message}</p>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="col-span-1 sm:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 flex justify-center items-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      {t('auth.registering', 'Registering...')}
                    </>
                  ) : (
                    t('auth.register', 'Register')
                  )}
                </button>
              </div>
              
              {/* Login Link */}
              <div className="col-span-1 sm:col-span-2 flex justify-center mt-4 space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('auth.haveAccount', 'Already have an account?')}</span>
                <a 
                  href="/login" 
                  className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
                >
                  {t('auth.login', 'Sign in')}
                </a>
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
            &copy; {new Date().getFullYear()} {t('app.copyright', 'Network Monitoring System. All rights reserved.')}
          </p>
          <div className="mt-4">
            <a 
              href="https://github.com/gugahnugraha" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="h-4 w-4 mr-1" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              gugahnugraha
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
