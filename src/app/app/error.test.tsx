import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { I18nProvider } from '@/lib/i18n';
import ErrorBoundary from './error';

afterEach(cleanup);

function wrap(ui: React.ReactElement) {
  return render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);
}

describe('ErrorBoundary', () => {
  it('renders Try again button', () => {
    wrap(<ErrorBoundary error={new Error('boom')} reset={vi.fn()} />);
    screen.getByRole('button', { name: /try again/i });
  });

  it('calls reset when Try again is clicked', async () => {
    const reset = vi.fn();
    wrap(<ErrorBoundary error={new Error('boom')} reset={reset} />);
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
