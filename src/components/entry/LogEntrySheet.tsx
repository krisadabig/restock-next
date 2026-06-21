'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ShoppingBag, ArrowDownRight } from 'lucide-react';
import BottomSheetContainer from '@/components/ui/BottomSheetContainer';
import { useTranslation } from '@/lib/i18n';
import { useOffline } from '@/components/providers/OfflineContext';
import type { ItemSuggestion } from '@/components/ui/Autocomplete';
import { getItemsForAutocomplete, getCategories, addItem, addCategory } from '@/app/app/actions';
import type { Category } from '@/lib/db/schema';
import { ENTRY_TYPE, DEFAULTS, UNIT_OPTIONS } from '@/lib/constants';
import type { EntryType } from '@/lib/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefillItemId?: number;
  prefillType?: EntryType;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const monthShort = d.toLocaleDateString('en', { month: 'short' });
  return isToday ? `Today, ${monthShort} ${d.getDate()}` : `${monthShort} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function LogEntrySheet({ isOpen, onClose, prefillItemId, prefillType }: Props) {
  const { t } = useTranslation();
  const { addEntryOffline } = useOffline();

  const [type, setType] = useState<EntryType>(prefillType ?? ENTRY_TYPE.PURCHASE);
  const [selectedItem, setSelectedItem] = useState<ItemSuggestion | null>(null);
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState<string>(DEFAULTS.UNIT);
  const [priceMode, setPriceMode] = useState<'preconfirm' | 'input'>('input');
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [date, setDate] = useState(todayStr);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ItemSuggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const selectItem = useCallback((item: ItemSuggestion) => {
    setSelectedItem(item);
    setUnit(item.unit ?? DEFAULTS.UNIT);
    setQty(item.lastQty ?? 1);
    if (item.lastPrice != null) {
      setPrice(String(item.lastPrice));
      setPriceMode('preconfirm');
    } else {
      setPrice('');
      setPriceMode('input');
    }
    setStore(item.lastStore ?? '');
    setSearchQuery('');
    setShowNewItemForm(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setType(prefillType ?? ENTRY_TYPE.PURCHASE);
    setSelectedItem(null);
    setQty(1);
    setUnit(DEFAULTS.UNIT);
    setPriceMode('input');
    setPrice('');
    setStore('');
    setDate(todayStr());
    setShowDatePicker(false);
    setShowUnitPicker(false);
    setNote('');
    setShowNote(false);
    setShowNewItemForm(false);
    setSearchQuery('');
    getItemsForAutocomplete().then((items) => {
      setSuggestions(items);
      if (prefillItemId) {
        const match = items.find((s) => s.id === prefillItemId);
        if (match) selectItem(match);
      }
    }).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  }, [isOpen, prefillType, prefillItemId, selectItem]);

  const handleSubmit = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      await addEntryOffline({
        itemId: selectedItem.id,
        type,
        price: type === ENTRY_TYPE.PURCHASE && price ? parseFloat(price) : null,
        quantity: qty,
        unit,
        store: type === ENTRY_TYPE.PURCHASE && store ? store : null,
        date,
        note: note || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const recentChips = suggestions.slice(0, DEFAULTS.RECENT_CHIPS_GRID);
  const searchResults = searchQuery
    ? suggestions.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.categoryName?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <BottomSheetContainer isOpen={isOpen} onClose={onClose} testId="log-entry-sheet">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('app.logEntry')}</h2>
        <button
          data-testid="close-sheet"
          onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-secondary/60 transition-all"
        >
          <X size={18} />
        </button>
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

      {/* Item selection or selected item display */}
      {!selectedItem && !showNewItemForm ? (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('app.itemName')}
          </p>

          {/* Chip grid */}
          {recentChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recentChips.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`item-chip-${item.id}`}
                  onClick={() => selectItem(item)}
                  className="px-3 py-1.5 rounded-xl bg-secondary/50 hover:bg-primary/10 hover:text-primary text-sm font-semibold transition-all active:scale-[0.97]"
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}

          {/* Search input */}
          <input
            type="text"
            data-testid="item-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('app.typeToSearch')}
            className="input-premium text-sm"
          />

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="bg-secondary/20 rounded-2xl overflow-hidden border border-primary/10">
              {searchResults.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`item-search-result-${item.id}`}
                  onClick={() => selectItem(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <p className="font-bold text-sm">{item.name}</p>
                  {item.categoryName && (
                    <p className="text-[11px] text-muted-foreground">{item.categoryName}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowNewItemForm(true)}
            className="text-xs font-bold text-primary hover:underline"
          >
            {t('app.newItem')}
          </button>
        </div>
      ) : showNewItemForm ? (
        <NewItemInlineFields
          categories={categories}
          onCreated={(item) => {
            selectItem({ ...item, lastQty: null, lastPrice: null, lastStore: null });
          }}
          onCancel={() => setShowNewItemForm(false)}
        />
      ) : (
        /* Selected item + form */
        <div className="space-y-4">
          {/* Selected item chip */}
          <div className="flex items-center gap-2">
            <span className="flex-1 text-sm font-bold bg-primary/10 text-primary rounded-xl px-3 py-1.5">
              {selectedItem!.name}
              {selectedItem!.categoryName && (
                <span className="ml-1.5 text-xs font-normal text-primary/70">· {selectedItem!.categoryName}</span>
              )}
            </span>
            <button
              type="button"
              data-testid="clear-item-btn"
              onClick={() => setSelectedItem(null)}
              className="h-8 w-8 rounded-xl bg-secondary/50 hover:bg-secondary/80 flex items-center justify-center transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* Quantity stepper + unit */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('app.quantity')}
            </p>
            <div className="flex items-center gap-4 bg-secondary/30 rounded-2xl px-4 py-3">
              <button
                type="button"
                data-testid="qty-decrement"
                onClick={() => setQty((q) => Math.max(0.5, +(q - 1).toFixed(2)))}
                className="w-9 h-9 rounded-xl bg-secondary/60 font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                −
              </button>
              <span
                data-testid="qty-value"
                className="flex-1 text-center text-lg font-bold tabular-nums"
              >
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
                {unit}
              </span>
              <button
                type="button"
                data-testid="change-unit-btn"
                onClick={() => setShowUnitPicker((v) => !v)}
                className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-all shrink-0"
              >
                ≠ unit
              </button>
            </div>
            {showUnitPicker && (
              <select
                data-testid="unit-select"
                value={unit}
                onChange={(e) => { setUnit(e.target.value); setShowUnitPicker(false); }}
                className="input-premium text-sm"
              >
                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            )}
          </div>

          {/* Price + Store (purchase only) */}
          {type === ENTRY_TYPE.PURCHASE && (
            <>
              <div data-testid="price-field" className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t('app.pricePerUnit')}
                </p>
                {priceMode === 'preconfirm' ? (
                  <div className="flex items-center gap-3">
                    <span data-testid="price-preconfirm" className="text-sm font-semibold">
                      ฿{price} ({t('app.sameAsLast')})
                    </span>
                    <button
                      type="button"
                      data-testid="change-price-btn"
                      onClick={() => setPriceMode('input')}
                      className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-all"
                    >
                      {t('app.change')}
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
                  />
                )}
              </div>

              <div data-testid="store-field" className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t('app.store')}
                </p>
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

          {/* Date as label */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('app.date')}
            </p>
            {showDatePicker ? (
              <input
                type="date"
                data-testid="date-input"
                value={date}
                onChange={(e) => { setDate(e.target.value); setShowDatePicker(false); }}
                className="input-premium"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span data-testid="date-label" className="text-sm font-semibold">
                  {formatDateLabel(date)}
                </span>
                <button
                  type="button"
                  data-testid="change-date-btn"
                  onClick={() => setShowDatePicker(true)}
                  className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-all"
                >
                  ≠
                </button>
              </div>
            )}
          </div>

          {/* Note (collapsible) */}
          {!showNote ? (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {t('app.noteOptional')} +
            </button>
          ) : (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('app.note')}
              </p>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-premium"
                placeholder={t('app.placeholderNote')}
              />
            </div>
          )}

          <button
            type="button"
            data-testid="save-btn"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base login-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? '...' : t('app.save')}
          </button>
        </div>
      )}
    </BottomSheetContainer>
  );
}

// ── Inline new-item form ──────────────────────────────────────────────────────

interface NewItemInlineFieldsProps {
  categories: Category[];
  onCreated: (item: ItemSuggestion & { unit: string }) => void;
  onCancel: () => void;
}

function NewItemInlineFields({ categories, onCreated, onCancel }: NewItemInlineFieldsProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [newCatName, setNewCatName] = useState('');
  const [unit, setUnit] = useState<string>(DEFAULTS.UNIT);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      let resolvedCategoryId: number | null = categoryId ? parseInt(categoryId) : null;
      if (categoryId === 'new' && newCatName.trim()) {
        const cat = await addCategory({ name: newCatName.trim(), defaultUnit: unit });
        resolvedCategoryId = cat.id;
      }
      const item = await addItem({ name: name.trim(), unit, categoryId: resolvedCategoryId });
      onCreated({ id: item.id, name: item.name, categoryName: null, unit: item.unit });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary/30 rounded-2xl p-4 space-y-3 border border-primary/10">
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-premium text-sm"
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="input-premium text-sm"
      >
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        <option value="new">{t('app.addCategory')}</option>
      </select>
      {categoryId === 'new' && (
        <input
          type="text"
          placeholder="Category name"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="input-premium text-sm"
        />
      )}
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="input-premium text-sm"
      >
        {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-xl text-sm font-bold bg-secondary/50 hover:bg-secondary/80 transition-all"
        >
          {t('app.cancel')}
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="flex-1 h-10 rounded-xl text-sm font-bold bg-primary text-white disabled:opacity-50 transition-all"
        >
          {loading ? '...' : t('app.save')}
        </button>
      </div>
    </div>
  );
}
