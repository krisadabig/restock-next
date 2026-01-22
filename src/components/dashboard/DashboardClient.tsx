'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import AddEntryModal from './AddEntryModal';
import EditEntryModal from './EditEntryModal';
import { useRouter } from 'next/navigation';
import { deleteEntry } from '@/app/app/actions';
import { Search, Edit2, Trash2, Calendar, ChevronDown } from 'lucide-react';

interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
}

export default function DashboardClient({ 
    entries, 
    showAddModal 
}: { 
    entries: Entry[];
    showAddModal: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all'); // YYYY-MM or 'all'
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    setIsDeleting(id);
    try {
        await deleteEntry(id);
        router.refresh();
    } catch (err) {
        alert('Failed to delete: ' + (err as Error).message);
    } finally {
        setIsDeleting(null);
    }
  };

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
                <div className="btn-premium h-11 w-11 rounded-2xl flex items-center justify-center font-black shadow-lg text-lg">
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
                             <h3 className="font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">{entry.item}</h3>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </p>
                             {entry.note && (
                                 <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{entry.note}</p>
                             )}
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-2xl">
                                 ฿{entry.price.toLocaleString()}
                             </div>
                             
                             {/* Actions (visible on hover for desktop, or icons for mobile) */}
                             <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setEditingEntry(entry)}
                                    className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(entry.id)}
                                    disabled={isDeleting === entry.id}
                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                             </div>
                         </div>
                     </div>
                 ))}
              </div>
        )}

        <AddEntryModal isOpen={showAddModal} onClose={() => router.push('/app')} />
        
        {editingEntry && (
            <EditEntryModal 
                entry={editingEntry} 
                onClose={() => setEditingEntry(null)} 
            />
        )}
    </div>
  );
}
