import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import QuickLogSheet from './QuickLogSheet';

afterEach(cleanup);

const mockAddEntryOffline = vi.hoisted(() => vi.fn());

vi.mock('@/components/providers/OfflineContext', () => ({
  useOffline: () => ({ addEntryOffline: mockAddEntryOffline }),
}));

const prefill = {
  itemName: 'Downy 1L Lavender',
  categoryName: 'Fabric Softener',
  unit: 'bottle',
  lastQty: 2,
  lastPrice: 89,
  lastStore: 'Big C',
};

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('QuickLogSheet', () => {
  beforeEach(() => { mockAddEntryOffline.mockReset(); });

  it('calls addEntryOffline with item id and prefilled data on Save', async () => {
    wrap(
      <QuickLogSheet
        isOpen={true}
        onClose={vi.fn()}
        itemId={1}
        prefill={prefill}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('quick-log-save'));
    });

    expect(mockAddEntryOffline).toHaveBeenCalledOnce();
    expect(mockAddEntryOffline).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 1,
        type: 'purchase',
        quantity: 2,
        unit: 'bottle',
        store: 'Big C',
      })
    );
  });

  it('hides price and store fields in consume mode', async () => {
    wrap(
      <QuickLogSheet
        isOpen={true}
        onClose={vi.fn()}
        itemId={1}
        prefill={prefill}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('type-consume'));
    });

    expect(screen.queryByTestId('price-section')).toBeNull();
    expect(screen.queryByTestId('store-section')).toBeNull();
  });

  it('reveals numeric price input when [Change] is clicked', async () => {
    wrap(
      <QuickLogSheet
        isOpen={true}
        onClose={vi.fn()}
        itemId={1}
        prefill={prefill}
      />
    );

    // Before click: price-input should not be visible, pre-confirm shown
    expect(screen.queryByTestId('price-input')).toBeNull();
    expect(screen.getByTestId('price-preconfirm')).toBeDefined();

    await act(async () => {
      fireEvent.click(screen.getByTestId('change-price-btn'));
    });

    expect(screen.getByTestId('price-input')).toBeDefined();
    expect(screen.queryByTestId('price-preconfirm')).toBeNull();
  });

  it('does not render an editable unit input', () => {
    wrap(
      <QuickLogSheet
        isOpen={true}
        onClose={vi.fn()}
        itemId={1}
        prefill={prefill}
      />
    );

    expect(screen.queryByTestId('unit-input')).toBeNull();
    expect(screen.getByTestId('unit-label')).toBeDefined();
  });
});
