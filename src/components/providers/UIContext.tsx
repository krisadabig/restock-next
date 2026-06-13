'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Item, Entry } from '@/lib/db/schema';

interface UIContextType {
  // Log entry sheet (FAB)
  isLogEntrySheetOpen: boolean;
  logEntryPrefillItemId: number | undefined;
  logEntryPrefillType: 'purchase' | 'consume' | undefined;
  setLogEntrySheetOpen: (open: boolean, prefillItemId?: number, prefillType?: 'purchase' | 'consume') => void;

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
  const [logEntryPrefillType, setLogPrefillType] = useState<'purchase' | 'consume' | undefined>(undefined);

  const [isEditItemSheetOpen, setEditItemOpen] = useState(false);
  const [editItemTarget, setEditItemTarget] = useState<Item | null>(null);
  const [editItemEntryCount, setEditItemEntryCount] = useState(0);

  const [isEditEntrySheetOpen, setEditEntryOpen] = useState(false);
  const [editEntryTarget, setEditEntryTarget] = useState<Entry | null>(null);

  const [isDeleteItemModalOpen, setDeleteItemOpen] = useState(false);
  const [deleteItemTarget, setDeleteItemTarget] = useState<Item | null>(null);

  const setLogEntrySheetOpen = (open: boolean, prefillItemId?: number, prefillType?: 'purchase' | 'consume') => {
    setLogOpen(open);
    setLogPrefillItemId(open ? prefillItemId : undefined);
    setLogPrefillType(open ? prefillType : undefined);
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
