'use client';

import { ReactNode } from 'react';
import { OfflineProvider } from '@/components/providers/OfflineContext';
import { UIProvider } from '@/components/providers/UIContext';
import { HouseholdProvider, HouseholdMember } from '@/components/providers/HouseholdContext';
import AppShell from './AppShell';
import type { Category } from '@/lib/db/schema';

interface Props {
  householdId: string;
  currentUserId: string;
  members: HouseholdMember[];
  categories: Category[];
  children: ReactNode;
}

export default function ClientLayout({ householdId, currentUserId, members, categories, children }: Props) {
  return (
    <HouseholdProvider householdId={householdId} currentUserId={currentUserId} members={members}>
      <OfflineProvider>
        <UIProvider>
          <AppShell categories={categories}>{children}</AppShell>
        </UIProvider>
      </OfflineProvider>
    </HouseholdProvider>
  );
}
