import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeNotification } from '../../redux/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { logout, getProfile } from '../../redux/slices/authSlice';
import api, { API_ENDPOINTS, API_BASE_URL } from '../../config/api';
import { Menu, Transition } from '@headlessui/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import userPresenceService from '../../services/userPresenceService';
import { useIsMobile } from '../../hooks/useMediaQuery';
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  LanguageIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
dayjs.extend(relativeTime);

const Navbar = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const unreadMessagesCount = useSelector((state) => state.ui.unreadMessagesCount);
  const isMobile = useIsMobile();
  // Force react to re-render when localStorage unread changes (in case redux missed)
  const [unreadSync, setUnreadSync] = useState(Number(localStorage.getItem('unreadMessages') || 0));
  useEffect(() => {
    const i = setInterval(() => {
      const v = Number(localStorage.getItem('unreadMessages') || 0);
      setUnreadSync(v);
    }, 1000);
    return () => clearInterval(i);
  }, []);
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const uiNotifications = useSelector((s) => s.ui.notifications);
  const [notifications, setNotifications] = useState([]);
  const [alertsUnread, setAlertsUnread] = useState(Number(localStorage.getItem('alertsUnread') || 0));
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fallbackAlerts, setFallbackAlerts] = useState([]);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);

  useEffect(() => {
    // Fetch profile to get latest avatar
    const load = async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.PROFILE);
        if (data?.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
          console.log('Profile avatar loaded:', data.avatarUrl);
        }
        // Also update user presence service with complete profile data
        if (user?._id && data) {
          userPresenceService.setCurrentUserData(data);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    };
    load();
  }, [user?._id]);

  // Initialize user presence service
  useEffect(() => {
    if (user?._id) {
      userPresenceService.init();
      userPresenceService.connect();
      
      // Set current user data and ensure they appear in online users list
      console.log('Setting current user data:', {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role
      });
      userPresenceService.setCurrentUserData(user);
      
      // Update online users count
      setTimeout(() => {
        if (userPresenceService.isInitialized) {
          const count = userPresenceService.getOnlineUsersCount();
          setOnlineUsersCount(count);
          console.log('Online users count:', count);
          console.log('Current user in presence service:', userPresenceService.onlineUsers?.get(user._id));
        }
      }, 100);
      
      // Listen for online users count changes
      const unsubscribe = userPresenceService.addListener('onlineUsersChanged', (count) => {
        setOnlineUsersCount(count);
      });
      
      return () => {
        unsubscribe();
        userPresenceService.cleanup();
      };
    }
  }, [user?._id]);

  // Update current user data whenever user object changes
  useEffect(() => {
    if (user?._id && userPresenceService.isInitialized) {
      console.log('User object changed, updating presence service:', {
        id: user._id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role
      });
      userPresenceService.setCurrentUserData(user);
      
      // Force update online users count
      setTimeout(() => {
        const count = userPresenceService.getOnlineUsersCount();
        setOnlineUsersCount(count);
        console.log('Updated online users count after user change:', count);
      }, 100);
    }
  }, [user]);

  // Fetch complete profile data after login to get avatarUrl
  useEffect(() => {
    if (user?._id && !user.avatarUrl) {
      console.log('Fetching complete profile data...');
      dispatch(getProfile()).then((result) => {
        console.log('Profile fetch result:', result);
        if (result.meta.requestStatus === 'fulfilled') {
          console.log('Profile fetched successfully, payload:', result.payload);
          console.log('Updated user object should now have avatarUrl');
        } else {
          console.error('Profile fetch failed:', result.error);
        }
      });
    }
  }, [user?._id, user?.avatarUrl, dispatch]);

  // Sync navbar notifications with UI toasts; show only active toasts count
  useEffect(() => {
    const locale = (localStorage.getItem('language') || 'en').toLowerCase();
    const items = (uiNotifications || []).map((n) => {
      if (n.type === 'device-status') {
        const name = n.deviceName || n.title || 'Device';
        const ip = n.ip ? ` (${n.ip})` : '';
        const originalStatus = n.status || '';
        const status = n.status ? t(`common.${n.status.toLowerCase()}`) : '';
        const timestamp = n.time || Date.now();
        const timeDiff = Date.now() - timestamp;
        const isRecent = timeDiff < 60000; // 60000 ms = 1 menit
        
        return {
          id: n.id,
          title: name,
          message: `${name}${ip} ${isRecent ? t('navbar.isNow', 'saat ini') + ' ' : ''}${status}`,
          time: timestamp,
          relative: dayjs(timestamp).locale(locale).fromNow(),
          status: originalStatus, // Menyimpan status asli untuk digunakan warna
          isRecent // Flag untuk menandai apakah notifikasi baru (< 1 menit)
        };
      }
      return {
        id: n.id,
        title: n.title || '',
        message: n.message || '',
        time: n.time || Date.now(),
        relative: dayjs(n.time || Date.now()).locale(locale).fromNow(),
      };
    });
    setNotifications(items);
    // follow toast count, fallback to persisted value if zero
    const count = items.length || Number(localStorage.getItem('alertsUnread') || 0);
    setAlertsUnread(count);
  }, [uiNotifications]);

  const handleOpenAlertsMenu = async () => {
    try { localStorage.setItem('alertsLastSeenTs', String(Date.now())); } catch {}
    // Reset badge only; biarkan list tampil saat menu dibuka
    setAlertsUnread(0);
    try { localStorage.setItem('alertsUnread', '0'); } catch {}

    // Jika belum ada notifikasi dari toast, fallback ambil 10 alert terbaru dari API
    if ((uiNotifications || []).length === 0) {
      try {
        const { data } = await api.get(API_ENDPOINTS.ALERTS);
        const list = Array.isArray(data?.data) ? data.data : [];
        const sorted = list
          .sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime())
          .slice(0, 5);
        const locale = (localStorage.getItem('language') || 'en').toLowerCase();
        const mapped = sorted.map((a) => {
          const name = a?.device?.name || a?.deviceName || a?.instance || a?.ip || 'Device';
          const ip = a?.device?.ip || a?.ip || a?.instance || '';
          const ns = String(a?.newStatus || a?.status || '').toUpperCase();
          const statusText = ns ? t(`common.${ns.toLowerCase()}`) : ns;
          const timestamp = a.timestamp || a.createdAt || Date.now();
          const timeDiff = Date.now() - new Date(timestamp).getTime();
          const isRecent = timeDiff < 60000; // 60000 ms = 1 menit
          
          return {
            id: a._id || `${name}-${ns}-${timestamp}`,
            title: name,
            message: ip ? 
              `${ip} ${isRecent ? t('navbar.isNow', 'saat ini') + ' ' : ''}${statusText}` : 
              `${isRecent ? t('navbar.isNow', 'saat ini') + ' ' : ''}${statusText}`,
            time: timestamp,
            relative: dayjs(timestamp).locale(locale).fromNow(),
            status: ns,
            isRecent // Flag untuk menandai apakah notifikasi baru (< 1 menit)
          };
        });
        setFallbackAlerts(mapped);
      } catch (e) {
        setFallbackAlerts([]);
      }
    }
  };

  const clearAlertsList = () => {
    try {
      (uiNotifications || []).forEach((n) => dispatch(removeNotification(n.id)));
    } catch {}
    setNotifications([]);
  };

  const resolveAvatar = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API_BASE_URL.replace(/\/api$/, '');
    return `${base}${url}`;
  };



  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'id' : 'en');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          {/* Sidebar toggle button - show on all devices */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="ml-4 flex items-center">
            <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">
              {t('app.shortName')}
            </span>
            <span className="hidden md:block ml-2 text-gray-600 dark:text-gray-300">
              {t('app.name')}
            </span>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
          >
            <div className="flex items-center">
              <LanguageIcon className="h-5 w-5" />
              <span className="ml-1 text-sm font-medium">{language.toUpperCase()}</span>
            </div>
          </button>
          
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
          
          {/* Online Users */}
          <Menu as="div" className="relative">
            <Menu.Button 
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
              aria-label={t('navbar.onlineUsers', 'Pengguna Online')}
            >
              <div className="relative">
                <UsersIcon className="h-5 w-5" />
                {/* Online users badge */}
                {onlineUsersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-success-500 text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {onlineUsersCount}
                  </span>
                )}
              </div>
            </Menu.Button>
            
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-3">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('navbar.onlineUsers', 'Pengguna Online')} ({onlineUsersCount})
                    </h3>
                  </div>
                  
                  {onlineUsersCount > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userPresenceService.getOnlineUsersDetails().map((onlineUser, index) => (
                        <Menu.Item key={onlineUser.id}>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                if (onlineUser.id !== user?._id) {
                                  navigate(`/chat?user=${onlineUser.id}`);
                                }
                              }}
                              disabled={onlineUser.id === user?._id}
                              className={`${
                                active && onlineUser.id !== user?._id 
                                  ? 'bg-gray-100 dark:bg-gray-600' 
                                  : ''
                              } ${
                                onlineUser.id === user?._id 
                                  ? 'cursor-default opacity-60' 
                                  : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                              } flex w-full items-center space-x-2 p-2 rounded-md bg-gray-50 dark:bg-gray-700 transition-colors`}
                            >
                                                                                        <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
                              {onlineUser.avatarUrl ? (
                                <img
                                  src={resolveAvatar(onlineUser.avatarUrl)}
                                  alt="avatar"
                                  className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-medium">
                                  {(onlineUser.name || onlineUser.username || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              

                                                          <div className="flex flex-col text-left">
                               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                 {onlineUser.id === user?._id ? t('navbar.you', 'Anda') : (onlineUser.name || onlineUser.username || `${t('common.user', 'User')} ${onlineUser.id.slice(-4)}`)}
                               </span>
                               {onlineUser.id !== user?._id && onlineUser.role && (
                                 <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                   {t(`common.role.${onlineUser.role.toLowerCase()}`, onlineUser.role)}
                                 </span>
                               )}
                               {onlineUser.id === user?._id && onlineUser.role && (
                                 <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                   {t(`common.role.${onlineUser.role.toLowerCase()}`, onlineUser.role)}
                                 </span>
                               )}
                             </div>
                              {onlineUser.id !== user?._id && (
                                <ChatBubbleLeftRightIcon className="ml-auto h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                                     ) : (
                     <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                       {t('navbar.noOnlineUsers', 'Tidak ada pengguna online')}
                     </div>
                   )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button onClick={handleOpenAlertsMenu} className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none">
              <div className="relative">
                <BellIcon className="h-5 w-5" />
                {/* Alerts badge */}
                {alertsUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {alertsUnread}
                  </span>
                )}
              </div>
            </Menu.Button>
            
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-2">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.recentEvents')}
                    </h3>
                  </div>
                  
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <Menu.Item key={index}>
                        {({ active }) => (
                          <button
                            onClick={() => navigate('/alerts')}
                            className={`w-full text-left py-2 px-3 rounded-md ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </div>
                              {notification.status && (
                                <div className={`h-2.5 w-2.5 rounded-full ${
                                  notification.status === 'UP' 
                                    ? 'bg-green-500' 
                                    : notification.status === 'DOWN' 
                                      ? 'bg-red-500' 
                                      : 'bg-gray-400'
                                }`}></div>
                              )}
                            </div>
                            <div className={`text-xs ${
                              notification.status === 'UP' 
                                ? 'text-green-700 dark:text-green-400' 
                                : notification.status === 'DOWN' 
                                  ? 'text-red-700 dark:text-red-400' 
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {notification.message}
                            </div>
                            {notification.relative && (
                              <div className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{notification.relative}</div>
                            )}
                          </button>
                        )}
                      </Menu.Item>
                    ))
                  ) : fallbackAlerts.length > 0 ? (
                    fallbackAlerts.map((notification, index) => (
                      <Menu.Item key={index}>
                        {({ active }) => (
                          <button
                            onClick={() => navigate('/alerts')}
                            className={`w-full text-left py-2 px-3 rounded-md ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </div>
                              {notification.status && (
                                <div className={`h-2.5 w-2.5 rounded-full ${
                                  notification.status === 'UP' 
                                    ? 'bg-green-500' 
                                    : notification.status === 'DOWN' 
                                      ? 'bg-red-500' 
                                      : 'bg-gray-400'
                                }`}></div>
                              )}
                            </div>
                            <div className={`text-xs ${
                              notification.status === 'UP' 
                                ? 'text-green-700 dark:text-green-400' 
                                : notification.status === 'DOWN' 
                                  ? 'text-red-700 dark:text-red-400' 
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {notification.message}
                            </div>
                            {notification.relative && (
                              <div className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{notification.relative}</div>
                            )}
                          </button>
                        )}
                      </Menu.Item>
                    ))
                  ) : (
                    <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {t('dashboard.noEvents')}
                    </div>
                  )}
                  {notifications.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                      <button onClick={clearAlertsList} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">{t('common.clear', 'Clear')}</button>
                    </div>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>


          
          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none">
              <div className="flex items-center space-x-2">
                {avatarUrl ? (
                  <img
                    src={resolveAvatar(avatarUrl)}
                    alt="avatar"
                    className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300">
                    {user?.username?.charAt(0).toUpperCase() || <UserCircleIcon className="h-6 w-6" />}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.username || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role || 'user'}
                  </div>
                </div>
              </div>
            </Menu.Button>
            
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleProfileClick}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <UserCircleIcon className="mr-3 h-5 w-5" />
                        {t('auth.profile')}
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleChatClick}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <span className="flex items-center">
                          <ChatBubbleLeftRightIcon className="mr-3 h-5 w-5" />
                          Chat
                        </span>
                        {unreadMessagesCount > 0 && (
                          <span className="ml-2 bg-red-600 text-white text-[11px] rounded-full h-5 min-w-5 px-2 flex items-center justify-center">
                            {unreadMessagesCount}
                          </span>
                        )}
                      </button>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSettingsClick}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <Cog6ToothIcon className="mr-3 h-5 w-5" />
                        {t('settings.title')}
                      </button>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        {t('auth.logout')}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;