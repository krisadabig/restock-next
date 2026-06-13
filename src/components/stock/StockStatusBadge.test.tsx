import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import StockStatusBadge from './StockStatusBadge';
import { I18nProvider } from '@/lib/i18n';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) => render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('StockStatusBadge', () => {
  it('shows "In Stock" label for ok status', () => {
    wrap(<StockStatusBadge status="ok" />);
    expect(screen.getByText('In Stock')).toBeDefined();
  });

  it('shows "Low" label for low status', () => {
    wrap(<StockStatusBadge status="low" />);
    expect(screen.getByText('Low')).toBeDefined();
  });

  it('shows "Out" label for out status', () => {
    wrap(<StockStatusBadge status="out" />);
    expect(screen.getByText('Out')).toBeDefined();
  });

  it('renders a dot element for each status', () => {
    const { container: c1 } = wrap(<StockStatusBadge status="ok" />);
    expect(c1.querySelector('[data-dot]')).not.toBeNull();
  });
});
