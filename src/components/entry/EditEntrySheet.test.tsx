import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import EditEntrySheet from './EditEntrySheet';
import type { Entry } from '@/lib/db/schema';

afterEach(cleanup);

vi.mock('@/app/app/actions', () => ({
  getItemsForAutocomplete: vi.fn().mockResolvedValue([]),
  getCategories: vi.fn().mockResolvedValue([]),
  updateEntry: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/components/providers/OfflineContext', () => ({
  useOffline: () => ({ updateEntryOffline: vi.fn(), isOnline: true }),
}));

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

describe('EditEntrySheet', () => {
  it('renders nothing when closed', () => {
    const { container } = wrap(
      <EditEntrySheet entry={mockEntry} isOpen={false} onClose={vi.fn()} onDelete={vi.fn()} />
    );
    expect(container.querySelector('[data-sheet]')).toBeNull();
  });

  it('renders when open', async () => {
    await act(async () => {
      wrap(<EditEntrySheet entry={mockEntry} isOpen={true} onClose={vi.fn()} onDelete={vi.fn()} />);
    });
    expect(screen.getByTestId('edit-entry-sheet')).toBeDefined();
  });

  it('shows a delete button', async () => {
    await act(async () => {
      wrap(<EditEntrySheet entry={mockEntry} isOpen={true} onClose={vi.fn()} onDelete={vi.fn()} />);
    });
    expect(screen.getByTestId('delete-entry-btn')).toBeDefined();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    await act(async () => {
      wrap(<EditEntrySheet entry={mockEntry} isOpen={true} onClose={vi.fn()} onDelete={onDelete} />);
    });
    act(() => fireEvent.click(screen.getByTestId('delete-entry-btn')));
    expect(onDelete).toHaveBeenCalledWith(mockEntry);
  });

  it('pre-fills price from entry', async () => {
    await act(async () => {
      wrap(<EditEntrySheet entry={mockEntry} isOpen={true} onClose={vi.fn()} onDelete={vi.fn()} />);
    });
    const priceInput = screen.getByTestId('price-field').querySelector('input');
    expect((priceInput as HTMLInputElement).value).toBe('89');
  });
});
