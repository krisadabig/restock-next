'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import AddEntryModal from './AddEntryModal';
import EditEntryModal from './EditEntryModal';
import DeleteEntryModal from './DeleteEntryModal';
import TimelineModal from './TimelineModal';
import ManageInventoryModal from './ManageInventoryModal';
import { useRouter } from 'next/navigation';
import { Search, Edit2, Trash2, Calendar, ChevronDown, CloudOff, History } from 'lucide-react';
import { useOffline } from '@/components/providers/OfflineContext';
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
    showAddModal 
}: { 
    entries: Entry[];
    inventory: InventoryItem[];
    showAddModal: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isOnline, refreshCache, lastAction } = useOffline();
  
  // State
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  
  // Modal states (using strings/objects for lazy load references)
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | 'timeline' | 'manage' | null>(showAddModal ? 'add' : null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [timelineItem, setTimelineItem] = useState<string | null>(null);
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Hydrate & Merge Mutations
  useEffect(() => {
    const hydrate = async () => {
        // 1. Get Base Entries (Server or Cache)
        let baseEntries = initialEntries;
        
        // If server entries empty (offline/error), try cache
        if (baseEntries.length === 0) {
             const cached = await getEntriesCache();
             if (cached.length > 0) baseEntries = cached;
        } else {
             // If we have server entries, update cache
             await refreshCache(initialEntries);
        }

        // 2. Apply Pending Mutations (Optimistic UI)
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

        // Sort by date desc
        setEntries(optimisticEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        // Re-Sync check (PWA fix): If online but data was from cache, refresh
        if (isOnline && (initialEntries.length === 0 || lastAction > 0)) {
           // Small delay to ensure navigation is complete
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
        
        // Optimistic update
        setInventory(prev => prev.map(inv => 
            inv.item === item ? { ...inv, status: newStatus } : inv
        ));
    } catch (err) {
        console.error('Failed to toggle status:', err);
    } finally {
        setIsUpdatingStatus(null);
    }
  };

  // Derived data
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
    <div className="p-6 pb-24 space-y-6">
        <header className="flex justify-between items-center animate-in slide-in-from-top-4 duration-1000">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    {t('app.title')}
                </h1>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{t('app.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
                {!isOnline && (
                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 p-2 rounded-full animate-pulse">
                        <CloudOff size={20} />
                    </div>
                )}
                <div className="btn-premium h-11 w-11 rounded-2xl flex items-center justify-center font-black shadow-lg text-lg transform active:scale-90 transition-transform">
                    {filteredEntries.length}
                </div>
            </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in duration-700 delay-200">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white dark:placeholder-slate-500"
                />
            </div>
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <select 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="appearance-none pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white cursor-pointer min-w-40"
                >
                    <option value="all">All Time</option>
                    {months.map(m => (
                        <option key={m} value={m}>
                            {new Date(m + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
        </div>

        {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <p>{searchQuery || filterMonth !== 'all' ? 'No items found matching criteria' : t('app.addFirst')}</p>
            </div>
        ) : (
              <div className="space-y-4">
                 {filteredEntries.map(entry => (
                     <div key={entry.id} className="glass p-5 rounded-3xl flex justify-between items-center transition-all duration-300 hover:scale-[1.01] group relative">
                         <div className="flex flex-col gap-1 pr-4">
                              <div className="flex items-center gap-2">
                                  <h3 className="font-exhibit font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{entry.item}</h3>
                                  {inventory.find(inv => inv.item === entry.item) && (
                                     <div className="flex items-center gap-1.5">
                                         <button 
                                            disabled={isUpdatingStatus === entry.item}
                                            onClick={() => handleToggleStatus(entry.item, inventory.find(inv => inv.item === entry.item)!.status)}
                                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm transition-all active:scale-95 ${
                                                inventory.find(inv => inv.item === entry.item)?.status === 'in-stock'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                            } ${isUpdatingStatus === entry.item ? 'animate-pulse opacity-50' : ''}`}
                                         >
                                             {inventory.find(inv => inv.item === entry.item)?.status === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                                         </button>
                                         <button 
                                            onClick={() => {
                                                setSelectedInventory(inventory.find(inv => inv.item === entry.item)!);
                                                setActiveModal('manage');
                                            }}
                                            className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all shadow-sm active:scale-90"
                                         >
                                            {inventory.find(inv => inv.item === entry.item)?.quantity} {inventory.find(inv => inv.item === entry.item)?.unit}
                                         </button>
                                     </div>
                                  )}
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                 {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              {entry.note && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">{entry.note}</p>
                              )}
                          </div>
                              <div className="flex items-center gap-4">
                                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-2xl">
                                      ฿{entry.price.toLocaleString()}
                                  </div>
                                  
                                  {/* Actions (visible on hover for desktop, or icons for mobile) */}
                                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => {
                                            setTimelineItem(entry.item);
                                            setActiveModal('timeline');
                                        }}
                                        className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 rounded-xl transition-all active:scale-90"
                                        title="View History"
                                        aria-label="View History"
                                    >
                                        <History size={20} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedEntry(entry);
                                            setActiveModal('edit');
                                        }}
                                        className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 rounded-xl transition-all active:scale-90"
                                        title="Edit"
                                        aria-label="Edit"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedEntry(entry);
                                            setActiveModal('delete');
                                        }}
                                        className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50 active:scale-90"
                                        title="Delete"
                                        aria-label="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                  </div>
                              </div>
                      </div>
                  ))}
               </div>
         )}

        {/* MODALS - LAZY RENDERED */}
        {activeModal === 'add' && (
            <AddEntryModal isOpen={true} onClose={() => { setActiveModal(null); router.push('/app'); }} />
        )}
        
        {activeModal === 'edit' && selectedEntry && (
            <EditEntryModal 
                entry={selectedEntry} 
                onClose={() => { setActiveModal(null); setSelectedEntry(null); }} 
            />
        )}

        {activeModal === 'delete' && selectedEntry && (
            <DeleteEntryModal 
                entry={selectedEntry} 
                onClose={() => { setActiveModal(null); setSelectedEntry(null); }} 
            />
        )}

        {activeModal === 'timeline' && timelineItem && (
            <TimelineModal 
                isOpen={true} 
                onCloseAction={() => { setActiveModal(null); setTimelineItem(null); }} 
                itemName={timelineItem} 
                entries={entries} 
            />
        )}

        {activeModal === 'manage' && selectedInventory && (
            <ManageInventoryModal
                isOpen={true}
                onClose={() => { setActiveModal(null); setSelectedInventory(null); }}
                inventoryItem={selectedInventory}
            />
        )}
    </div>
  );
}
