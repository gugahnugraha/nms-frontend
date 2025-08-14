import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-purple-500/10 dark:from-indigo-500/15 dark:via-blue-500/15 dark:to-purple-500/15" />
        <div className="relative px-6 py-10 md:px-10 md:py-12 bg-white/70 dark:bg-gray-800/60 backdrop-blur">
          <div className="text-center">
            <div className="text-7xl font-extrabold text-gray-300 dark:text-gray-600">404</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{t('notFound.title')}</div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('notFound.subtitle')}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <HomeIcon className="w-4 h-4" />
                {t('notFound.goHome')}
              </button>
              <button onClick={() => navigate('/about')} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black/90 text-white rounded-lg">
                <InformationCircleIcon className="w-4 h-4" />
                {t('notFound.about')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


