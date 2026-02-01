'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { History, Plus, TrendingUp, Settings, Package } from 'lucide-react';
import { useUI } from '@/components/providers/UIContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { setAddModalOpen } = useUI();

  const isDashboard = pathname === '/app';
  const isInventory = pathname.startsWith('/app/inventory');
  const isTrends = pathname === '/app/trends';
  const isSettings = pathname === '/app/settings';

  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm glass rounded-3xl px-3 py-3 flex justify-between items-center z-50 shadow-2xl border border-primary/10 animate-in slide-in-from-bottom-10 duration-700 delay-500">
        <Link
            href="/app"
            aria-label={t('app.dashboard')}
            className={`flex-1 flex flex-col items-center justify-center min-h-11 rounded-2xl transition-all duration-300 ${isDashboard ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${isDashboard ? 'bg-primary/20 scale-110 shadow-lg' : ''}`}>
                <Package size={22} strokeWidth={isDashboard ? 2.5 : 2} />
            </div>
        </Link>
 
        <Link
            href="/app/trends"
            aria-label={t('app.trends')}
             className={`flex-1 flex flex-col items-center justify-center min-h-11 rounded-2xl transition-all duration-300 ${isTrends ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${isTrends ? 'bg-primary/20 scale-110 shadow-lg' : ''}`}>
                <TrendingUp size={22} strokeWidth={isTrends ? 2.5 : 2} />
            </div>
        </Link>

        {/* Action Button - Centered */}
        <button
            onClick={() => setAddModalOpen(true)}
            aria-label={t('app.addEntry')}
            className="flex-1 flex flex-col items-center justify-center min-h-11 group"
        >
            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center border-4 border-background/20 login-glow group-hover:scale-110 group-active:scale-95 transition-all shadow-xl">
                <Plus size={32} strokeWidth={3} />
            </div>
        </button>
 
        <Link
            href="/app/inventory"
            aria-label={t('app.navHistory')}
            className={`flex-1 flex flex-col items-center justify-center min-h-11 rounded-2xl transition-all duration-300 ${isInventory ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${isInventory ? 'bg-primary/20 scale-110 shadow-lg' : ''}`}>
                <History size={22} strokeWidth={isInventory ? 2.5 : 2} />
            </div>
        </Link>
        
        <Link
            href="/app/settings"
            aria-label={t('app.settings')}
             className={`flex-1 flex flex-col items-center justify-center min-h-11 rounded-2xl transition-all duration-300 ${isSettings ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${isSettings ? 'bg-primary/20 scale-110 shadow-lg' : ''}`}>
                <Settings size={22} strokeWidth={isSettings ? 2.5 : 2} />
            </div>
        </Link>
    </div>
  );
}

