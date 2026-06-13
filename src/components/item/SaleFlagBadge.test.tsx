import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import SaleFlagBadge from './SaleFlagBadge';

afterEach(cleanup);

describe('SaleFlagBadge', () => {
  it('renders nothing when price is equal to average', () => {
    const { container } = render(<SaleFlagBadge price={100} avgPrice={100} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when price is less than 15% below average', () => {
    // 100 * 0.85 = 85, so 86 is NOT a sale (only 14% below)
    const { container } = render(<SaleFlagBadge price={86} avgPrice={100} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders badge when price is exactly 15% below average', () => {
    // 100 * 0.85 = 85, exactly 15% below
    render(<SaleFlagBadge price={85} avgPrice={100} />);
    expect(screen.getByTestId('sale-flag')).toBeDefined();
  });

  it('renders badge when price is more than 15% below average', () => {
    render(<SaleFlagBadge price={79} avgPrice={100} />);
    expect(screen.getByTestId('sale-flag')).toBeDefined();
  });
});
