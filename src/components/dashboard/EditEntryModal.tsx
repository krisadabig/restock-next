'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/lib/i18n';
import { getUniqueItems } from '@/app/app/actions';
import { X, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { useOffline } from '@/components/providers/OfflineContext';

interface Entry {
    id: number;
    item: string;
    price: number;
    date: string;
    note: string | null;
}

export default function EditEntryModal({ 
    entry, 
    onClose 
}: { 
    entry: Entry; 
    onClose: () => void 
}) {
    const { t } = useTranslation();
    const { updateEntryOffline } = useOffline();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    
    const [mounted, setMounted] = useState(false);
    const [optimisticClosed, setOptimisticClosed] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
        getUniqueItems().then(setSuggestions).catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const item = formData.get('item') as string;
        const price = parseFloat(formData.get('price') as string);
        const date = formData.get('date') as string;
        const note = formData.get('note') as string;

        try {
            await updateEntryOffline(entry.id, { item, price, date, note });
            setLoading(false);
            setOptimisticClosed(true); // Close immediately
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
            {/* Modal */}
            {/* Modal */}
            <div className="relative w-full max-w-md glass rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl transform transition-all animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 z-101 border border-border">
                {/* Drag Handle for Mobile */}
                <div className="sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4 mb-2"></div>

                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-2xl font-bold text-foreground">{t('settings.editEntry')}</h2>
                    <button 
                        onClick={onClose}
                        className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-primary/10 rounded-full transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Tag size={12} /> {t('app.itemName')}
                        </label>
                        <input 
                            name="item"
                            list="item-suggestions-edit"
                            required
                            defaultValue={entry.item}
                            placeholder={t('app.placeholderItem')}
                            className="input-premium"
                        />
                        <datalist id="item-suggestions-edit">
                            {suggestions.map(s => <option key={s} value={s} />)}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <DollarSign size={12} /> {t('app.price')}
                            </label>
                            <input 
                                name="price"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                defaultValue={entry.price}
                                placeholder="0.00"
                                className="input-premium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={12} /> {t('app.date')}
                            </label>
                            <input 
                                name="date"
                                type="date"
                                required
                                defaultValue={entry.date}
                                className="input-premium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <FileText size={12} /> {t('app.noteOptional')}
                        </label>
                        <textarea 
                            name="note"
                            rows={2}
                            defaultValue={entry.note || ''}
                            placeholder={t('app.placeholderNote')}
                            className="input-premium resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-500 text-sm font-bold rounded-2xl text-center border border-red-500/20 animate-in fade-in zoom-in-95 duration-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg login-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : t('app.saveChanges')}
                    </button>
                    <div className="pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:hidden"></div>
                </form>
            </div>
        </div>,
        document.body
    );
}
