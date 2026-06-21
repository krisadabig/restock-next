'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Item } from '@/lib/db/schema';
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

  return (
    <LogSheetCtx.Provider value={logSheet}>
      <QuickLogCtx.Provider value={quickLog}>
        <ItemSheetCtx.Provider value={itemSheet}>
          {children}
        </ItemSheetCtx.Provider>
      </QuickLogCtx.Provider>
    </LogSheetCtx.Provider>
  );
}
