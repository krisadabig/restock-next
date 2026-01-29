import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from 'next-themes';
import { afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeToggle', () => {
    beforeEach(() => {
        // Clear all mocks and local storage before each test
        vi.clearAllMocks();
        localStorageMock.clear();
        document.documentElement.classList.remove('dark');
    });

    afterEach(() => {
        cleanup();
    });

    it('should render successfully', async () => {
        render(
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ThemeToggle />
            </ThemeProvider>
        );
        expect(await screen.findByRole('button')).toBeDefined();
    });

    it('should toggle theme classes on html element', async () => {
        render(
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                <ThemeToggle />
            </ThemeProvider>
        );
        const button = await screen.findByRole('button');

        // Initial state is light (default) so no dark class
        expect(document.documentElement.classList.contains('dark')).toBe(false);

        // Click to toggle to dark
        // Wait for component to mount/interactivity
        await vi.waitUntil(() => !button.classList.contains('opacity-0'));
        fireEvent.click(button);
        
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');

        // Click to toggle back to light
        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });
});
