'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import AddEntryModal from './AddEntryModal';
import EditEntryModal from './EditEntryModal';
import DeleteEntryModal from './DeleteEntryModal';
import TimelineModal from './TimelineModal';
import { useRouter } from 'next/navigation';
import { CloudOff, Package } from 'lucide-react';
import { useOffline } from '@/components/providers/OfflineContext';
import { useUI } from '@/components/providers/UIContext';
import { getEntriesCache, getPendingMutations } from '@/lib/idb';
import { Entry } from '@/app/app/actions';
import EntryCard from './EntryCard';
import DashboardFilters from './DashboardFilters';

export default function DashboardClient({ 
    entries: initialEntries, 
}: { 
    entries: Entry[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isOnline, refreshCache, lastAction } = useOffline();
  const { isAddModalOpen, setAddModalOpen } = useUI();
  
  // State
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  
  // Modal states
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | 'timeline' | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [timelineItem, setTimelineItem] = useState<string | null>(null);
  
  // Refs
  const processedActionRef = useRef(lastAction);
  const hasAttemptedHydrationRef = useRef(false);

  // Sync Global Context: Refactored to avoid effect sync.
  // We use isAddModalOpen directly for the add modal.
  // We ensure mutual exclusivity when opening other modals.

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
  }, [initialEntries, refreshCache, lastAction, isOnline, router]);

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

  // Handlers
  const handleEdit = (entry: Entry) => {
      setAddModalOpen(false);
      setSelectedEntry(entry);
      setActiveModal('edit');
  };

  const handleDelete = (entry: Entry) => {
      setAddModalOpen(false);
      setSelectedEntry(entry);
      setActiveModal('delete');
  };

  const handleTimeline = (itemName: string) => {
      setAddModalOpen(false);
      setTimelineItem(itemName);
      setActiveModal('timeline');
  };

  return (
    <div className="pb-32 space-y-6">
        {/* ... (Header and filters skipped, logic same) ... */}

        {/* ... (List content skipped) ... */}

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
        <DashboardFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            months={months}
        />

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
                         <EntryCard 
                            key={entry.id} 
                            entry={entry} 
                            onClickEdit={handleEdit}
                            onClickDelete={handleDelete}
                            onClickTimeline={handleTimeline}
                         />
                     ))}
                  </div>
            )}
        </div>

        {/* MODALS */}
        {isAddModalOpen && <AddEntryModal isOpen={true} onClose={() => setAddModalOpen(false)} />}
        {activeModal === 'edit' && selectedEntry && <EditEntryModal entry={selectedEntry} onClose={() => { setActiveModal(null); setSelectedEntry(null); }} />}
        {activeModal === 'delete' && selectedEntry && <DeleteEntryModal entry={selectedEntry} onClose={() => { setActiveModal(null); setSelectedEntry(null); }} />}
        {activeModal === 'timeline' && timelineItem && <TimelineModal isOpen={true} onCloseAction={() => { setActiveModal(null); setTimelineItem(null); }} itemName={timelineItem} entries={entries} />}
    </div>
  );
}
