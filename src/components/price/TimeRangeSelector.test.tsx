import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector';
import { I18nProvider } from '@/lib/i18n';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) => render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('TimeRangeSelector', () => {
  it('renders all four range options', () => {
    wrap(<TimeRangeSelector value="month" onChange={vi.fn()} />);
    expect(screen.getByText('This Month')).toBeDefined();
    expect(screen.getByText('3 Months')).toBeDefined();
    expect(screen.getByText('This Year')).toBeDefined();
    expect(screen.getByText('All Time')).toBeDefined();
  });

  it('marks the active option with aria-pressed true', () => {
    wrap(<TimeRangeSelector value="month" onChange={vi.fn()} />);
    const activeBtn = screen.getByText('This Month').closest('button');
    expect(activeBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onChange with "3months" when 3 Months chip is clicked', () => {
    const onChange = vi.fn();
    wrap(<TimeRangeSelector value="month" onChange={onChange} />);
    fireEvent.click(screen.getByText('3 Months'));
    expect(onChange).toHaveBeenCalledWith('3months' as TimeRange);
  });

  it('calls onChange with correct value for each chip', () => {
    const onChange = vi.fn();
    wrap(<TimeRangeSelector value="month" onChange={onChange} />);
    fireEvent.click(screen.getByText('This Year'));
    expect(onChange).toHaveBeenCalledWith('year' as TimeRange);
    fireEvent.click(screen.getByText('All Time'));
    expect(onChange).toHaveBeenCalledWith('all' as TimeRange);
  });
});
