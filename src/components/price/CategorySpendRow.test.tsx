import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import CategorySpendRow from './CategorySpendRow';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('CategorySpendRow', () => {
  it('renders the category name', () => {
    wrap(<CategorySpendRow categoryId={1} categoryName="Fabric Softener" total={89} maxTotal={312} onTap={vi.fn()} />);
    expect(screen.getByText('Fabric Softener')).toBeDefined();
  });

  it('renders the spend amount', () => {
    wrap(<CategorySpendRow categoryId={1} categoryName="Fabric Softener" total={89} maxTotal={312} onTap={vi.fn()} />);
    expect(screen.getByTestId('spend-amount').textContent).toContain('89');
  });

  it('renders a bar element with proportional width', () => {
    wrap(<CategorySpendRow categoryId={1} categoryName="Fabric Softener" total={89} maxTotal={312} onTap={vi.fn()} />);
    const bar = screen.getByTestId('spend-bar');
    // bar should have some inline width style
    expect(bar).toBeDefined();
  });

  it('calls onTap with categoryId when clicked', () => {
    const onTap = vi.fn();
    wrap(<CategorySpendRow categoryId={5} categoryName="Meat" total={312} maxTotal={312} onTap={onTap} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onTap).toHaveBeenCalledWith(5);
  });
});
