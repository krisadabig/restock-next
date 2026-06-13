import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import SettingsClient from './SettingsClient';

afterEach(cleanup);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('@/app/auth/actions', () => ({ logout: vi.fn() }));
vi.mock('@/lib/auth', () => ({ registerPasskey: vi.fn() }));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const members = [
  { userId: 'u1', username: 'Alex' },
  { userId: 'u2', username: 'Sam' },
];

const categories = [
  { id: 1, householdId: 'hh1', name: 'Fabric Softener', defaultUnit: 'bottle', createdAt: new Date() },
  { id: 2, householdId: 'hh1', name: 'Meat', defaultUnit: 'pack', createdAt: new Date() },
];

const stores = ['Big C', 'CJ'];

describe('SettingsClient — household section', () => {
  it('shows each member name', () => {
    wrap(<SettingsClient currentUserId="u1" members={members} categories={categories} stores={stores} />);
    expect(screen.getByTestId('member-u1').textContent).toContain('Alex');
    expect(screen.getByTestId('member-u2').textContent).toContain('Sam');
  });

  it('marks the current user with "(you)"', () => {
    wrap(<SettingsClient currentUserId="u1" members={members} categories={categories} stores={stores} />);
    expect(screen.getByTestId('member-u1').textContent).toContain('you');
  });
});

describe('SettingsClient — categories section', () => {
  it('renders each category name', () => {
    wrap(<SettingsClient currentUserId="u1" members={members} categories={categories} stores={stores} />);
    expect(screen.getByTestId('category-row-1').textContent).toContain('Fabric Softener');
    expect(screen.getByTestId('category-row-2').textContent).toContain('Meat');
  });

  it('shows empty state when no categories', () => {
    wrap(<SettingsClient currentUserId="u1" members={members} categories={[]} stores={stores} />);
    expect(screen.getByTestId('no-categories')).toBeDefined();
  });
});

describe('SettingsClient — stores section', () => {
  it('renders each store name', () => {
    wrap(<SettingsClient currentUserId="u1" members={members} categories={categories} stores={stores} />);
    expect(screen.getByText('Big C')).toBeDefined();
    expect(screen.getByText('CJ')).toBeDefined();
  });

  it('shows empty state when no stores', () => {
    wrap(<SettingsClient currentUserId="u1" members={members} categories={categories} stores={[]} />);
    expect(screen.getByTestId('no-stores-settings')).toBeDefined();
  });
});
