'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
    isAddModalOpen: boolean;
    setAddModalOpen: (isOpen: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    return (
        <UIContext.Provider value={{ isAddModalOpen, setAddModalOpen }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within UIProvider');
    return context;
}
