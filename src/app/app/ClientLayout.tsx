'use client';

import { ReactNode } from 'react';
import { OfflineProvider } from '@/components/providers/OfflineContext';
import { UIProvider } from '@/components/providers/UIContext';
import { SpaceProvider, SpaceContextValue } from '@/components/providers/SpaceContext';
import AppShell from './AppShell';
import type { Category } from '@/lib/db/schema';

interface Props {
  categories: Category[];
  spaceValue: SpaceContextValue;
  children: ReactNode;
}

export default function ClientLayout({ categories, spaceValue, children }: Props) {
  return (
    <SpaceProvider initialValue={spaceValue}>
      <OfflineProvider>
        <UIProvider>
          <AppShell categories={categories}>{children}</AppShell>
        </UIProvider>
      </OfflineProvider>
    </SpaceProvider>
  );
}
