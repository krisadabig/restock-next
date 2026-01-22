'use client';

import { useTranslation } from '@/lib/i18n';
import { CheckCircle, BarChart3, Bell } from 'lucide-react';

export default function FeatureSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
                    {t('app.features')}
                </h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    {t('app.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Feature 1 */}
                <div className="glass p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group">
                    <div className="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3">
                        <CheckCircle className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                        {t('app.feature1')}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {t('app.feature1Desc')}
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="glass p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group">
                    <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3">
                        <BarChart3 className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                        {t('app.feature2')}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {t('app.feature2Desc')}
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="glass p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group">
                    <div className="h-14 w-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3">
                        <Bell className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                        {t('app.feature3')}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {t('app.feature3Desc')}
                    </p>
                </div>
            </div>
        </div>
    </section>
  );
}
