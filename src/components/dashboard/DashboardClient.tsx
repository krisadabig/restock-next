'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import AddEntryModal from './AddEntryModal';
import EditEntryModal from './EditEntryModal';
import DeleteEntryModal from './DeleteEntryModal';
import TimelineModal from './TimelineModal';
import ManageInventoryModal from './ManageInventoryModal';
import { useRouter } from 'next/navigation';
import { Search, Edit2, Trash2, Calendar, ChevronDown, CloudOff, History, Package } from 'lucide-react';
import { useOffline } from '@/components/providers/OfflineContext';
import { useUI } from '@/components/providers/UIContext';
import { getEntriesCache, getPendingMutations } from '@/lib/idb';

interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
	quantity?: number | null;
	unit?: string | null;
}

interface InventoryItem {
	id: number;
	item: string;
	status: string;
	quantity: number;
	unit: string;
	alertEnabled: number;
	lastStockUpdate: Date | null;
}

export default function DashboardClient({ 
    entries: initialEntries, 
    inventory: initialInventory,
}: { 
    entries: Entry[];
    inventory: InventoryItem[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isOnline, refreshCache, lastAction } = useOffline();
  const { isAddModalOpen, setAddModalOpen } = useUI();
  
  // State
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  
  // Modal states
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | 'timeline' | 'manage' | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [timelineItem, setTimelineItem] = useState<string | null>(null);
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Refs
  const processedActionRef = useRef(lastAction);
  const hasAttemptedHydrationRef = useRef(false);

  // Sync Global Context
  useEffect(() => {
    if (isAddModalOpen) {
        setActiveModal('add');
    } else if (activeModal === 'add') {
        setActiveModal(null);
    }
  }, [isAddModalOpen, activeModal]);

  // Hydrate & Merge Mutations
  useEffect(() => {
    const hydrate = async () => {
        let baseEntries = initialEntries;
        
        if (baseEntries.length === 0) {
             const cached = await getEntriesCache();
             if (cached.length > 0) baseEntries = cached;
        } else {
             await refreshCache(initialEntries);
        }

        const mutations = await getPendingMutations();
        let optimisticEntries = [...baseEntries];

        for (const m of mutations.sort((a, b) => a.timestamp - b.timestamp)) {
            if (m.type === 'add') {
                const tempId = -m.timestamp; 
                optimisticEntries.push({ ...m.payload, id: tempId });
            } else if (m.type === 'edit') {
                const index = optimisticEntries.findIndex(e => e.id === m.payload.id);
                if (index !== -1) {
                    optimisticEntries[index] = { ...optimisticEntries[index], ...m.payload.data };
                }
            } else if (m.type === 'delete') {
                optimisticEntries = optimisticEntries.filter(e => e.id !== m.payload.id);
            }
        }

        setEntries(optimisticEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        const shouldRefresh = isOnline && (
            (initialEntries.length === 0 && !hasAttemptedHydrationRef.current) || 
            (lastAction > 0 && lastAction > processedActionRef.current)
        );

        if (shouldRefresh) {
           hasAttemptedHydrationRef.current = true;
           processedActionRef.current = lastAction;
           setTimeout(() => router.refresh(), 100);
        }
    };
    hydrate();
    setInventory(initialInventory);
  }, [initialEntries, initialInventory, refreshCache, lastAction, isOnline, router]);

  const handleToggleStatus = async (item: string, currentStatus: string) => {
    const newStatus = currentStatus === 'in-stock' ? 'out-of-stock' : 'in-stock';
    setIsUpdatingStatus(item);
    
    try {
        const { toggleItemStatus } = await import('@/app/app/actions');
        await toggleItemStatus(item, newStatus as 'in-stock' | 'out-of-stock');
        
        setInventory(prev => prev.map(inv => 
            inv.item === item ? { ...inv, status: newStatus } : inv
        ));
    } catch (err) {
        console.error('Failed to toggle status:', err);
    } finally {
        setIsUpdatingStatus(null);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = entry.item.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMonth = filterMonth === 'all' || entry.date.startsWith(filterMonth);
      return matchesSearch && matchesMonth;
    });
  }, [entries, searchQuery, filterMonth]);

  const months = useMemo(() => {
    const uniqueMonths = Array.from(new Set(entries.map(e => e.date.substring(0, 7))));
    return uniqueMonths.sort().reverse();
  }, [entries]);

  return (
    <div className="pb-32 space-y-6">
        {/* Sticky Header with Blur */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex justify-between items-center transition-all duration-300">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground font-heading">
                    {t('app.title')}
                </h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('app.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
                {!isOnline && (
                    <div className="bg-amber-500/10 text-amber-500 p-2 rounded-full animate-pulse border border-amber-500/20">
                        <CloudOff size={18} />
                    </div>
                )}
                <div className="bg-primary/10 text-primary h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm border border-primary/20 shadow-sm">
                    {filteredEntries.length}
                </div>
            </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="px-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input 
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => setSearchQuery(prev => prev.trim())} // Input Hygiene
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-secondary focus:ring-0 rounded-2xl transition-all placeholder:text-muted-foreground/70"
                />
            </div>
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                <select 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="appearance-none pl-11 pr-10 py-3 bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-secondary focus:ring-0 rounded-2xl transition-all cursor-pointer min-w-40"
                >
                    <option value="all">All Time</option>
                    {months.map(m => (
                        <option key={m} value={m}>
                            {new Date(m + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
        </div>

        {/* List Content */}
        <div className="px-6">
            {filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed border-border">
                    <Package size={48} className="text-muted-foreground/20 mb-4" />
                    <p className="font-medium">{searchQuery || filterMonth !== 'all' ? 'No items found' : t('app.addFirst')}</p>
                </div>
            ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                     {filteredEntries.map(entry => (
                         <div key={entry.id} className="glass-card p-5 rounded-3xl flex flex-col gap-4 group relative overflow-hidden">
                             {/* Top Row: Title & Price */}
                             <div className="flex justify-between items-start">
                                 <div className="flex-1 pr-2">
                                     <h3 className="font-heading font-bold text-lg text-foreground leading-tight">{entry.item}</h3>
                                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                     </p>
                                 </div>
                                 <div className="text-lg font-black text-primary bg-primary/5 px-3 py-1 rounded-xl">
                                     ฿{entry.price.toLocaleString()}
                                 </div>
                             </div>

                             {entry.note && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 bg-secondary/50 p-2 rounded-lg -mt-2">
                                    &quot;{entry.note}&quot;
                                  </p>
                             )}

                             {/* Bottom Row: Actions & Badges (Mobile Optimized) */}
                             <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                 {/* Badges Container */}
                                 <div className="flex flex-wrap gap-2 items-center">
                                      {inventory.find(inv => inv.item === entry.item) && (
                                         <>
                                             <button 
                                                disabled={isUpdatingStatus === entry.item}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleStatus(entry.item, inventory.find(inv => inv.item === entry.item)!.status);
                                                }}
                                                className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 ${
                                                    inventory.find(inv => inv.item === entry.item)?.status === 'in-stock'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                } ${isUpdatingStatus === entry.item ? 'animate-pulse opacity-50' : ''}`}
                                             >
                                                 <span className={`h-1.5 w-1.5 rounded-full ${inventory.find(inv => inv.item === entry.item)?.status === 'in-stock' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                 {inventory.find(inv => inv.item === entry.item)?.status === 'in-stock' ? 'In Stock' : 'Out'}
                                             </button>
                                             <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedInventory(inventory.find(inv => inv.item === entry.item)!);
                                                    setActiveModal('manage');
                                                }}
                                                className="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider bg-secondary text-secondary-foreground border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors active:scale-95"
                                             >
                                                {inventory.find(inv => inv.item === entry.item)?.quantity} {inventory.find(inv => inv.item === entry.item)?.unit}
                                             </button>
                                         </>
                                      )}
                                 </div>
                                 
                                 {/* Action Buttons */}
                                 <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => {
                                            setTimelineItem(entry.item);
                                            setActiveModal('timeline');
                                        }}
                                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-90"
                                    >
                                        <History size={16} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedEntry(entry);
                                            setActiveModal('edit');
                                        }}
                                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-90"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedEntry(entry);
                                            setActiveModal('delete');
                                        }}
                                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors active:scale-90"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                 </div>
                             </div>
                         </div>
                     ))}
                  </div>
            )}
        </div>

        {/* MODALS */}
        {activeModal === 'add' && <AddEntryModal isOpen={true} onClose={() => setAddModalOpen(false)} />}
        {activeModal === 'edit' && selectedEntry && <EditEntryModal entry={selectedEntry} onClose={() => { setActiveModal(null); setSelectedEntry(null); }} />}
        {activeModal === 'delete' && selectedEntry && <DeleteEntryModal entry={selectedEntry} onClose={() => { setActiveModal(null); setSelectedEntry(null); }} />}
        {activeModal === 'timeline' && timelineItem && <TimelineModal isOpen={true} onCloseAction={() => { setActiveModal(null); setTimelineItem(null); }} itemName={timelineItem} entries={entries} />}
        {activeModal === 'manage' && selectedInventory && <ManageInventoryModal isOpen={true} onClose={() => { setActiveModal(null); setSelectedInventory(null); }} inventoryItem={selectedInventory} />}
    </div>
  );
}
