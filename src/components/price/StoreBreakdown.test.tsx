import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import StoreBreakdown from './StoreBreakdown';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const stores = [
  { store: 'Big C', total: 890, count: 3 },
  { store: 'CJ', total: 350, count: 2 },
];

describe('StoreBreakdown', () => {
  it('renders store names', () => {
    wrap(<StoreBreakdown stores={stores} />);
    expect(screen.getByText('Big C')).toBeDefined();
    expect(screen.getByText('CJ')).toBeDefined();
  });

  it('renders spend totals', () => {
    wrap(<StoreBreakdown stores={stores} />);
    expect(screen.getByTestId('store-total-Big C').textContent).toContain('890');
    expect(screen.getByTestId('store-total-CJ').textContent).toContain('350');
  });

  it('renders visit counts', () => {
    wrap(<StoreBreakdown stores={stores} />);
    expect(screen.getByTestId('store-count-Big C').textContent).toContain('3');
    expect(screen.getByTestId('store-count-CJ').textContent).toContain('2');
  });

  it('shows empty state when no stores', () => {
    wrap(<StoreBreakdown stores={[]} />);
    expect(screen.getByTestId('no-stores')).toBeDefined();
  });
});
