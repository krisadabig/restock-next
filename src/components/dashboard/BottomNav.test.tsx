import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import BottomNav from './BottomNav';

afterEach(cleanup);

vi.mock('next/navigation', () => ({
  usePathname: () => '/app',
}));

vi.mock('@/components/providers/UIContext', () => ({
  useUI: () => ({ setLogEntrySheetOpen: vi.fn() }),
}));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('BottomNav', () => {
  it('renders Stock, Price and Settings tabs', () => {
    wrap(<BottomNav />);
    expect(screen.getByText('Stock')).toBeDefined();
    expect(screen.getByText('Price')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('marks the active tab with aria-current', () => {
    wrap(<BottomNav />);
    const stockLink = screen.getByText('Stock').closest('a');
    expect(stockLink?.getAttribute('aria-current')).toBe('page');
  });

  it('renders a FAB button', () => {
    wrap(<BottomNav />);
    expect(screen.getByTestId('fab-btn')).toBeDefined();
  });
});
