import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import DeleteItemModal from './DeleteItemModal';
import type { Item } from '@/lib/db/schema';

afterEach(cleanup);

const mockItem: Item = {
  id: 1,
  householdId: 'hh1',
  categoryId: 1,
  name: 'Downy 1L Lavender',
  unit: 'bottle',
  currentStock: 2,
  lowStockThreshold: null,
  alertEnabled: 1,
  lastEntryAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('DeleteItemModal', () => {
  it('renders nothing when closed', () => {
    const { container } = wrap(
      <DeleteItemModal item={mockItem} entryCount={12} isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(container.querySelector('[data-modal]')).toBeNull();
  });

  it('renders when open', async () => {
    await act(async () => {
      wrap(<DeleteItemModal item={mockItem} entryCount={12} isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    });
    expect(screen.getByTestId('delete-item-modal')).toBeDefined();
  });

  it('shows item name in the modal', async () => {
    await act(async () => {
      wrap(<DeleteItemModal item={mockItem} entryCount={12} isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    });
    expect(screen.getByTestId('delete-item-modal').textContent).toContain('Downy 1L Lavender');
  });

  it('shows entry count', async () => {
    await act(async () => {
      wrap(<DeleteItemModal item={mockItem} entryCount={12} isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    });
    expect(screen.getByTestId('delete-item-modal').textContent).toContain('12');
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    await act(async () => {
      wrap(<DeleteItemModal item={mockItem} entryCount={12} isOpen={true} onClose={onClose} onConfirm={vi.fn()} />);
    });
    act(() => fireEvent.click(screen.getByTestId('cancel-btn')));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm is clicked', async () => {
    const onConfirm = vi.fn();
    await act(async () => {
      wrap(<DeleteItemModal item={mockItem} entryCount={12} isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} />);
    });
    act(() => fireEvent.click(screen.getByTestId('confirm-delete-btn')));
    expect(onConfirm).toHaveBeenCalled();
  });
});
