'use client';

import { useTranslation } from '@/lib/i18n';
import AddEntryModal from './AddEntryModal';
import { useRouter } from 'next/navigation';

interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
}

export default function DashboardClient({ 
    entries, 
    showAddModal 
}: { 
    entries: Entry[];
    showAddModal: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="p-6">
        <header className="flex justify-between items-center mb-8 animate-in slide-in-from-top-4 duration-1000">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    {t('app.title')}
                </h1>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{t('app.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="btn-premium h-11 w-11 rounded-2xl flex items-center justify-center font-black shadow-lg text-lg">
                    {entries.length}
                </div>
            </div>
        </header>

        {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p>{t('app.addFirst')}</p>
            </div>
        ) : (
              <div className="space-y-4">
                 {entries.map(entry => (
                     <div key={entry.id} className="glass p-5 rounded-3xl flex justify-between items-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group">
                         <div className="flex flex-col gap-1">
                             <h3 className="font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">{entry.item}</h3>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </p>
                         </div>
                         <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-2xl">
                             ฿{entry.price.toLocaleString()}
                         </div>
                     </div>
                 ))}
              </div>
        )}

        <AddEntryModal isOpen={showAddModal} onClose={() => router.push('/app')} />
    </div>
  );
}
