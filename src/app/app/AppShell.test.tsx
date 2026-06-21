import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import { UIProvider, useItemSheet } from '@/components/providers/UIContext';
import { OfflineProvider } from '@/components/providers/OfflineContext';
import type { Item, Category } from '@/lib/db/schema';

afterEach(cleanup);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/app',
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('@/app/app/actions', () => ({
  updateItem: vi.fn().mockResolvedValue({}),
  deleteItem: vi.fn().mockResolvedValue({}),
}));

import AppShell from './AppShell';

const mockItem: Item = {
  id: 1, spaceId: 'sp1', categoryId: 1, name: 'Downy 1L Lavender',
  unit: 'bottle', currentStock: 3, lowStockThreshold: null, alertEnabled: true,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
};

const mockCategories: Category[] = [
  { id: 1, spaceId: 'sp1', name: 'Fabric Softener', defaultUnit: 'bottle', createdAt: new Date() },
];

function Trigger({ item, entryCount }: { item: Item; entryCount: number }) {
  const { openEdit } = useItemSheet();
  return (
    <button data-testid="open-edit" onClick={() => openEdit(item, entryCount)}>
      Open
    </button>
  );
}

const wrap = (ui: React.ReactNode) =>
  render(
    <I18nProvider initialLocale="en">
      <OfflineProvider>
        <UIProvider>{ui}</UIProvider>
      </OfflineProvider>
    </I18nProvider>
  );

describe('AppShell — EditItemSheet wiring', () => {
  it('renders EditItemSheet when isEditItemSheetOpen is true', async () => {
    await act(async () => {
      wrap(
        <AppShell categories={mockCategories}>
          <Trigger item={mockItem} entryCount={5} />
        </AppShell>
      );
    });
    await act(async () => { fireEvent.click(screen.getByTestId('open-edit')); });
    expect(screen.getByTestId('edit-item-sheet')).toBeDefined();
  });

  it('renders DeleteItemModal when delete is triggered from EditItemSheet', async () => {
    await act(async () => {
      wrap(
        <AppShell categories={mockCategories}>
          <Trigger item={mockItem} entryCount={5} />
        </AppShell>
      );
    });
    await act(async () => { fireEvent.click(screen.getByTestId('open-edit')); });
    await act(async () => { fireEvent.click(screen.getByTestId('delete-item-btn')); });
    expect(screen.getByTestId('delete-item-modal')).toBeDefined();
  });
});
