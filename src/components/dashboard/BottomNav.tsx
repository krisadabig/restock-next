'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { History, Plus, TrendingUp } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isDashboard = pathname === '/app';
  const isTrends = pathname === '/app/trends';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex justify-around items-center z-50 max-w-md mx-auto">
        <Link
            href="/app"
            className={`flex flex-col items-center gap-1 ${isDashboard ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
            <History size={24} strokeWidth={isDashboard ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t('app.navHistory')}</span>
        </Link>

        <Link
            href="/app?add=true"
            className="flex items-center justify-center bg-indigo-600 text-white h-14 w-14 rounded-full shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 -mt-8 border-4 border-white dark:border-gray-900 active:scale-95 transition-transform"
        >
            <Plus size={28} />
        </Link>

        <Link
            href="/app/trends"
            className={`flex flex-col items-center gap-1 ${isTrends ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
            <TrendingUp size={24} strokeWidth={isTrends ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t('app.navTrends')}</span>
        </Link>
    </div>
  );
}
