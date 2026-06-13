import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import DeleteEntryModal from './DeleteEntryModal';
import type { Entry } from '@/lib/db/schema';

afterEach(cleanup);

const mockEntry: Entry = {
  id: 1,
  householdId: 'hh1',
  itemId: 1,
  type: 'purchase',
  price: 89,
  quantity: 2,
  unit: 'bottle',
  store: 'Big C',
  date: '2026-06-10',
  note: null,
  userId: 'u1',
  createdAt: new Date(),
};

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('DeleteEntryModal', () => {
  it('renders nothing when closed', () => {
    const { container } = wrap(
      <DeleteEntryModal entry={mockEntry} itemName="Downy 1L" isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(container.querySelector('[data-modal]')).toBeNull();
  });

  it('renders when open', async () => {
    await act(async () => {
      wrap(<DeleteEntryModal entry={mockEntry} itemName="Downy 1L" isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    });
    expect(screen.getByTestId('delete-entry-modal')).toBeDefined();
  });

  it('shows the stock notice', async () => {
    await act(async () => {
      wrap(<DeleteEntryModal entry={mockEntry} itemName="Downy 1L" isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    });
    expect(screen.getByTestId('stock-notice')).toBeDefined();
    expect(screen.getByTestId('stock-notice').textContent).toContain('Downy 1L');
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    await act(async () => {
      wrap(<DeleteEntryModal entry={mockEntry} itemName="Downy 1L" isOpen={true} onClose={onClose} onConfirm={vi.fn()} />);
    });
    act(() => fireEvent.click(screen.getByTestId('cancel-btn')));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when delete is clicked', async () => {
    const onConfirm = vi.fn();
    await act(async () => {
      wrap(<DeleteEntryModal entry={mockEntry} itemName="Downy 1L" isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} />);
    });
    act(() => fireEvent.click(screen.getByTestId('confirm-delete-btn')));
    expect(onConfirm).toHaveBeenCalled();
  });
});
