'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// import { useTranslation } from '@/lib/i18n';
import { updateInventory } from '@/app/app/actions';
import { X, Save, Hash, Tag, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryItem {
    id: number;
    item: string;
    status: string;
    quantity: number;
    unit: string;
    alertEnabled: number;
}

export default function ManageInventoryModal({ 
    isOpen, 
    onClose, 
    inventoryItem 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    inventoryItem: InventoryItem;
}) {
    // const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const quantity = parseFloat(formData.get('quantity') as string);
        const unit = formData.get('unit') as string;
        const alertEnabled = formData.get('alertEnabled') === 'on';

        try {
            await updateInventory(inventoryItem.item, { quantity, unit, alertEnabled });
            router.refresh();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 z-101 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-500/5">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Manage Stock</h2>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{inventoryItem.item}</p>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                                <Hash size={12} /> Quantity
                            </label>
                            <input 
                                name="quantity"
                                type="number"
                                step="0.01"
                                defaultValue={inventoryItem.quantity}
                                className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 transition-all dark:text-white font-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                                <Tag size={12} /> Unit
                            </label>
                            <select 
                                name="unit"
                                defaultValue={inventoryItem.unit}
                                className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 transition-all dark:text-white font-black appearance-none"
                            >
                                <option value="pcs">pcs</option>
                                <option value="kg">kg</option>
                                <option value="gram">g</option>
                                <option value="liters">L</option>
                                <option value="bottle">bottle</option>
                                <option value="pack">pack</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center bg-indigo-500/10 text-indigo-500 rounded-xl">
                                <Bell size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Enable Alerts</h3>
                                <p className="text-[10px] text-slate-400 font-medium leading-none">Notify when out of stock</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="alertEnabled" defaultChecked={inventoryItem.alertEnabled === 1} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'Processing...' : <><Save size={18} /> Update Inventory</>}
                    </button>
                    <div className="pb-4"></div>
                </form>
            </div>
        </div>,
        document.body
    );
}
