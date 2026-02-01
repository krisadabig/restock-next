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
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 transition-opacity"
                onClick={onCloseAction}
            ></div>

            <div className="relative glass w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 border border-primary/10 flex flex-col max-h-[90vh]">
                
                 {/* Drag Handle for Mobile */}
                <div className="sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4"></div>

                {/* Header */}
                <div className="p-8 pb-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground tracking-tight truncate max-w-75">
                            {itemName}
                        </h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Activity History</p>
                    </div>
                    <button 
                        onClick={onCloseAction}
                        className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-primary/10 rounded-full transition-all active:scale-90"
                    >
                        <X size={26} />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 pt-4 space-y-10 custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/5 p-5 rounded-[2rem] border border-emerald-500/10 shadow-sm">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-2">Avg Price</p>
                            <p className="text-3xl font-bold text-foreground">฿{averagePrice.toFixed(0)}</p>
                            {purchaseEntries.length > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-2 opacity-60">from {purchaseEntries.length} items</p>
                            )}
                        </div>
                        <div className="bg-orange-500/5 p-5 rounded-[2rem] border border-orange-500/10 shadow-sm">
                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-2">Total Used</p>
                            <p className="text-3xl font-bold text-foreground">{totalConsumed}</p>
                            <p className="text-[10px] text-muted-foreground mt-2 opacity-60">units consumed</p>
                        </div>
                    </div>

                    {/* Timeline Feed */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">Activity Timeline</h3>
                        
                        <div className="relative pl-4 space-y-8 before:absolute before:left-4.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/5">
                            {itemEntries.map((entry, idx) => {
                                const isConsume = entry.type === 'consume';
                                // Price Trend Logic
                                const prevPrice = idx < itemEntries.length - 1 ? itemEntries[idx + 1].price : null;
                                const isHigher = !isConsume && prevPrice !== null && entry.price > prevPrice;
                                const isLower = !isConsume && prevPrice !== null && entry.price < prevPrice;

                                return (
                                    <div key={entry.id} className="relative pl-10 group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-0 top-1 h-10 w-10 rounded-2xl border-4 border-background flex items-center justify-center z-10 shadow-md ${
                                            isConsume ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                                        }`}>
                                            {isConsume ? <ArrowDownRight size={18} strokeWidth={3} /> : <ShoppingBag size={18} strokeWidth={3} />}
                                        </div>

                                        {/* Content Card */}
                                        <div className="bg-secondary/20 p-5 rounded-2xl hover:bg-secondary/40 transition-all border border-primary/5">
                                           <div className="flex justify-between items-start mb-2">
                                               <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                   {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                               </span>
                                               {isConsume ? (
                                                   <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">Stock out</span>
                                               ) : (
                                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">Restock</span>
                                               )}
                                           </div>
                                           
                                           <div className="flex justify-between items-end">
                                               <div>
                                                    {isConsume ? (
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-xl font-bold text-foreground">-{entry.quantity}</span>
                                                            <span className="text-xs text-muted-foreground font-medium">{entry.unit}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl font-bold text-foreground">฿{entry.price.toLocaleString()}</span>
                                                            {isHigher && <TrendingUp size={16} className="text-rose-500" />}
                                                            {isLower && <TrendingDown size={16} className="text-emerald-500" />}
                                                        </div>
                                                    )}
                                               </div>
                                               {!isConsume && entry.quantity && (
                                                   <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">
                                                       qty: {entry.quantity} {entry.unit}
                                                   </div>
                                               )}
                                           </div>

                                           {entry.note && (
                                               <div className="mt-3 overflow-hidden">
                                                   <p className="text-xs text-muted-foreground/80 italic leading-relaxed pl-3 border-l-2 border-primary/10">
                                                       &quot;{entry.note}&quot;
                                                   </p>
                                               </div>
                                           )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-background/50 border-t border-primary/5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                    <button 
                        onClick={onCloseAction}
                        className="w-full h-14 bg-foreground text-background rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-xl"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
