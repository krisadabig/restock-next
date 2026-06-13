'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Package, TrendingUp, Settings, Plus } from 'lucide-react';
import { useUI } from '@/components/providers/UIContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { setLogEntrySheetOpen } = useUI();

  const isStock    = pathname === '/app';
  const isPrice    = pathname.startsWith('/app/price');
  const isSettings = pathname === '/app/settings';

  const tabs = [
    { href: '/app',           label: t('app.navStock'),    icon: Package,    active: isStock },
    { href: '/app/price',     label: t('app.navPrice'),    icon: TrendingUp, active: isPrice },
    { href: '/app/settings',  label: t('app.navSettings'), icon: Settings,   active: isSettings },
  ];

  return (
    <>
      {/* Bottom nav pill */}
      <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm glass rounded-3xl px-4 py-3 flex justify-around items-center z-50 shadow-2xl border border-primary/10 animate-in slide-in-from-bottom-10 duration-700 delay-500">
        {tabs.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 min-h-11 min-w-[60px] justify-center rounded-2xl transition-all duration-300 ${
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-primary/20 scale-110 shadow-lg' : ''}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
          </Link>
        ))}
      </div>

      {/* FAB — bottom-right, separate from nav */}
      <button
        data-testid="fab-btn"
        type="button"
        onClick={() => setLogEntrySheetOpen(true)}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-50 h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl login-glow hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Log entry"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </>
  );
}
