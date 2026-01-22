import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LanguageToggle from '@/components/LanguageToggle';
import { I18nProvider } from '@/lib/i18n';
import { afterEach } from 'vitest';

describe('LanguageToggle', () => {
    afterEach(() => {
        cleanup();
    });
    it('should render successfully', () => {
        render(
            <I18nProvider>
                <LanguageToggle />
            </I18nProvider>
        );
        expect(screen.getByRole('button')).toBeDefined();
    });

    it('should toggle language on click', async () => {
        render(
            <I18nProvider>
                <LanguageToggle />
            </I18nProvider>
        );

        const button = screen.getByRole('button');
        
        // Initial state logic depends on default "th"
        // Let's assume the button shows the CURRENT language "TH"
        expect(screen.getByText('TH')).toBeDefined();

        fireEvent.click(button);

        // Should switch to EN
        expect(await screen.findByText('EN')).toBeDefined();
    });
});
