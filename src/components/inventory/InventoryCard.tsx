'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus } from 'lucide-react';
import { consumeItem, restockItem } from '@/app/app/actions';

interface InventoryItem {
    id: number;
    item: string;
    status: string;
    quantity: number;
    unit: string;
    alertEnabled: number;
    lastStockUpdate: Date | null;
}

export default function InventoryCard({ item }: { item: InventoryItem }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Optimistic UI state
    const [optimisticQuantity, setOptimisticQuantity] = useState(item.quantity);

    const handleQuickAction = async (e: React.MouseEvent, type: 'consume' | 'restock') => {
        e.stopPropagation();
        if (loading) return;
        setLoading(true);

        const amount = 1;
        
        // Optimistic Update
        const newQty = type === 'consume' ? optimisticQuantity - amount : optimisticQuantity + amount;
        setOptimisticQuantity(newQty);

        try {
            if (type === 'consume') {
                await consumeItem(item.item, amount);
            } else {
                await restockItem(item.item, amount);
            }
            router.refresh();
        } catch (err) {
            // Revert
            console.error(err);
            setOptimisticQuantity(item.quantity);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = () => {
        router.push(`/app/inventory/${encodeURIComponent(item.item)}`);
    };

    const isLow = optimisticQuantity > 0 && optimisticQuantity <= 2;
    const isOut = optimisticQuantity <= 0;

    return (
        <div 
            onClick={handleCardClick}
            className="glass-card p-4 rounded-3xl relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="font-heading font-black text-lg text-foreground leading-tight truncate pr-2">
                        {item.item}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border ${
                            isOut 
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                                : isLow
                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                    </div>
                </div>
                
                {/* Quantity Badge */}
                <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-foreground">
                        {optimisticQuantity} <span className="text-xs font-bold text-muted-foreground">{item.unit}</span>
                    </span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <button 
                    onClick={(e) => handleQuickAction(e, 'consume')}
                    disabled={loading}
                    className="h-10 flex-1 flex items-center justify-center bg-secondary/50 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded-xl transition-colors active:scale-95 mr-2"
                >
                    <Minus size={18} strokeWidth={2.5} />
                </button>
                <button 
                    onClick={(e) => handleQuickAction(e, 'restock')}
                    disabled={loading}
                    className="h-10 flex-1 flex items-center justify-center bg-secondary/50 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 rounded-xl transition-colors active:scale-95 ml-2"
                >
                    <Plus size={18} strokeWidth={2.5} />
                </button>
            </div>
            
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
