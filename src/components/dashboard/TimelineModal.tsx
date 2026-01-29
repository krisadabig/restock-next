'use client';

import { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Entry {
    id: number;
    item: string;
    price: number;
    date: string;
    note: string | null;
}

export default function TimelineModal({ 
    isOpen, 
    onCloseAction, 
    itemName,
    entries
}: { 
    isOpen: boolean; 
    onCloseAction: () => void;
    itemName: string;
    entries: Entry[];
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!isOpen || !mounted) return null;

    // Filter and sort history for this item
    const itemEntries = entries
        .filter(e => e.item === itemName)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const averagePrice = itemEntries.length > 0 
        ? itemEntries.reduce((acc, curr) => acc + curr.price, 0) / itemEntries.length 
        : 0;

    const modalContent = (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {itemName}
                            </h2>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Item Timeline</p>
                        </div>
                        <button 
                            onClick={onCloseAction}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-500/5 p-4 rounded-3xl border border-indigo-500/10">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Purchases</p>
                            <p className="text-xl font-black text-slate-800 dark:text-white">{itemEntries.length}</p>
                        </div>
                        <div className="bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Avg Price</p>
                            <p className="text-xl font-black text-slate-800 dark:text-white">฿{averagePrice.toFixed(0)}</p>
                        </div>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {itemEntries.map((entry, idx) => {
                            const prevPrice = idx < itemEntries.length - 1 ? itemEntries[idx + 1].price : null;
                            const isHigher = prevPrice !== null && entry.price > prevPrice;
                            const isLower = prevPrice !== null && entry.price < prevPrice;

                            return (
                                <div key={entry.id} className="relative pl-6 pb-2 border-l-2 border-slate-100 dark:border-slate-800 last:border-0">
                                    <div className="absolute -left-2.25 top-0 h-4 w-4 rounded-full bg-indigo-500 border-4 border-white dark:border-slate-900" />
                                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="font-bold text-slate-800 dark:text-slate-100">฿{entry.price.toLocaleString()}</p>
                                                {isHigher && <TrendingUp size={14} className="text-rose-500" />}
                                                {isLower && <TrendingDown size={14} className="text-emerald-500" />}
                                                {!isHigher && !isLower && idx < itemEntries.length - 1 && <Minus size={14} className="text-slate-400" />}
                                            </div>
                                        </div>
                                        {entry.note && (
                                            <p className="text-xs text-slate-500 italic max-w-32 truncate">{entry.note}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        onClick={onCloseAction}
                        className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transform active:scale-[0.98] transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
