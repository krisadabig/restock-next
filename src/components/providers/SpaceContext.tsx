'use client';

import { createContext, useContext, ReactNode } from 'react';

export interface SpaceMemberSummary {
  memberId: number;
  displayName: string;
  avatar: string | null;
}

export interface SpaceContextValue {
  spaceId: string;
  memberId: number;
  displayName: string;
  avatar: string | null;
  members: SpaceMemberSummary[];
  mySpaces: Array<{ id: string; name: string }>;
}

const SpaceContext = createContext<SpaceContextValue | undefined>(undefined);

export function SpaceProvider({ initialValue, children }: { initialValue: SpaceContextValue; children: ReactNode }) {
  return <SpaceContext.Provider value={initialValue}>{children}</SpaceContext.Provider>;
}

export function useSpace(): SpaceContextValue {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error('useSpace must be used within SpaceProvider');
  return ctx;
}
