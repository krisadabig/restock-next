'use client';

import { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, ArrowDownRight, ShoppingBag } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Entry } from '@/app/app/actions';

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

    // Filter and sort specific item entries
    const itemEntries = entries
        .filter(e => e.item === itemName)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calc Stats
    const purchaseEntries = itemEntries.filter(e => e.type === 'purchase' || !e.type); // Default to purchase if undefined
    const consumeEntries = itemEntries.filter(e => e.type === 'consume');

    const averagePrice = purchaseEntries.length > 0 
        ? purchaseEntries.reduce((acc, curr) => acc + curr.price, 0) / purchaseEntries.length 
        : 0;

    const totalConsumed = consumeEntries.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    // const lastPurchaseDate = purchaseEntries.length > 0 ? purchaseEntries[0].date : null; // Unused for now

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-border/50 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight line-clamp-1">
                            {itemName}
                        </h2>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Full History</p>
                    </div>
                    <button 
                        onClick={onCloseAction}
                        className="p-2 hover:bg-secondary rounded-full transition-colors active:scale-95"
                    >
                        <X size={24} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Avg Price</p>
                            <p className="text-2xl font-black text-foreground">฿{averagePrice.toFixed(0)}</p>
                            {purchaseEntries.length > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-1">from {purchaseEntries.length} purchases</p>
                            )}
                        </div>
                        <div className="bg-orange-500/5 p-4 rounded-3xl border border-orange-500/10">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Total Used</p>
                            <p className="text-2xl font-black text-foreground">{totalConsumed}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">units consumed</p>
                        </div>
                    </div>

                    {/* Timeline Feed */}
                    <div className="space-y-0">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Activity Feed</h3>
                        
                        <div className="relative pl-4 space-y-6 before:absolute before:left-4.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
                            {itemEntries.map((entry, idx) => {
                                const isConsume = entry.type === 'consume';
                                // Price Trend Logic
                                const prevPrice = idx < itemEntries.length - 1 ? itemEntries[idx + 1].price : null;
                                const isHigher = !isConsume && prevPrice !== null && entry.price > prevPrice;
                                const isLower = !isConsume && prevPrice !== null && entry.price < prevPrice;

                                return (
                                    <div key={entry.id} className="relative pl-8 group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-0 top-1.5 h-10 w-10 rounded-full border-4 border-background flex items-center justify-center z-10 ${
                                            isConsume ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                                        }`}>
                                            {isConsume ? <ArrowDownRight size={16} strokeWidth={3} /> : <ShoppingBag size={16} strokeWidth={3} />}
                                        </div>

                                        {/* Content Card */}
                                        <div className="bg-secondary/30 p-4 rounded-2xl hover:bg-secondary/60 transition-colors">
                                           <div className="flex justify-between items-start mb-1">
                                               <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                   {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                               </span>
                                               {isConsume ? (
                                                   <span className="text-xs font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">Used</span>
                                               ) : (
                                                    <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Bought</span>
                                               )}
                                           </div>
                                           
                                           <div className="flex justify-between items-end">
                                               <div>
                                                    {isConsume ? (
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-lg font-bold text-foreground">-{entry.quantity}</span>
                                                            <span className="text-xs text-muted-foreground">{entry.unit}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-foreground">฿{entry.price.toLocaleString()}</span>
                                                            {isHigher && <TrendingUp size={14} className="text-rose-500" />}
                                                            {isLower && <TrendingDown size={14} className="text-emerald-500" />}
                                                        </div>
                                                    )}
                                               </div>
                                               {!isConsume && entry.quantity && (
                                                   <div className="text-xs text-muted-foreground">
                                                       qty: {entry.quantity} {entry.unit}
                                                   </div>
                                               )}
                                           </div>

                                           {entry.note && (
                                               <p className="mt-2 text-xs text-muted-foreground/80 italic border-l-2 border-border pl-2">
                                                   &quot;{entry.note}&quot;
                                               </p>
                                           )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-background border-t border-border/50">
                    <button 
                        onClick={onCloseAction}
                        className="w-full py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
