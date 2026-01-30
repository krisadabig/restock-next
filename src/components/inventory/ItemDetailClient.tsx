'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Scale, Bell, Settings, Plus, Minus, History, Calendar, Edit2, Trash2 } from 'lucide-react';
import { consumeItem, restockItem } from '@/app/app/actions';
import ManageInventoryModal from '@/components/dashboard/ManageInventoryModal';
import EditEntryModal from '@/components/dashboard/EditEntryModal';
import DeleteEntryModal from '@/components/dashboard/DeleteEntryModal';

interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
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

export default function ItemDetailClient({ 
    inventoryItem, 
    history 
}: { 
    inventoryItem: InventoryItem; 
    history: Entry[];
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Modal States
    const [isManageModalOpen, setManageModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null);

    // Optimistic UI
    const [optimisticQuantity, setOptimisticQuantity] = useState(inventoryItem.quantity);
    const [optimisticStatus, setOptimisticStatus] = useState(inventoryItem.status);

    const handleQuickAction = async (type: 'consume' | 'restock') => {
        if (loading) return;
        setLoading(true);

        const amount = 1;
        const newQty = type === 'consume' ? optimisticQuantity - amount : optimisticQuantity + amount;
        
        setOptimisticQuantity(newQty);
        setOptimisticStatus(newQty <= 0 ? 'out-of-stock' : 'in-stock');

        try {
            if (type === 'consume') {
                await consumeItem(inventoryItem.item, amount);
            } else {
                await restockItem(inventoryItem.item, amount);
            }
            router.refresh();
        } catch (err) {
            console.error(err);
            setOptimisticQuantity(inventoryItem.quantity); // Revert
            setOptimisticStatus(inventoryItem.status);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-32 space-y-6">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center gap-4 transition-all duration-300">
                <button 
                    onClick={() => router.back()}
                    className="h-10 w-10 flex items-center justify-center -ml-2 rounded-full active:bg-secondary transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-black tracking-tight text-foreground font-heading truncate">
                        {inventoryItem.item}
                    </h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        Stock Details
                    </p>
                </div>
                <button 
                    onClick={() => setManageModalOpen(true)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-primary active:scale-95 transition-all"
                >
                    <Settings size={20} />
                </button>
            </header>

            {/* Main Stock Card */}
            <div className="px-6">
                <div className="glass-panel p-6 rounded-3xl flex flex-col items-center gap-6 relative overflow-hidden">
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         optimisticStatus === 'out-of-stock'
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    }`}>
                        {optimisticStatus === 'out-of-stock' ? 'Out of Stock' : 'In Stock'}
                    </div>

                    <div className="w-full flex flex-col items-center pt-4">
                         <span className="text-6xl font-black text-foreground tracking-tighter">
                            {optimisticQuantity}
                         </span>
                         <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                            {inventoryItem.unit}
                         </span>
                    </div>

                    {/* Big Action Buttons */}
                    <div className="flex w-full gap-4 pt-4">
                        <button 
                            onClick={() => handleQuickAction('consume')}
                            disabled={loading}
                            className="flex-1 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all"
                        >
                            <Minus size={24} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Consume</span>
                        </button>
                        <button 
                            onClick={() => handleQuickAction('restock')}
                            disabled={loading}
                            className="flex-1 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all"
                        >
                            <Plus size={24} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Restock</span>
                        </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex w-full justify-between items-center pt-4 border-t border-border/50 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <Bell size={14} className={inventoryItem.alertEnabled ? 'text-primary' : 'text-muted-foreground/30'} />
                             <span className="font-medium">{inventoryItem.alertEnabled ? 'Alerts On' : 'Alerts Off'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Scale size={14} />
                             <span className="font-medium">Unit: {inventoryItem.unit}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="px-6 space-y-4">
                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <History size={16} /> Purchase History
                </h3>
                
                {history.length === 0 ? (
                    <div className="bg-secondary/20 p-8 rounded-2xl text-center text-muted-foreground text-sm border border-dashed border-border/50">
                        No purchase history found.
                    </div>
                ) : (
                    <div className="space-y-3">
                         {history.map(entry => (
                             <div key={entry.id} className="bg-card/50 border border-border/50 p-4 rounded-2xl flex items-center justify-between">
                                 <div>
                                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-1">
                                          <Calendar size={12} />
                                          {new Date(entry.date).toLocaleDateString()}
                                      </div>
                                      <div className="font-bold text-foreground">
                                          ฿{entry.price.toLocaleString()}
                                      </div>
                                      {entry.note && <div className="text-xs text-muted-foreground/70 italic mt-0.5 max-w-50 truncate">{entry.note}</div>}
                                 </div>
                                 <div className="flex items-center gap-1">
                                     <button 
                                        onClick={() => setEditingEntry(entry)}
                                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                                     >
                                         <Edit2 size={14} />
                                     </button>
                                     <button 
                                        onClick={() => setDeletingEntry(entry)}
                                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                     >
                                         <Trash2 size={14} />
                                     </button>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {isManageModalOpen && (
                <ManageInventoryModal 
                    isOpen={true} 
                    onClose={() => setManageModalOpen(false)} 
                    inventoryItem={inventoryItem}
                />
            )}
            {editingEntry && <EditEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} />}
            {deletingEntry && <DeleteEntryModal entry={deletingEntry} onClose={() => setDeletingEntry(null)} />}
        </div>
    );
}
