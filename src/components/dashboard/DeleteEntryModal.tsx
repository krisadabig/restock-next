'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const { deleteEntryOffline } = useOffline();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [optimisticClosed, setOptimisticClosed] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
    }, []);

    const handleDelete = async () => {
        setLoading(true);
        setError('');

        try {
            await deleteEntryOffline(entry.id);
            // Optimistic closure
            setLoading(false);
            setOptimisticClosed(true);
            onClose();
        } catch (err) {
            setLoading(false);
            setError((err as Error).message);
        }
    };

    if (!mounted || optimisticClosed) return null;

    return createPortal(
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-md glass rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl transform transition-all animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 z-101 border border-border">
                {/* Drag Handle for Mobile */}
                <div className="sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4 mb-2"></div>

                <div className="p-8 pb-4 flex flex-col items-center text-center space-y-6">
                    <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-2 shadow-inner border border-red-500/10">
                        <Trash2 className="text-red-500" size={36} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">{t('app.deleteTitle')}</h2>
                        <p className="text-muted-foreground font-medium leading-relaxed">
                            {t('app.deleteConfirm')} <span className="font-bold text-foreground">&quot;{entry.item}&quot;</span>? 
                            <br />
                            <span className="text-sm opacity-70">{t('app.deleteUndone')}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="w-full p-4 bg-red-500/10 text-red-500 text-sm font-bold rounded-2xl text-center border border-red-500/20 animate-in fade-in zoom-in-95 duration-300">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="h-14 bg-secondary/30 text-foreground font-bold rounded-2xl hover:bg-secondary/50 transition-all active:scale-95 disabled:opacity-50 border border-primary/5"
                    >
                        {t('app.cancel')}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="h-14 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                             <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : t('app.delete')}
                    </button>
                </div>
                <div className="h-[calc(1.5rem+env(safe-area-inset-bottom))] sm:hidden"></div>
            </div>
        </div>,
        document.body
    );
}
