import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CodeBracketIcon, IdentificationIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const TECH_STACK = [
  'React 18 • Redux Toolkit',
  'Tailwind CSS • Headless UI',
  'Recharts',
  'Node.js (Express)',
  'MongoDB',
  'Prometheus • SNMP Exporter',
  'Socket.IO'
];

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh]">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/15 dark:via-indigo-500/15 dark:to-purple-500/15" />
        <div className="relative p-6 md:p-8 bg-white/70 dark:bg-gray-800/60 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {t('about.title')}
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
                {t('about.subtitle')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {t('about.version')}: 1.0
                </Badge>
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">{t('about.license')}: MIT</Badge>
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{t('about.copyright', { year: 2025 })}</Badge>
              </div>
            </div>
            <ShieldCheckIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <GlobeAltIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('about.application')}</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('about.description')}
          </p>
        </motion.div>

        {/* Team */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <IdentificationIcon className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('about.team')}</h2>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div>{t('about.fullstack')}: <span className="font-semibold">Gugah Nugraha</span></div>
            <div>
              {t('about.github')}: <a className="text-blue-600 dark:text-blue-400 underline" href="https://github.com/gugahnugraha" target="_blank" rel="noreferrer">github.com/gugahnugraha</a>
            </div>
            <div>
              {t('about.instagram')}: <a className="text-pink-600 dark:text-pink-400 underline" href="https://instagram.com/gugahnugraha" target="_blank" rel="noreferrer">instagram.com/gugahnugraha</a>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <CodeBracketIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('about.techStack')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tItem) => (
              <span key={tItem} className="px-2.5 py-1 rounded-md text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {tItem}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer action */}
      <div className="mt-6 flex items-center gap-3">
        <a
          href="https://github.com/gugahnugraha"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black/90"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
            <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.96c-3.2.7-3.87-1.37-3.87-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.18.08 1.8 1.22 1.8 1.22 1.05 1.8 2.75 1.28 3.42.98.11-.77.41-1.28.74-1.57-2.55-.29-5.23-1.28-5.23-5.67 0-1.25.45-2.27 1.2-3.06-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.21 1.17.93-.26 1.93-.39 2.92-.4.99.01 1.99.14 2.93.4 2.22-1.48 3.2-1.17 3.2-1.17.63 1.59.23 2.77.11 3.06.75.79 1.2 1.81 1.2 3.06 0 4.4-2.68 5.38-5.24 5.67.42.37.79 1.1.79 2.22v3.29c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/>
          </svg>
          {t('about.viewOnGitHub')}
        </a>
        <a
          href="https://instagram.com/gugahnugraha"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3.5a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
          </svg>
          {t('about.followOnInstagram')}
        </a>
      </div>
    </div>
  );
};

export default About;


