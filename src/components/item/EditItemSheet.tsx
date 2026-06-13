'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import BottomSheetContainer from '@/components/ui/BottomSheetContainer';
import { UNIT_OPTIONS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';
import { updateItem } from '@/app/app/actions';
import type { Item, Category } from '@/lib/db/schema';


interface Props {
  item: Item;
  categories: Category[];
  hasEntries?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDeleteClick: (item: Item) => void;
}

export default function EditItemSheet({ item, categories, hasEntries = false, isOpen, onClose, onDeleteClick }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState<string>(item.categoryId ? String(item.categoryId) : '');
  const [unit, setUnit] = useState(item.unit);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(item.name);
      setCategoryId(item.categoryId ? String(item.categoryId) : '');
      setUnit(item.unit);
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateItem(item.id, {
        name: name.trim(),
        categoryId: categoryId ? parseInt(categoryId) : null,
        unit,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetContainer isOpen={isOpen} onClose={onClose} testId="edit-item-sheet">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('app.editItem')}</h2>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-secondary/60 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.itemName')}</label>
            <input
              data-testid="item-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-premium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.category')}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-premium"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.unit')}</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input-premium"
            >
              {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            {hasEntries && (
              <p data-testid="unit-warning" className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-1">
                <AlertTriangle size={13} />
                {t('app.unitWarning')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base login-glow disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? '...' : t('app.saveChanges')}
          </button>
        </form>

        <div className="border-t border-border/50 pt-4">
          <button
            data-testid="delete-item-btn"
            type="button"
            onClick={() => onDeleteClick(item)}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-destructive hover:bg-destructive/10 font-bold text-sm transition-all"
          >
            <Trash2 size={16} />
            {t('app.deleteItem')}
          </button>
        </div>
    </BottomSheetContainer>
  );
}
