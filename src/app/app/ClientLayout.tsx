'use client';

import { ReactNode } from 'react';
import { OfflineProvider } from '@/components/providers/OfflineContext';
import { UIProvider } from '@/components/providers/UIContext';
import { HouseholdProvider, HouseholdMember } from '@/components/providers/HouseholdContext';
import { SpaceProvider, SpaceContextValue } from '@/components/providers/SpaceContext';
import AppShell from './AppShell';
import type { Category } from '@/lib/db/schema';

interface Props {
  householdId: string;
  currentUserId: string;
  members: HouseholdMember[];
  categories: Category[];
  spaceValue: SpaceContextValue;
  children: ReactNode;
}

export default function ClientLayout({ householdId, currentUserId, members, categories, spaceValue, children }: Props) {
  return (
    <SpaceProvider initialValue={spaceValue}>
      <HouseholdProvider householdId={householdId} currentUserId={currentUserId} members={members}>
        <OfflineProvider>
          <UIProvider>
            <AppShell categories={categories}>{children}</AppShell>
          </UIProvider>
        </OfflineProvider>
      </HouseholdProvider>
    </SpaceProvider>
  );
}
