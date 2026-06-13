import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import SpendBarChart from './SpendBarChart';

afterEach(cleanup);

describe('SpendBarChart', () => {
  it('renders nothing for empty data', () => {
    const { container } = render(<SpendBarChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders one bar column per data point', () => {
    const data = [
      { month: '2026-01', total: 500 },
      { month: '2026-02', total: 300 },
      { month: '2026-03', total: 700 },
    ];
    const { container } = render(<SpendBarChart data={data} />);
    expect(container.querySelectorAll('[data-bar]').length).toBe(3);
  });

  it('gives the highest-value bar 100% height', () => {
    const data = [
      { month: '2026-01', total: 500 },
      { month: '2026-02', total: 1000 },
    ];
    const { container } = render(<SpendBarChart data={data} />);
    const bars = container.querySelectorAll('[data-bar]');
    // The bar with total=1000 should have height 100%
    const heights = Array.from(bars).map((b) => (b as HTMLElement).style.height);
    expect(heights).toContain('100%');
  });

  it('shows the month label for each bar', () => {
    const data = [{ month: '2026-01', total: 200 }];
    const { container } = render(<SpendBarChart data={data} />);
    expect(container.textContent).toContain('Jan');
  });
});
