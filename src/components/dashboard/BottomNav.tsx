'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { History, Plus, TrendingUp, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isDashboard = pathname === '/app';
  const isTrends = pathname === '/app/trends';
  const isSettings = pathname === '/app/settings';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-around items-center z-50 max-w-md mx-auto">
        <Link
            href="/app"
            className={`flex flex-col items-center gap-1 ${isDashboard ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
            <History size={22} strokeWidth={isDashboard ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t('app.navHistory')}</span>
        </Link>

        <Link
            href="/app?add=true"
            className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
            <div className="flex items-center justify-center bg-indigo-600 text-white h-11 w-11 rounded-full shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 -mt-5 border-4 border-white dark:border-gray-900">
                <Plus size={22} />
            </div>
            <span className="text-[10px] font-medium">{t('app.navAdd')}</span>
        </Link>

        <Link
            href="/app/trends"
            className={`flex flex-col items-center gap-1 ${isTrends ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
            <TrendingUp size={22} strokeWidth={isTrends ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t('app.navTrends')}</span>
        </Link>

        <Link
            href="/app/settings"
            className={`flex flex-col items-center gap-1 ${isSettings ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
            <Settings size={22} strokeWidth={isSettings ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t('settings.title')}</span>
        </Link>
    </div>
  );
}

