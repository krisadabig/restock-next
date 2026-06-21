'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Item, Entry } from '@/lib/db/schema';
import type { EntryType } from '@/lib/constants';

export interface QuickLogPrefill {
  itemName: string;
  categoryName: string | null;
  unit: string;
  lastQty: number;
  lastPrice: number | null;
  lastStore: string | null;
}

// ── LogSheet ──────────────────────────────────────────────────────────────────

interface LogSheetValue {
  isOpen: boolean;
  prefillItemId: number | undefined;
  prefillType: EntryType | undefined;
  open(itemId?: number, type?: EntryType): void;
  close(): void;
}

const LogSheetCtx = createContext<LogSheetValue | undefined>(undefined);

export function useLogSheet(): LogSheetValue {
  const ctx = useContext(LogSheetCtx);
  if (!ctx) throw new Error('useLogSheet must be used within UIProvider');
  return ctx;
}

// ── QuickLog ──────────────────────────────────────────────────────────────────

interface QuickLogValue {
  isOpen: boolean;
  itemId: number | null;
  prefill: QuickLogPrefill | null;
  open(itemId: number, prefill: QuickLogPrefill): void;
  close(): void;
}

const QuickLogCtx = createContext<QuickLogValue | undefined>(undefined);

export function useQuickLog(): QuickLogValue {
  const ctx = useContext(QuickLogCtx);
  if (!ctx) throw new Error('useQuickLog must be used within UIProvider');
  return ctx;
}

// ── ItemSheet ─────────────────────────────────────────────────────────────────

interface ItemSheetValue {
  isEditOpen: boolean;
  editTarget: Item | null;
  editEntryCount: number;
  isDeleteOpen: boolean;
  deleteTarget: Item | null;
  openEdit(item: Item, entryCount?: number): void;
  openDelete(item: Item): void;
  close(): void;
}

const ItemSheetCtx = createContext<ItemSheetValue | undefined>(undefined);

export function useItemSheet(): ItemSheetValue {
  const ctx = useContext(ItemSheetCtx);
  if (!ctx) throw new Error('useItemSheet must be used within UIProvider');
  return ctx;
}

// ── EditEntry (compat only) ───────────────────────────────────────────────────

interface EditEntryValue {
  isOpen: boolean;
  target: Entry | null;
  set(open: boolean, entry?: Entry): void;
}

const EditEntryCtx = createContext<EditEntryValue | undefined>(undefined);

// ── UIProvider ────────────────────────────────────────────────────────────────

export function UIProvider({ children }: { children: ReactNode }) {
  const [logOpen, setLogOpen] = useState(false);
  const [logItemId, setLogItemId] = useState<number | undefined>(undefined);
  const [logType, setLogType] = useState<EntryType | undefined>(undefined);

  const [quickOpen, setQuickOpen] = useState(false);
  const [quickItemId, setQuickItemId] = useState<number | null>(null);
  const [quickPrefill, setQuickPrefill] = useState<QuickLogPrefill | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Item | null>(null);
  const [editCount, setEditCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const [editEntryOpen, setEditEntryOpen] = useState(false);
  const [editEntryTarget, setEditEntryTarget] = useState<Entry | null>(null);

  const logSheet: LogSheetValue = {
    isOpen: logOpen,
    prefillItemId: logItemId,
    prefillType: logType,
    open(itemId?, type?) { setLogOpen(true); setLogItemId(itemId); setLogType(type); },
    close() { setLogOpen(false); setLogItemId(undefined); setLogType(undefined); },
  };

  const quickLog: QuickLogValue = {
    isOpen: quickOpen,
    itemId: quickItemId,
    prefill: quickPrefill,
    open(id, p) { setQuickOpen(true); setQuickItemId(id); setQuickPrefill(p); },
    close() { setQuickOpen(false); setQuickItemId(null); setQuickPrefill(null); },
  };

  const itemSheet: ItemSheetValue = {
    isEditOpen: editOpen,
    editTarget,
    editEntryCount: editCount,
    isDeleteOpen: deleteOpen,
    deleteTarget,
    openEdit(item, entryCount = 0) { setEditOpen(true); setDeleteOpen(false); setEditTarget(item); setEditCount(entryCount); },
    openDelete(item) { setDeleteOpen(true); setEditOpen(false); setDeleteTarget(item); },
    close() { setEditOpen(false); setDeleteOpen(false); setEditTarget(null); setDeleteTarget(null); setEditCount(0); },
  };

  const editEntry: EditEntryValue = {
    isOpen: editEntryOpen,
    target: editEntryTarget,
    set(open, entry?) { setEditEntryOpen(open); setEditEntryTarget(open && entry ? entry : null); },
  };

  return (
    <LogSheetCtx.Provider value={logSheet}>
      <QuickLogCtx.Provider value={quickLog}>
        <ItemSheetCtx.Provider value={itemSheet}>
          <EditEntryCtx.Provider value={editEntry}>
            {children}
          </EditEntryCtx.Provider>
        </ItemSheetCtx.Provider>
      </QuickLogCtx.Provider>
    </LogSheetCtx.Provider>
  );
}

// ── Legacy useUI (compat shim — remove after S5 migration) ───────────────────

export function useUI() {
  const log = useLogSheet();
  const quick = useQuickLog();
  const item = useItemSheet();
  const editEntry = useContext(EditEntryCtx);
  if (!editEntry) throw new Error('useUI must be used within UIProvider');

  return {
    // LogSheet
    isLogEntrySheetOpen: log.isOpen,
    logEntryPrefillItemId: log.prefillItemId,
    logEntryPrefillType: log.prefillType,
    setLogEntrySheetOpen: (open: boolean, prefillItemId?: number, prefillType?: EntryType) =>
      open ? log.open(prefillItemId, prefillType) : log.close(),

    // QuickLog
    isQuickLogOpen: quick.isOpen,
    quickLogItemId: quick.itemId,
    quickLogPrefill: quick.prefill,
    setQuickLogOpen: (open: boolean, itemId?: number, prefill?: QuickLogPrefill) =>
      open && itemId != null && prefill ? quick.open(itemId, prefill) : quick.close(),

    // ItemSheet (edit)
    isEditItemSheetOpen: item.isEditOpen,
    editItemTarget: item.editTarget,
    editItemEntryCount: item.editEntryCount,
    setEditItemSheetOpen: (open: boolean, i?: Item, entryCount?: number) =>
      open && i ? item.openEdit(i, entryCount) : item.close(),

    // EditEntry (compat)
    isEditEntrySheetOpen: editEntry.isOpen,
    editEntryTarget: editEntry.target,
    setEditEntrySheetOpen: (open: boolean, entry?: Entry) => editEntry.set(open, entry),

    // ItemSheet (delete)
    isDeleteItemModalOpen: item.isDeleteOpen,
    deleteItemTarget: item.deleteTarget,
    setDeleteItemModalOpen: (open: boolean, i?: Item) =>
      open && i ? item.openDelete(i) : item.close(),
  };
}
