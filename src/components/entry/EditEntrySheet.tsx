'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, ShoppingBag, ArrowDownRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useOffline } from '@/components/providers/OfflineContext';
import PillSelector from '@/components/ui/PillSelector';
import type { Entry } from '@/lib/db/schema';

const UNIT_OPTIONS = ['pcs', 'bottle', 'pack', 'kg', 'g', 'L', 'ml', 'box', 'bag'];

interface Props {
  entry: Entry;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (entry: Entry) => void;
}

export default function EditEntrySheet({ entry, isOpen, onClose, onDelete }: Props) {
  const { t } = useTranslation();
  const { updateEntryOffline } = useOffline();

  const [mounted, setMounted] = useState(false);
  const [type, setType] = useState<'purchase' | 'consume'>(entry.type as 'purchase' | 'consume');
  const [quantity, setQuantity] = useState(String(entry.quantity));
  const [unit, setUnit] = useState(entry.unit);
  const [price, setPrice] = useState(entry.price != null ? String(entry.price) : '');
  const [store, setStore] = useState(entry.store ?? '');
  const [date, setDate] = useState(entry.date);
  const [note, setNote] = useState(entry.note ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      setType(entry.type as 'purchase' | 'consume');
      setQuantity(String(entry.quantity));
      setUnit(entry.unit);
      setPrice(entry.price != null ? String(entry.price) : '');
      setStore(entry.store ?? '');
      setDate(entry.date);
      setNote(entry.note ?? '');
    }
  }, [isOpen, entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateEntryOffline(entry.id, {
        type,
        price: type === 'purchase' && price ? parseFloat(price) : null,
        quantity: parseFloat(quantity) || 1,
        unit,
        store: type === 'purchase' && store ? store : null,
        date,
        note: note || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        data-testid="edit-entry-sheet"
        className="relative w-full max-w-md glass rounded-t-[2.5rem] sm:rounded-[2.5rem] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 p-6 space-y-5"
      >
        <div className="sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto -mt-2 mb-2" />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('app.editEntry')}</h2>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-secondary/60 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 p-1 bg-secondary/40 rounded-2xl">
          {(['purchase', 'consume'] as const).map((t_) => (
            <button
              key={t_}
              type="button"
              aria-pressed={type === t_}
              onClick={() => setType(t_)}
              className={`flex-1 h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                type === t_ ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t_ === 'purchase' ? <ShoppingBag size={15} /> : <ArrowDownRight size={15} />}
              {t_ === 'purchase' ? t('app.purchase') : t('app.consume')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.quantity')}</label>
              <input type="number" min="0.01" step="any" required value={quantity}
                onChange={(e) => setQuantity(e.target.value)} className="input-premium" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.unit')}</label>
              <PillSelector options={UNIT_OPTIONS} value={unit} onChange={setUnit} />
            </div>
          </div>

          {type === 'purchase' && (
            <div className="grid grid-cols-2 gap-3">
              <div data-testid="price-field" className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.pricePerUnit')}</label>
                <input type="number" min="0" step="any" value={price}
                  onChange={(e) => setPrice(e.target.value)} className="input-premium" />
              </div>
              <div data-testid="store-field" className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.store')}</label>
                <input type="text" value={store} onChange={(e) => setStore(e.target.value)} className="input-premium" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.date')}</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-premium" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.note')}</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="input-premium" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base login-glow disabled:opacity-50 transition-all active:scale-[0.98]">
            {loading ? '...' : t('app.saveChanges')}
          </button>
        </form>

        {/* Delete */}
        <div className="border-t border-border/50 pt-4">
          <button
            data-testid="delete-entry-btn"
            type="button"
            onClick={() => onDelete(entry)}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-destructive hover:bg-destructive/10 font-bold text-sm transition-all"
          >
            <Trash2 size={16} />
            {t('app.deleteEntry')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
