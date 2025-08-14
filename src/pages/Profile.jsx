import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import api, { API_ENDPOINTS } from '../config/api';
import Button from '../components/ui/Button';

const Profile = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState({ name: '', email: '', username: '', nik: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.PROFILE);
        setProfile({ name: data.name || '', email: data.email || '', username: data.username || '', nik: data.nik || '', avatarUrl: data.avatarUrl || '' });
      } catch (e) {}
    };
    load();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      if (newPassword && newPassword !== confirmPassword) {
        setModalTitle(t('profile.saveErrorTitle'));
        setModalMessage(t('profile.passwordMismatch'));
        setModalError(true);
        setModalOpen(true);
        setSaving(false);
        return;
      }
      await api.put(API_ENDPOINTS.UPDATE_PROFILE, { 
        name: profile.name, 
        oldPassword: oldPassword || undefined, 
        newPassword: newPassword || undefined 
      });
      setModalTitle(t('profile.saveSuccessTitle'));
      setModalMessage(t('profile.saveSuccess'));
      setModalError(false);
      setModalOpen(true);
    } catch (e) {}
    setSaving(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    setUploading(true);
    try {
      const { data } = await api.post(API_ENDPOINTS.UPLOAD_AVATAR, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data?.data?.avatarUrl) {
        setProfile((p) => ({ ...p, avatarUrl: data.data.avatarUrl }));
      }
    } catch (e) {} finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('auth.profile') || 'Profile'}</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={profile.avatarUrl ? profile.avatarUrl : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name || profile.username || 'U')}
              alt="avatar"
              className="h-20 w-20 rounded-full object-cover border border-gray-300 dark:border-gray-600"
            />
            <div className="w-full text-center sm:text-left">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t('profile.avatar')}</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={onAvatarChange} 
                disabled={uploading}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-300"
              />
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('profile.email')}</label>
              <input 
                disabled 
                value={profile.email} 
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('profile.username')}</label>
              <input 
                disabled 
                value={profile.username} 
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('profile.nik')}</label>
              <input 
                disabled 
                value={profile.nik} 
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('common.name')}</label>
              <input 
                value={profile.name} 
                onChange={(e)=>setProfile({...profile, name: e.target.value})} 
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('profile.changePassword')}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.password')} (lama)</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e)=>setOldPassword(e.target.value)} 
                  placeholder={t('profile.leaveBlank')} 
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.password')} (baru)</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e)=>setNewPassword(e.target.value)} 
                  placeholder={t('profile.leaveBlank')} 
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('profile.confirm')}</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e)=>setConfirmPassword(e.target.value)} 
                  placeholder={t('profile.leaveBlank')} 
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              variant="primary" 
              onClick={onSave} 
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? t('settings.actions.saving') : t('common.save')}
            </Button>
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div 
              className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 shadow-lg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 
                  id="modal-title"
                  className={`text-lg font-semibold ${modalError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                >
                  {modalTitle}
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{modalMessage}</p>
              <div className="mt-5 sm:mt-4 flex justify-end gap-2">
                <Button 
                  variant="primary" 
                  onClick={()=>setModalOpen(false)}
                  className="w-full sm:w-auto"
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;


