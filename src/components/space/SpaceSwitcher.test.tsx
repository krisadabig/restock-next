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
  it('calls switchSpace with second space id when tapping second space', () => {
    wrap(<SpaceSwitcher activeSpaceId="sp1" mySpaces={mySpaces} />);

    // Open the sheet
    fireEvent.click(screen.getByTestId('space-switcher-trigger'));

    // Tap the second space
    fireEvent.click(screen.getByTestId('space-option-sp2'));

    expect(mockSwitchSpace).toHaveBeenCalledWith('sp2');
  });

  it('marks the active space with aria-current', () => {
    wrap(<SpaceSwitcher activeSpaceId="sp1" mySpaces={mySpaces} />);

    fireEvent.click(screen.getByTestId('space-switcher-trigger'));

    const activeOption = screen.getByTestId('space-option-sp1');
    expect(activeOption.getAttribute('aria-current')).toBe('true');
  });
});
