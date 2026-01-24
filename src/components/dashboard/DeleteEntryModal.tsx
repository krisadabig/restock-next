'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Trash2 } from 'lucide-react';
import { useOffline } from '@/components/providers/OfflineContext';

interface Entry {
    id: number;
    item: string;
    price: number;
    date: string;
}

export default function DeleteEntryModal({ 
    entry, 
    onClose 
}: { 
    entry: Entry; 
    onClose: () => void 
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const { deleteEntryOffline } = useOffline();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setLoading(true);
        setError('');

        try {
            await deleteEntryOffline(entry.id);
            // We don't need to refresh here because deleteEntry calls revalidatePath
            // and the parent usually handles optimistic updates or refresh, 
            // but for safety we can refresh or just close.
            // Actually DashboardClient does router.refresh() in the old logic. 
            // deleteEntry revalidates, so router.refresh() ensures client cache is updated.
            router.refresh();
            onClose();
        } catch (err) {
            setLoading(false);
            setError((err as Error).message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 overflow-hidden">
                
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                        <Trash2 className="text-red-500 text-3xl" size={32} />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('app.deleteTitle')}</h2>
                    
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {t('app.deleteConfirm')} <span className="font-bold text-slate-800 dark:text-slate-200">&quot;{entry.item}&quot;</span>? 
                        {t('app.deleteUndone')}
                    </p>

                    {error && (
                        <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-bold">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="py-3.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {t('app.cancel')}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="py-3.5 px-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? t('settings.deleting') : t('app.delete')}
                    </button>
                    
                </div>
                <div className="h-[calc(1rem+env(safe-area-inset-bottom))] bg-slate-50 dark:bg-slate-800/50 sm:hidden"></div>
            </div>
        </div>
    );
}
