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
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('app.feature1')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300">{t('app.feature1Desc')}</p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('app.feature2')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300">{t('app.feature2Desc')}</p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                        <Bell className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('app.feature3')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300">{t('app.feature3Desc')}</p>
                </div>
            </div>
        </div>
    </section>
  );
}
