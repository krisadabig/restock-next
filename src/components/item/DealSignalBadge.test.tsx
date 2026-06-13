import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import DealSignalBadge from './DealSignalBadge';
import { I18nProvider } from '@/lib/i18n';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) => render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('DealSignalBadge', () => {
  it('renders nothing when lastPrice equals avgPrice', () => {
    const { container } = wrap(<DealSignalBadge lastPrice={100} avgPrice={100} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when lastPrice is above avgPrice', () => {
    const { container } = wrap(<DealSignalBadge lastPrice={110} avgPrice={100} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders badge when lastPrice is below avgPrice', () => {
    wrap(<DealSignalBadge lastPrice={85} avgPrice={100} />);
    expect(screen.getByTestId('deal-signal')).toBeDefined();
  });

  it('displays correct percentage below average', () => {
    wrap(<DealSignalBadge lastPrice={80} avgPrice={100} />);
    expect(screen.getByText(/20%/)).toBeDefined();
  });

  it('rounds percentage to nearest integer', () => {
    wrap(<DealSignalBadge lastPrice={89} avgPrice={105} />);
    // (105-89)/105 = 15.24% → 15%
    expect(screen.getByText(/15%/)).toBeDefined();
  });
});
