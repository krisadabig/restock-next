'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export interface HouseholdMember {
  userId: string;
  username: string;
}

interface HouseholdContextValue {
  householdId: string;
  members: HouseholdMember[];
}

const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined);

interface HouseholdProviderProps {
  householdId: string;
  members: HouseholdMember[];
  children: ReactNode;
}

export function HouseholdProvider({ householdId, members, children }: HouseholdProviderProps) {
  return (
    <HouseholdContext.Provider value={{ householdId, members }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold(): HouseholdContextValue {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider');
  return ctx;
}
