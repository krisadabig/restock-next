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
    <div className="fixed bottom-6 left-[50%] -translate-x-[50%] w-[calc(100%-2rem)] max-w-sm glass rounded-4xl px-4 py-3 flex justify-around items-center z-50">
        <Link
            href="/app"
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isDashboard ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
            <History size={22} strokeWidth={isDashboard ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('app.navHistory')}</span>
            {isDashboard && <div className="h-1 w-1 bg-current rounded-full mt-0.5" />}
        </Link>

        <Link
            href="/app?add=true"
            className="flex flex-col items-center gap-1 group"
        >
            <div className="btn-premium h-14 w-14 rounded-full flex items-center justify-center -mt-12 border-4 border-white dark:border-slate-900 group-hover:-translate-y-1 transition-transform">
                <Plus size={28} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">{t('app.navAdd')}</span>
        </Link>

        <Link
            href="/app/trends"
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isTrends ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
            <TrendingUp size={22} strokeWidth={isTrends ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('app.navTrends')}</span>
            {isTrends && <div className="h-1 w-1 bg-current rounded-full mt-0.5" />}
        </Link>

        <Link
            href="/app/settings"
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isSettings ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
            <Settings size={22} strokeWidth={isSettings ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('settings.title')}</span>
            {isSettings && <div className="h-1 w-1 bg-current rounded-full mt-0.5" />}
        </Link>
    </div>
  );
}

