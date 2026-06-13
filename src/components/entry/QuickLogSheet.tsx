'use client';

import { useState } from 'react';
import { ShoppingBag, ArrowDownRight } from 'lucide-react';
import BottomSheetContainer from '@/components/ui/BottomSheetContainer';
import { useTranslation } from '@/lib/i18n';
import { useOffline } from '@/components/providers/OfflineContext';
import { ENTRY_TYPE } from '@/lib/constants';
import type { EntryType } from '@/lib/constants';
import type { QuickLogPrefill } from '@/components/providers/UIContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemId: number | null;
  prefill: QuickLogPrefill | null;
}

export default function QuickLogSheet({ isOpen, onClose, itemId, prefill }: Props) {
  const { t } = useTranslation();
  const { addEntryOffline } = useOffline();

  const [type, setType] = useState<EntryType>(ENTRY_TYPE.PURCHASE);
  const [qty, setQty] = useState(prefill?.lastQty ?? 1);
  const [priceChanged, setPriceChanged] = useState(false);
  const [price, setPrice] = useState(String(prefill?.lastPrice ?? ''));
  const [store, setStore] = useState(prefill?.lastStore ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      await addEntryOffline({
        itemId,
        type,
        quantity: qty,
        unit: prefill?.unit ?? 'pcs',
        price: type === ENTRY_TYPE.PURCHASE && price ? parseFloat(price) : null,
        store: type === ENTRY_TYPE.PURCHASE && store ? store : null,
        date: new Date().toISOString().slice(0, 10),
        note: null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetContainer isOpen={isOpen} onClose={onClose} testId="quick-log-sheet">
      {/* Item info */}
      <div>
        <p className="text-lg font-bold leading-tight">{prefill?.itemName}</p>
        {prefill?.categoryName && (
          <p className="text-xs text-muted-foreground mt-0.5">{prefill.categoryName}</p>
        )}
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 p-1 bg-secondary/40 rounded-2xl">
        {([ENTRY_TYPE.PURCHASE, ENTRY_TYPE.CONSUME] as const).map((t_) => (
          <button
            key={t_}
            type="button"
            data-testid={`type-${t_}`}
            aria-pressed={type === t_}
            onClick={() => setType(t_)}
            className={`flex-1 h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              type === t_ ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t_ === ENTRY_TYPE.PURCHASE ? <ShoppingBag size={15} /> : <ArrowDownRight size={15} />}
            {t_ === ENTRY_TYPE.PURCHASE ? t('app.purchase') : t('app.consume')}
          </button>
        ))}
      </div>

      {/* Quantity stepper + unit label */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.quantity')}</p>
        <div className="flex items-center gap-4 bg-secondary/30 rounded-2xl px-4 py-3">
          <button
            type="button"
            data-testid="qty-decrement"
            onClick={() => setQty((q) => Math.max(0.5, +(q - 1).toFixed(2)))}
            className="w-9 h-9 rounded-xl bg-secondary/60 font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            −
          </button>
          <span data-testid="qty-value" className="flex-1 text-center text-lg font-bold tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            data-testid="qty-increment"
            onClick={() => setQty((q) => +(q + 1).toFixed(2))}
            className="w-9 h-9 rounded-xl bg-secondary/60 font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            +
          </button>
          <span data-testid="unit-label" className="text-sm text-muted-foreground min-w-[3rem]">
            {prefill?.unit ?? 'pcs'}
          </span>
        </div>
      </div>

      {/* Price + Store (purchase only) */}
      {type === ENTRY_TYPE.PURCHASE && (
        <>
          <div data-testid="price-section" className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.pricePerUnit')}</p>
            {!priceChanged && prefill?.lastPrice != null ? (
              <div className="flex items-center gap-3">
                <span data-testid="price-preconfirm" className="text-sm font-semibold">
                  ฿{prefill.lastPrice} ({t('app.sameAsLast')})
                </span>
                <button
                  type="button"
                  data-testid="change-price-btn"
                  onClick={() => setPriceChanged(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  [{t('app.change')}]
                </button>
              </div>
            ) : (
              <input
                type="number"
                min="0"
                step="any"
                data-testid="price-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-premium"
                placeholder="0"
                autoFocus
              />
            )}
          </div>

          <div data-testid="store-section" className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('app.store')}</p>
            <input
              type="text"
              data-testid="store-input"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="input-premium"
              placeholder="Big C, CJ..."
            />
          </div>
        </>
      )}

      {/* Save */}
      <button
        type="button"
        data-testid="quick-log-save"
        disabled={!itemId || loading}
        onClick={handleSave}
        className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base login-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {loading ? '...' : t('app.save')}
      </button>
    </BottomSheetContainer>
  );
}
