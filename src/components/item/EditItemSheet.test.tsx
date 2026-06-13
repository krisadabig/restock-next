import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import EditItemSheet from './EditItemSheet';
import type { Item, Category } from '@/lib/db/schema';

afterEach(cleanup);

vi.mock('@/app/app/actions', () => ({
  updateItem: vi.fn().mockResolvedValue({}),
}));

const mockItem: Item = {
  id: 1,
  householdId: 'hh1',
  categoryId: 1,
  name: 'Downy 1L Lavender',
  unit: 'bottle',
  currentStock: 3,
  lowStockThreshold: null,
  alertEnabled: 1,
  lastEntryAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCategories: Category[] = [
  { id: 1, householdId: 'hh1', name: 'Fabric Softener', defaultUnit: 'bottle', createdAt: new Date() },
];

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('EditItemSheet', () => {
  it('renders nothing when closed', () => {
    const { container } = wrap(
      <EditItemSheet item={mockItem} categories={mockCategories} isOpen={false} onClose={vi.fn()} onDeleteClick={vi.fn()} />
    );
    expect(container.querySelector('[data-sheet]')).toBeNull();
  });

  it('renders when open', async () => {
    await act(async () => {
      wrap(<EditItemSheet item={mockItem} categories={mockCategories} isOpen={true} onClose={vi.fn()} onDeleteClick={vi.fn()} />);
    });
    expect(screen.getByTestId('edit-item-sheet')).toBeDefined();
  });

  it('pre-fills item name', async () => {
    await act(async () => {
      wrap(<EditItemSheet item={mockItem} categories={mockCategories} isOpen={true} onClose={vi.fn()} onDeleteClick={vi.fn()} />);
    });
    const nameInput = screen.getByTestId('item-name-input') as HTMLInputElement;
    expect(nameInput.value).toBe('Downy 1L Lavender');
  });

  it('shows unit warning when item has entries', async () => {
    await act(async () => {
      wrap(<EditItemSheet item={mockItem} categories={mockCategories} hasEntries isOpen={true} onClose={vi.fn()} onDeleteClick={vi.fn()} />);
    });
    expect(screen.getByTestId('unit-warning')).toBeDefined();
  });

  it('does not show unit warning when item has no entries', async () => {
    await act(async () => {
      wrap(<EditItemSheet item={mockItem} categories={mockCategories} hasEntries={false} isOpen={true} onClose={vi.fn()} onDeleteClick={vi.fn()} />);
    });
    expect(screen.queryByTestId('unit-warning')).toBeNull();
  });

  it('shows delete button', async () => {
    await act(async () => {
      wrap(<EditItemSheet item={mockItem} categories={mockCategories} isOpen={true} onClose={vi.fn()} onDeleteClick={vi.fn()} />);
    });
    expect(screen.getByTestId('delete-item-btn')).toBeDefined();
  });

  it('calls onDeleteClick when delete is clicked', async () => {
    const onDeleteClick = vi.fn();
    await act(async () => {
      wrap(<EditItemSheet item={mockItem} categories={mockCategories} isOpen={true} onClose={vi.fn()} onDeleteClick={onDeleteClick} />);
    });
    act(() => fireEvent.click(screen.getByTestId('delete-item-btn')));
    expect(onDeleteClick).toHaveBeenCalledWith(mockItem);
  });
});
