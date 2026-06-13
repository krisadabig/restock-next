import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import LogEntrySheet from './LogEntrySheet';

afterEach(cleanup);

// Mock server actions
vi.mock('@/app/app/actions', () => ({
  getItemsForAutocomplete: vi.fn().mockResolvedValue([
    { id: 1, name: 'Downy 1L Lavender', categoryName: 'Fabric Softener', unit: 'bottle' },
  ]),
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: 'Fabric Softener', defaultUnit: 'bottle' },
  ]),
  addEntry: vi.fn().mockResolvedValue({ id: 99 }),
  addItem: vi.fn().mockResolvedValue({ id: 10, name: 'New Item', unit: 'pcs' }),
  addCategory: vi.fn().mockResolvedValue({ id: 5, name: 'New Category' }),
}));

// Mock useOffline
const mockAddEntryOffline = vi.fn();
vi.mock('@/components/providers/OfflineContext', () => ({
  useOffline: () => ({ addEntryOffline: mockAddEntryOffline, isOnline: true }),
}));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('LogEntrySheet', () => {
  beforeEach(() => { mockAddEntryOffline.mockReset(); });

  it('renders nothing when closed', () => {
    const { container } = wrap(
      <LogEntrySheet isOpen={false} onClose={vi.fn()} />
    );
    expect(container.querySelector('[data-sheet]')).toBeNull();
  });

  it('renders sheet content when open', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    expect(screen.getByTestId('log-entry-sheet')).toBeDefined();
  });

  it('shows Purchase type selected by default', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    const purchaseBtn = screen.getByTestId('type-purchase');
    expect(purchaseBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows price and store fields for purchase type', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    expect(screen.getByTestId('price-field')).toBeDefined();
    expect(screen.getByTestId('store-field')).toBeDefined();
  });

  it('hides price and store fields for consume type', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    act(() => fireEvent.click(screen.getByTestId('type-consume')));
    expect(screen.queryByTestId('price-field')).toBeNull();
    expect(screen.queryByTestId('store-field')).toBeNull();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={onClose} />);
    });
    act(() => fireEvent.click(screen.getByTestId('close-sheet')));
    expect(onClose).toHaveBeenCalled();
  });

  it('pre-fills type when prefillType is provided', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} prefillType="consume" />);
    });
    expect(screen.getByTestId('type-consume').getAttribute('aria-pressed')).toBe('true');
  });
});
