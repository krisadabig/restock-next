import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SmartAutocomplete, { ItemSuggestion } from './Autocomplete';
import { I18nProvider } from '@/lib/i18n';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) => render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const suggestions: ItemSuggestion[] = [
  { id: 1, name: 'Downy 1L Lavender', categoryName: 'Fabric Softener' },
  { id: 2, name: 'Chicken Breast 500g', categoryName: 'Meat' },
  { id: 3, name: 'Jasmine Rice 5kg', categoryName: 'Rice' },
];

describe('SmartAutocomplete', () => {
  it('shows suggestion names in dropdown on focus', () => {
    wrap(<SmartAutocomplete name="item" suggestions={suggestions} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByText('Downy 1L Lavender')).toBeDefined();
    expect(screen.getByText('Chicken Breast 500g')).toBeDefined();
  });

  it('shows category name as subtitle in dropdown', () => {
    wrap(<SmartAutocomplete name="item" suggestions={suggestions} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByText('Fabric Softener')).toBeDefined();
    expect(screen.getByText('Meat')).toBeDefined();
  });

  it('filters suggestions by typed name', () => {
    wrap(<SmartAutocomplete name="item" suggestions={suggestions} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'chicken' } });
    expect(screen.getByText('Chicken Breast 500g')).toBeDefined();
    expect(screen.queryByText('Downy 1L Lavender')).toBeNull();
  });

  it('calls onSelect with full item when option is clicked', () => {
    const onSelect = vi.fn();
    wrap(<SmartAutocomplete name="item" suggestions={suggestions} onSelect={onSelect} />);
    fireEvent.focus(screen.getByRole('textbox'));
    fireEvent.click(screen.getByText('Downy 1L Lavender'));
    expect(onSelect).toHaveBeenCalledWith(suggestions[0]);
  });

  it('fills input with selected item name', () => {
    wrap(<SmartAutocomplete name="item" suggestions={suggestions} />);
    fireEvent.focus(screen.getByRole('textbox'));
    fireEvent.click(screen.getByText('Downy 1L Lavender'));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Downy 1L Lavender');
  });
});
