'use client';

import { useTranslation } from '@/lib/i18n';
import { Smartphone, Monitor, Share, MoreVertical, Download } from 'lucide-react';

export default function InstallAppSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Download</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    {t('app.installApp')}
                </p>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
                    {t('app.installDesc')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* iOS */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                        <Smartphone className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {t('app.installIOS')}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-300 flex flex-col items-center gap-2">
                        <p>{t('app.installIOSStep')}</p>
                        <Share size={20} className="text-blue-500" />
                    </div>
                </div>

                {/* Android */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                        <Smartphone className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {t('app.installAndroid')}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-300 flex flex-col items-center gap-2">
                        <p>{t('app.installAndroidStep')}</p>
                        <MoreVertical size={20} className="text-gray-500" />
                    </div>
                </div>

                {/* Desktop */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <Monitor className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {t('app.installDesktop')}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-300 flex flex-col items-center gap-2">
                        <p>{t('app.installDesktopStep')}</p>
                        <Download size={20} className="text-gray-500" />
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
