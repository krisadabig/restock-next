'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/lib/i18n';
import type { Item } from '@/lib/db/schema';

interface Props {
  item: Item;
  entryCount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteItemModal({ item, entryCount, isOpen, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try { onConfirm(); }
    finally { setLoading(false); }
  };

  if (!mounted || !isOpen) return null;

  const copy = t('app.deleteItemCopy').replace('{count}', String(entryCount));

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        data-testid="delete-item-modal"
        data-modal
        className="relative w-full max-w-sm glass rounded-[2.5rem] p-6 space-y-4 animate-in zoom-in-95 duration-200"
      >
        <h2 className="text-xl font-bold">{t('app.deleteItem')}</h2>

        <p className="font-bold text-foreground">{item.name}</p>

        <p className="text-sm text-muted-foreground">{copy}</p>

        <div className="flex gap-3 pt-2">
          <button
            data-testid="cancel-btn"
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl font-bold bg-secondary/50 hover:bg-secondary/80 transition-all"
          >
            {t('app.cancel')}
          </button>
          <button
            data-testid="confirm-delete-btn"
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-all"
          >
            {loading ? '...' : t('app.delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
