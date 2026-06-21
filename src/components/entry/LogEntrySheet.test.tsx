import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import LogEntrySheet from './LogEntrySheet';

afterEach(cleanup);

vi.mock('@/app/app/actions', () => ({
  getItemsForAutocomplete: vi.fn().mockResolvedValue([
    { id: 1, name: 'Downy 1L Lavender', categoryName: 'Fabric Softener', unit: 'bottle', lastQty: 2, lastPrice: 89, lastStore: 'Big C' },
    { id: 2, name: 'Chicken Breast', categoryName: 'Meat', unit: 'pack', lastQty: 3, lastPrice: 52, lastStore: 'Big C' },
  ]),
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: 'Fabric Softener', defaultUnit: 'bottle' },
  ]),
  addEntry: vi.fn().mockResolvedValue({ id: 99 }),
  addItem: vi.fn().mockResolvedValue({ id: 10, name: 'New Item', unit: 'pcs' }),
  addCategory: vi.fn().mockResolvedValue({ id: 5, name: 'New Category' }),
}));

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

  it('chip grid renders recent items', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    expect(screen.getByTestId('item-chip-1')).toBeDefined();
    expect(screen.getByTestId('item-chip-2')).toBeDefined();
  });

  it('clicking a chip pre-fills qty and unit', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    expect(screen.getByTestId('qty-value').textContent).toBe('2');
    expect(screen.getByTestId('unit-label').textContent).toBe('bottle');
  });

  it('stepper increments and decrements qty', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    act(() => fireEvent.click(screen.getByTestId('qty-increment')));
    expect(screen.getByTestId('qty-value').textContent).toBe('3');
    act(() => fireEvent.click(screen.getByTestId('qty-decrement')));
    expect(screen.getByTestId('qty-value').textContent).toBe('2');
  });

  it('unit shown as label element, not input', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    const unitLabel = screen.getByTestId('unit-label');
    expect(unitLabel.tagName).not.toBe('INPUT');
  });

  it('shows price pre-confirm when item has lastPrice', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    expect(screen.getByTestId('price-preconfirm')).toBeDefined();
    expect(screen.queryByTestId('price-input')).toBeNull();
  });

  it('[Change] reveals price input', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    act(() => fireEvent.click(screen.getByTestId('change-price-btn')));
    expect(screen.queryByTestId('price-preconfirm')).toBeNull();
    expect(screen.getByTestId('price-input')).toBeDefined();
  });

  it('shows price and store fields for purchase type', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    expect(screen.getByTestId('price-field')).toBeDefined();
    expect(screen.getByTestId('store-field')).toBeDefined();
  });

  it('hides price and store fields for consume type', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    act(() => fireEvent.click(screen.getByTestId('type-consume')));
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    expect(screen.queryByTestId('price-field')).toBeNull();
    expect(screen.queryByTestId('store-field')).toBeNull();
  });

  it('date shown as label by default', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    expect(screen.getByTestId('date-label')).toBeDefined();
    expect(screen.queryByTestId('date-input')).toBeNull();
  });

  it('[≠] reveals date picker input', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    act(() => fireEvent.click(screen.getByTestId('change-date-btn')));
    expect(screen.queryByTestId('date-label')).toBeNull();
    expect(screen.getByTestId('date-input')).toBeDefined();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={onClose} />);
    });
    act(() => fireEvent.click(screen.getByTestId('close-sheet')));
    expect(onClose).toHaveBeenCalled();
  });

  it('unit override shows a <select> element (not pill strip) when [≠ unit] is clicked', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    await act(async () => { fireEvent.click(screen.getByTestId('change-unit-btn')); });
    const unitSelect = screen.getByTestId('unit-select');
    expect(unitSelect.tagName).toBe('SELECT');
  });

  it('pre-fills type when prefillType is provided', async () => {
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={vi.fn()} prefillType="consume" />);
    });
    expect(screen.getByTestId('type-consume').getAttribute('aria-pressed')).toBe('true');
  });

  it('Save calls addEntryOffline with correct payload', async () => {
    mockAddEntryOffline.mockResolvedValue(undefined);
    const onClose = vi.fn();
    await act(async () => {
      wrap(<LogEntrySheet isOpen={true} onClose={onClose} />);
    });
    await act(async () => { fireEvent.click(screen.getByTestId('item-chip-1')); });
    await act(async () => { fireEvent.click(screen.getByTestId('save-btn')); });
    expect(mockAddEntryOffline).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: 1, type: 'purchase', quantity: 2, unit: 'bottle' })
    );
  });
});
