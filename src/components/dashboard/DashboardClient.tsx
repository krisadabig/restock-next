'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';
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
        <header className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {t('app.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-300">{t('app.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
                <Link
                    href="/app/settings"
                    className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <Settings size={20} />
                </Link>
                <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
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
                    <div key={entry.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{entry.item}</h3>
                            <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-indigo-600 dark:text-indigo-400 font-bold">
                            ฿{entry.price}
                        </div>
                    </div>
                ))}
             </div>
        )}

        <AddEntryModal isOpen={showAddModal} onClose={() => router.push('/app')} />
    </div>
  );
}
