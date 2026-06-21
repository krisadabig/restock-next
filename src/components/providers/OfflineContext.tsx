'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SyncEngine, SyncStatus } from '@/lib/sync';
import { addPendingMutation } from '@/lib/idb';
import type { MutationType } from '@/lib/idb';
import { v4 as uuidv4 } from 'uuid';
import type { EntryType } from '@/lib/constants';

// ── Payload types matching new schema ────────────────────────────────────────

export interface AddEntryPayload {
  itemId: number;
  type: EntryType;
  price: number | null;
  quantity: number;
  unit: string;
  store: string | null;
  date: string;
  note: string | null;
}

export interface OfflineContextType {
  isOnline: boolean;
  syncStatus: SyncStatus;
  addEntryOffline: (data: AddEntryPayload) => Promise<void>;
  updateEntryOffline: (id: number, data: Partial<Omit<AddEntryPayload, 'itemId'>>) => Promise<void>;
  deleteEntryOffline: (id: number) => Promise<void>;
  lastAction: number;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [lastAction, setLastAction] = useState(0);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [engine] = useState(() => new SyncEngine(setSyncStatus, () => setLastAction(Date.now())));

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); engine.sync(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [engine]);

  useEffect(() => {
    if (navigator.onLine) engine.sync();
  }, [engine]);

  const queue = async (type: MutationType, payload: unknown) => {
    await addPendingMutation({ id: uuidv4(), type, payload, timestamp: Date.now() });
    setLastAction(Date.now());
    if (navigator.onLine) engine.sync();
  };

  return (
    <OfflineContext.Provider value={{
      isOnline,
      syncStatus,
      addEntryOffline: (data) => queue('entry.add', data),
      updateEntryOffline: (id, data) => queue('entry.update', { id, data }),
      deleteEntryOffline: (id) => queue('entry.delete', { id }),
      lastAction,
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline(): OfflineContextType {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}
