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
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl rounded-b-none sm:rounded-2xl shadow-xl transform transition-transform animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 z-101">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings.editEntry')}</h2>
                    <button 
                        onClick={onClose}
                        className="h-11 w-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Tag size={16} /> {t('app.itemName')}
                        </label>
                        <input 
                            name="item"
                            list="item-suggestions-edit"
                            required
                            defaultValue={entry.item}
                            placeholder={t('app.placeholderItem')}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                        />
                        <datalist id="item-suggestions-edit">
                            {suggestions.map(s => <option key={s} value={s} />)}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <DollarSign size={16} /> {t('app.price')}
                            </label>
                            <input 
                                name="price"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                defaultValue={entry.price}
                                placeholder="0.00"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar size={16} /> {t('app.date')}
                            </label>
                            <input 
                                name="date"
                                type="date"
                                required
                                defaultValue={entry.date}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FileText size={16} /> {t('app.noteOptional')}
                        </label>
                        <textarea 
                            name="note"
                            rows={3}
                            defaultValue={entry.note || ''}
                            placeholder={t('app.placeholderNote')}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
                    >
                        {loading ? t('app.processing') : t('app.saveChanges')}
                    </button>
                    <div className="pb-[calc(1rem+env(safe-area-inset-bottom))] sm:hidden"></div> {/* Safe area spacer for mobile */}
                </form>
            </div>
        </div>,
        document.body
    );
}
