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
                <div className="glass p-8 rounded-3xl flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02]">
                    <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-indigo-100 dark:shadow-none shadow-lg">
                        <Smartphone className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                        {t('app.installIOS')}
                    </h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3 font-medium">
                        <p>{t('app.installIOSStep')}</p>
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                            <Share size={24} className="text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Android */}
                <div className="glass p-8 rounded-3xl flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02]">
                    <div className="h-14 w-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6 shadow-green-100 dark:shadow-none shadow-lg">
                        <Smartphone className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                        {t('app.installAndroid')}
                    </h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3 font-medium">
                        <p>{t('app.installAndroidStep')}</p>
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                            <MoreVertical size={24} className="text-slate-500" />
                        </div>
                    </div>
                </div>

                {/* Desktop */}
                <div className="glass p-8 rounded-3xl flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02]">
                    <div className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-blue-100 dark:shadow-none shadow-lg">
                        <Monitor className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                        {t('app.installDesktop')}
                    </h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3 font-medium">
                        <p>{t('app.installDesktopStep')}</p>
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                            <Download size={24} className="text-slate-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
