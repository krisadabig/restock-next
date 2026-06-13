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

interface UIContextType {
  // Log entry sheet (FAB)
  isLogEntrySheetOpen: boolean;
  logEntryPrefillItemId: number | undefined;
  logEntryPrefillType: EntryType | undefined;
  setLogEntrySheetOpen: (open: boolean, prefillItemId?: number, prefillType?: EntryType) => void;

  // Quick Log sheet (chip tap from QuickLogStrip)
  isQuickLogOpen: boolean;
  quickLogItemId: number | null;
  quickLogPrefill: QuickLogPrefill | null;
  setQuickLogOpen: (open: boolean, itemId?: number, prefill?: QuickLogPrefill) => void;

  // Edit item sheet
  isEditItemSheetOpen: boolean;
  editItemTarget: Item | null;
  editItemEntryCount: number;
  setEditItemSheetOpen: (open: boolean, item?: Item, entryCount?: number) => void;

  // Edit entry sheet
  isEditEntrySheetOpen: boolean;
  editEntryTarget: Entry | null;
  setEditEntrySheetOpen: (open: boolean, entry?: Entry) => void;

  // Delete item modal
  isDeleteItemModalOpen: boolean;
  deleteItemTarget: Item | null;
  setDeleteItemModalOpen: (open: boolean, item?: Item) => void;

  // Legacy alias kept for remaining references during migration
  isAddModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isLogEntrySheetOpen, setLogOpen] = useState(false);
  const [logEntryPrefillItemId, setLogPrefillItemId] = useState<number | undefined>(undefined);
  const [logEntryPrefillType, setLogPrefillType] = useState<EntryType | undefined>(undefined);

  const [isQuickLogOpen, setQuickLogOpenState] = useState(false);
  const [quickLogItemId, setQuickLogItemId] = useState<number | null>(null);
  const [quickLogPrefill, setQuickLogPrefillState] = useState<QuickLogPrefill | null>(null);

  const [isEditItemSheetOpen, setEditItemOpen] = useState(false);
  const [editItemTarget, setEditItemTarget] = useState<Item | null>(null);
  const [editItemEntryCount, setEditItemEntryCount] = useState(0);

  const [isEditEntrySheetOpen, setEditEntryOpen] = useState(false);
  const [editEntryTarget, setEditEntryTarget] = useState<Entry | null>(null);

  const [isDeleteItemModalOpen, setDeleteItemOpen] = useState(false);
  const [deleteItemTarget, setDeleteItemTarget] = useState<Item | null>(null);

  const setLogEntrySheetOpen = (open: boolean, prefillItemId?: number, prefillType?: EntryType) => {
    setLogOpen(open);
    setLogPrefillItemId(open ? prefillItemId : undefined);
    setLogPrefillType(open ? prefillType : undefined);
  };

  const setQuickLogOpen = (open: boolean, itemId?: number, prefill?: QuickLogPrefill) => {
    setQuickLogOpenState(open);
    setQuickLogItemId(open && itemId != null ? itemId : null);
    setQuickLogPrefillState(open && prefill ? prefill : null);
  };

  const setEditItemSheetOpen = (open: boolean, item?: Item, entryCount?: number) => {
    setEditItemOpen(open);
    setEditItemTarget(open && item ? item : null);
    setEditItemEntryCount(open ? (entryCount ?? 0) : 0);
  };

  const setEditEntrySheetOpen = (open: boolean, entry?: Entry) => {
    setEditEntryOpen(open);
    setEditEntryTarget(open && entry ? entry : null);
  };

  const setDeleteItemModalOpen = (open: boolean, item?: Item) => {
    setDeleteItemOpen(open);
    setDeleteItemTarget(open && item ? item : null);
  };

  const setAddModalOpen = (open: boolean) => setLogEntrySheetOpen(open);

  return (
    <UIContext.Provider value={{
      isLogEntrySheetOpen,
      logEntryPrefillItemId,
      logEntryPrefillType,
      setLogEntrySheetOpen,
      isQuickLogOpen,
      quickLogItemId,
      quickLogPrefill,
      setQuickLogOpen,
      isEditItemSheetOpen,
      editItemTarget,
      editItemEntryCount,
      setEditItemSheetOpen,
      isEditEntrySheetOpen,
      editEntryTarget,
      setEditEntrySheetOpen,
      isDeleteItemModalOpen,
      deleteItemTarget,
      setDeleteItemModalOpen,
      isAddModalOpen: isLogEntrySheetOpen,
      setAddModalOpen,
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
