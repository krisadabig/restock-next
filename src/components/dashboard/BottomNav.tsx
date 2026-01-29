'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { History, Plus, TrendingUp, Settings } from 'lucide-react';
import { useUI } from '@/components/providers/UIContext';

export default function BottomNav() {
  const pathname = usePathname();
  useTranslation();
  const { setAddModalOpen } = useUI();

  const isDashboard = pathname === '/app';
  const isTrends = pathname === '/app/trends';
  const isSettings = pathname === '/app/settings';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm glass-panel rounded-full px-2 py-2 flex justify-between items-center z-50 shadow-2xl animate-in slide-in-from-bottom-10 duration-700 delay-500">
        <Link
            href="/app"
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all duration-300 ${isDashboard ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
            <div className={`p-2 rounded-full transition-all duration-300 ${isDashboard ? 'bg-primary/10 scale-110' : ''}`}>
                <History size={20} strokeWidth={isDashboard ? 2.5 : 2} />
            </div>
        </Link>

        <button
            onClick={() => setAddModalOpen(true)}
            className="flex-1 flex flex-col items-center -mt-8 group cursor-pointer"
        >
            <div className="h-14 w-14 rounded-full btn-primary-glow flex items-center justify-center border-4 border-background group-hover:-translate-y-1 transition-transform">
                <Plus size={28} strokeWidth={3} />
            </div>
        </button>

        <Link
            href="/app/trends"
             className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all duration-300 ${isTrends ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
            <div className={`p-2 rounded-full transition-all duration-300 ${isTrends ? 'bg-primary/10 scale-110' : ''}`}>
                <TrendingUp size={20} strokeWidth={isTrends ? 2.5 : 2} />
            </div>
        </Link>
        
        <Link
            href="/app/settings"
             className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all duration-300 ${isSettings ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
            <div className={`p-2 rounded-full transition-all duration-300 ${isSettings ? 'bg-primary/10 scale-110' : ''}`}>
                <Settings size={20} strokeWidth={isSettings ? 2.5 : 2} />
            </div>
        </Link>
    </div>
  );
}

