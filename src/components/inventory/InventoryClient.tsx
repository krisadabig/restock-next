'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Search, Package, CloudOff } from 'lucide-react';
import InventoryCard from './InventoryCard';
import { useOffline } from '@/components/providers/OfflineContext';

interface InventoryItem {
    id: number;
    item: string;
    status: string;
    quantity: number;
    unit: string;
    alertEnabled: number;
    lastStockUpdate: Date | null;
}

export default function InventoryClient({ inventory }: { inventory: InventoryItem[] }) {
    const { t } = useTranslation();
    const { isOnline } = useOffline();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredInventory = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return inventory;
        return inventory.filter(inv => inv.item.toLowerCase().includes(query));
    }, [inventory, searchQuery]);

    return (
        <div className="pb-32 space-y-6">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground font-heading">
                        {t('app.inventory')}
                    </h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {t('app.manageStock')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {!isOnline && (
                        <div className="bg-amber-500/10 text-amber-500 p-2 rounded-full animate-pulse border border-amber-500/20">
                            <CloudOff size={18} />
                        </div>
                    )}
                    <div className="bg-primary/10 text-primary h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm border border-primary/20 shadow-sm">
                        {filteredInventory.length}
                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder={t('app.searchStock')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        // Input Hygiene: Trim on blur
                        onBlur={() => setSearchQuery(prev => prev.trim())}
                        className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-secondary focus:ring-0 rounded-2xl transition-all placeholder:text-muted-foreground/70"
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-6">
                {filteredInventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed border-border">
                        <Package size={48} className="text-muted-foreground/20 mb-4" />
                        <p className="font-medium">
                            {searchQuery ? t('app.noResults') : t('app.inventoryEmpty')}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredInventory.map(item => (
                            <InventoryCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
