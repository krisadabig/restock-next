import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import SpaceSwitcher from './SpaceSwitcher';

afterEach(cleanup);

const mockSwitchSpace = vi.fn();

vi.mock('@/app/app/actions', () => ({
  switchSpace: (...args: unknown[]) => mockSwitchSpace(...args),
}));

// BottomSheetContainer uses createPortal — mock it to render inline
vi.mock('@/components/ui/BottomSheetContainer', () => ({
  default: ({ isOpen, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) =>
    isOpen ? <div data-testid="space-switcher-sheet">{children}</div> : null,
}));

const mySpaces = [
  { id: 'sp1', name: 'Home' },
  { id: 'sp2', name: 'Office' },
];

function wrap(ui: React.ReactNode) {
  return render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);
}

describe('SpaceSwitcher', () => {
  it('calls switchSpace then navigates to /app when tapping second space', async () => {
    // jsdom allows assigning window.location.href — capture it
    let assignedHref = '';
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, set href(v: string) { assignedHref = v; } });

    wrap(<SpaceSwitcher activeSpaceId="sp1" mySpaces={mySpaces} />);

    fireEvent.click(screen.getByTestId('space-switcher-trigger'));
    fireEvent.click(screen.getByTestId('space-option-sp2'));

    await vi.waitFor(() => expect(mockSwitchSpace).toHaveBeenCalledWith('sp2'));
    await vi.waitFor(() => expect(assignedHref).toBe('/app'));

    vi.restoreAllMocks();
  });

  it('marks the active space with aria-current', () => {
    wrap(<SpaceSwitcher activeSpaceId="sp1" mySpaces={mySpaces} />);

    fireEvent.click(screen.getByTestId('space-switcher-trigger'));

    const activeOption = screen.getByTestId('space-option-sp1');
    expect(activeOption.getAttribute('aria-current')).toBe('true');
  });
});
