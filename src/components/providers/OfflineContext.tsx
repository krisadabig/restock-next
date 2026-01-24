'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SyncEngine, SyncStatus } from '@/lib/sync';
import { 
    addPendingMutation, 
    saveEntriesCache 
} from '@/lib/idb';
import { v4 as uuidv4 } from 'uuid';

// Define types for actions to match server actions
interface Entry {
    id: number;
    item: string;
    price: number;
    date: string;
    note: string | null;
}

interface NewEntryData {
    item: string;
    price: number;
    date: string;
    note?: string;
}

interface UpdateEntryData {
    item: string;
    price: number;
    date: string;
    note?: string | null;
}

interface OfflineContextType {
    isOnline: boolean;
    syncStatus: SyncStatus;
    // Proxies for actions
    addEntryOffline: (data: NewEntryData) => Promise<void>;
    updateEntryOffline: (id: number, data: UpdateEntryData) => Promise<void>;
    deleteEntryOffline: (id: number) => Promise<void>;
    refreshCache: (entries: Entry[]) => Promise<void>;
    lastAction: number;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
    const [lastAction, setLastAction] = useState(0);
    const [isOnline, setIsOnline] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [engine] = useState(() => new SyncEngine(setSyncStatus, () => setLastAction(Date.now())));

    // ... (existing useEffects)
    // Monitor Online Status
    useEffect(() => {
        // Initial check
        // eslint-disable-next-line
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            engine.sync();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [engine]);

    // Initial Sync on Mount
    useEffect(() => {
        if (navigator.onLine) {
            engine.sync();
        }
    }, [engine]);


    const triggerUpdate = () => setLastAction(Date.now());

    const addEntryOffline = async (data: NewEntryData) => {
        // Always queue mutation to IDB first for instant Optimistic UI
        await queueMutation('add', data);
    };

    const updateEntryOffline = async (id: number, data: UpdateEntryData) => {
        // Always queue mutation to IDB first for instant Optimistic UI
        await queueMutation('edit', { id, data });
    };

    const deleteEntryOffline = async (id: number) => {
        // Always queue mutation to IDB first for instant Optimistic UI
        await queueMutation('delete', { id });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queueMutation = async (type: 'add' | 'edit' | 'delete', payload: any) => {
        await addPendingMutation({
            id: uuidv4(),
            type,
            payload,
            timestamp: Date.now()
        });
        triggerUpdate();
        // Optimistically trigger sync check (will fail if offline, but sets status)
        if (navigator.onLine) engine.sync();
    };

    const refreshCache = async (entries: Entry[]) => {
        await saveEntriesCache(entries);
        triggerUpdate();
    };

    return (
        <OfflineContext.Provider value={{ 
            isOnline, 
            syncStatus,
            addEntryOffline,
            updateEntryOffline,
            deleteEntryOffline,
            refreshCache,
            lastAction
        }}>
            {children}
        </OfflineContext.Provider>
    );
}

export function useOffline() {
    const context = useContext(OfflineContext);
    if (!context) throw new Error('useOffline must be used within OfflineProvider');
    return context;
}
