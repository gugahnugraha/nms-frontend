import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';
import api, { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'user',
    nik: '',
    isActive: true
  });
  const [currentAdmin, setCurrentAdmin] = useState({ role: 'admin' }); // Replace with actual auth context
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);

  // Fetch users from API (admin only)
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(API_ENDPOINTS.USERS);
        const list = (data && data.data) || [];
        // Normalisasi field untuk UI lama
        const normalized = list.map(u => ({
          id: u._id,
          username: u.username || '',
          email: u.email || '',
          fullName: u.name || u.fullName || u.username || u.email,
          role: u.role || 'user',
          nik: u.nik || '',
          isActive: u.isActive !== false,
          lastLogin: u.lastLogin || u.updatedAt,
          createdAt: u.createdAt,
          avatarUrl: u.avatarUrl || ''
        }));
        setUsers(normalized);
        setFilteredUsers(normalized);
      } catch (err) {
        console.error(err);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.nik || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesStatus = statusFilter ? user.isActive === (statusFilter === 'active') : true;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleOpenForm = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        nik: user.nik || '',
        isActive: user.isActive
      });
    } else {
      setCurrentUser(null);
      setFormData({
        username: '',
        email: '',
        fullName: '',
        role: 'user',
        nik: '',
        isActive: true
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentUser(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'user',
      nik: '',
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        // Update
        const { data } = await api.put(API_ENDPOINTS.USER(currentUser.id), {
          name: formData.fullName,
          email: formData.email,
          username: formData.username,
          role: formData.role,
          nik: formData.nik,
          isActive: formData.isActive,
        });
      } else {
        // Create with default password from localization
        const { data } = await api.post(API_ENDPOINTS.USERS, {
          name: formData.fullName,
          email: formData.email,
          username: formData.username,
          password: t('users.defaultPassword', 'password321'),
          role: formData.role,
          nik: formData.nik,
          isActive: formData.isActive,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      handleCloseForm();
      // refresh list
      try {
        const { data } = await api.get(API_ENDPOINTS.USERS);
        const list = (data && data.data) || [];
        const normalized = list.map(u => ({
          id: u._id,
          username: u.username || '',
          email: u.email || '',
          fullName: u.name || u.fullName || u.username || u.email,
          role: u.role || 'user',
          nik: u.nik || '',
          isActive: u.isActive !== false,
          lastLogin: u.lastLogin || u.updatedAt,
          createdAt: u.createdAt,
        }));
        setUsers(normalized);
        setFilteredUsers(normalized);
      } catch (e2) {}
    }
  };

  const handleDelete = (user) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(API_ENDPOINTS.USER(currentUser.id));
      setUsers(prev => prev.filter(user => user.id !== currentUser.id));
      setFilteredUsers(prev => prev.filter(user => user.id !== currentUser.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
    }
  };

  const toggleUserStatus = async (userId, newVal) => {
    try {
      const user = users.find(u => u.id === userId);
      const nextVal = typeof newVal === 'boolean' ? newVal : !user?.isActive;
      await api.patch(API_ENDPOINTS.USER_STATUS(userId), { isActive: nextVal });
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isActive: nextVal } : u)));
      setFilteredUsers(prev => prev.map(u => (u.id === userId ? { ...u, isActive: nextVal } : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: ShieldCheckIcon },
      user: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: UserIcon }
    };
    const config = roleConfig[role] || roleConfig.user;
    const IconComponent = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {t(`users.roles.${role}`)}
      </span>
    );
  };

  const resolveAvatar = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API_BASE_URL.replace(/\/api$/, '');
    return `${base}${url}`;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <CheckCircleIcon className="w-3 h-3" />
        {t('users.status.active')}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <XCircleIcon className="w-3 h-3" />
        {t('users.status.inactive')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {t('users.title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                {t('users.description')}
              </p>
            </div>
            
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.stats.total')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.stats.active')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.stats.admins')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.stats.users', 'Users')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('users.filters.search')}
              </label>
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('users.filters.searchPlaceholder')}
                size="md"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('users.filters.role')}
              </label>
              <Select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)} 
                size="md" 
                className="w-full"
              >
                <option value="">{t('users.filters.allRoles')}</option>
                <option value="admin">{t('users.roles.admin')}</option>
                <option value="user">{t('users.roles.user')}</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('users.filters.status')}
              </label>
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                size="md" 
                className="w-full"
              >
                <option value="">{t('users.filters.allStatus')}</option>
                <option value="active">{t('users.status.active')}</option>
                <option value="inactive">{t('users.status.inactive')}</option>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
                variant="secondary"
                size="md"
                className="w-full"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                {t('users.filters.clear')}
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table - Mobile Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {filteredUsers.map((user) => (
              <motion.div 
                key={user.id}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 h-12 w-12">
                    {user.avatarUrl ? (
                      <img
                        src={resolveAvatar(user.avatarUrl)}
                        alt="avatar"
                        className="h-12 w-12 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.fullName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{user.username}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.isActive)}
                  {user.nik && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('users.form.nik')}: {user.nik}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {t('users.table.lastLogin')}: {formatDate(user.lastLogin)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleOpenForm(user)}
                    variant="secondary"
                    size="sm"
                    className="!p-2 flex-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span className="ml-1">{t('common.edit')}</span>
                  </Button>
                  <Button
                    onClick={() => toggleUserStatus(user.id)}
                    variant={user.isActive ? "warning" : "success"}
                    size="sm"
                    className="!p-2"
                  >
                    {user.isActive ? (
                      <XCircleIcon className="w-4 h-4" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDelete(user)}
                    variant="danger"
                    size="sm"
                    className="!p-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                  {currentAdmin.role === 'admin' && (
                    <Button
                      onClick={() => { setResetUser(user); setResetDialogOpen(true); }}
                      variant="warning"
                      size="sm"
                      className="!p-2"
                    >
                      <CogIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.table.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.table.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.form.nik')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.table.lastLogin')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatarUrl ? (
                            <img
                              src={resolveAvatar(user.avatarUrl)}
                              alt="avatar"
                              className="h-10 w-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.nik || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleOpenForm(user)}
                          variant="secondary"
                          size="sm"
                          className="!p-2"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => toggleUserStatus(user.id)}
                          variant={user.isActive ? "warning" : "success"}
                          size="sm"
                          className="!p-2"
                        >
                          {user.isActive ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDelete(user)}
                          variant="danger"
                          size="sm"
                          className="!p-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                        {currentAdmin.role === 'admin' && (
                          <Button
                            onClick={() => { setResetUser(user); setResetDialogOpen(true); }}
                            variant="warning"
                            size="sm"
                            className="!p-2"
                          >
                            <CogIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('users.noResults.title')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('users.noResults.description')}
              </p>
            </div>
          )}
        </div>

        {/* User Form Dialog */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="user-dialog" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseForm}></div>
              
              {/* Center dialog vertically */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              {/* Dialog panel */}
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:p-6 p-4">
                <div className="sm:flex sm:items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-white">
                      {currentUser ? t('users.edit.title') : t('users.add.title')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {currentUser ? t('users.edit.description', { name: currentUser.fullName }) : t('users.add.description')}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={handleCloseForm}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.form.username')}
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.form.email')}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.form.fullName')}
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.form.role')}
                      </label>
                      <Select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        size="md"
                        className="w-full"
                      >
                        <option value="user">{t('users.roles.user')}</option>
                        <option value="admin">{t('users.roles.admin')}</option>
                      </Select>
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.form.nik')}
                      </label>
                      <input
                        type="text"
                        value={formData.nik}
                        onChange={(e) => setFormData({...formData, nik: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="user-status-active"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="user-status-active" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      {t('users.form.isActive')}
                    </label>
                  </div>
                  
                  <div className="mt-5 sm:mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                      <Button
                        type="button"
                        onClick={handleCloseForm}
                        variant="secondary"
                        size="md"
                        className="sm:w-auto"
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="sm:w-auto"
                      >
                        {currentUser ? t('common.update') : t('common.create')}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {/* Reset Password Dialog */}
        {resetDialogOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="reset-password-dialog" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setResetDialogOpen(false)}></div>
              
              {/* Center dialog vertically */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              {/* Dialog panel */}
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full sm:p-6 p-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 sm:mx-0 sm:h-10 sm:w-10">
                    <CogIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Reset Password
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Password user <span className="font-bold">{resetUser?.username}</span> akan direset ke <span className="font-bold">password321</span>.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <Button
                      onClick={() => setResetDialogOpen(false)}
                      variant="secondary"
                      size="md"
                      className="sm:w-auto"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          await api.post(API_ENDPOINTS.RESET_PASSWORD, { userId: resetUser?.id });
                          toast.success(t('users.reset.success'), { containerId: 'default' });
                        } catch (e) {
                          console.error(e);
                          toast.error(t('users.reset.failed'), { containerId: 'default' });
                        } finally {
                          setResetDialogOpen(false);
                        }
                      }}
                      variant="warning"
                      size="md"
                      className="sm:w-auto"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="delete-user-dialog" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsDeleteDialogOpen(false)}></div>
              
              {/* Center dialog vertically */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              {/* Dialog panel */}
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full sm:p-6 p-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {t('users.delete.title')}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('users.delete.message', { username: currentUser?.username })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <Button
                      onClick={() => setIsDeleteDialogOpen(false)}
                      variant="secondary"
                      size="md"
                      className="sm:w-auto"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={confirmDelete}
                      variant="danger"
                      size="md"
                      className="sm:w-auto"
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
