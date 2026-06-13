import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import SettingsClient from './SettingsClient';

afterEach(cleanup);

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: mockRefresh }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('@/app/auth/actions', () => ({ logout: vi.fn() }));
vi.mock('@/lib/auth', () => ({ registerPasskey: vi.fn() }));

vi.mock('@/app/app/actions', () => ({
  addGroup: vi.fn().mockResolvedValue({ id: 99, name: 'New' }),
  renameGroup: vi.fn().mockResolvedValue({ id: 10, name: 'Updated' }),
  deleteGroup: vi.fn().mockResolvedValue(undefined),
  assignItemToGroup: vi.fn().mockResolvedValue(undefined),
  removeItemFromGroup: vi.fn().mockResolvedValue(undefined),
}));

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

const baseProps = {
  currentUserId: 'u1',
  members,
  categories,
  stores,
  groups: [],
  allItems: [],
};

describe('SettingsClient — household section', () => {
  it('shows each member name', () => {
    wrap(<SettingsClient {...baseProps} />);
    expect(screen.getByTestId('member-u1').textContent).toContain('Alex');
    expect(screen.getByTestId('member-u2').textContent).toContain('Sam');
  });

  it('marks the current user with "(you)"', () => {
    wrap(<SettingsClient {...baseProps} />);
    expect(screen.getByTestId('member-u1').textContent).toContain('you');
  });
});

describe('SettingsClient — categories section', () => {
  it('renders each category name', () => {
    wrap(<SettingsClient {...baseProps} />);
    expect(screen.getByTestId('category-row-1').textContent).toContain('Fabric Softener');
    expect(screen.getByTestId('category-row-2').textContent).toContain('Meat');
  });

  it('shows empty state when no categories', () => {
    wrap(<SettingsClient {...baseProps} categories={[]} />);
    expect(screen.getByTestId('no-categories')).toBeDefined();
  });
});

describe('SettingsClient — stores section', () => {
  it('renders each store name', () => {
    wrap(<SettingsClient {...baseProps} />);
    expect(screen.getByText('Big C')).toBeDefined();
    expect(screen.getByText('CJ')).toBeDefined();
  });

  it('shows empty state when no stores', () => {
    wrap(<SettingsClient {...baseProps} stores={[]} />);
    expect(screen.getByTestId('no-stores-settings')).toBeDefined();
  });
});

// ── Groups section ─────────────────────────────────────────────────────────

import { addGroup, renameGroup, deleteGroup } from '@/app/app/actions';
import type { Mock } from 'vitest';

const groupsData = [
  { id: 10, name: 'Fridge', items: [{ id: 1, name: 'Milk' }] },
  { id: 11, name: 'Pantry', items: [] },
];

const allItems = [
  { id: 1, name: 'Milk' },
  { id: 2, name: 'Bread' },
];

describe('SettingsClient — groups section', () => {
  it('shows empty state when no groups', () => {
    wrap(<SettingsClient {...baseProps} groups={[]} allItems={allItems} />);
    expect(screen.getByTestId('no-groups')).toBeDefined();
  });

  it('renders each group row by name', () => {
    wrap(<SettingsClient {...baseProps} groups={groupsData} allItems={allItems} />);
    expect(screen.getByTestId('group-row-10').textContent).toContain('Fridge');
    expect(screen.getByTestId('group-row-11').textContent).toContain('Pantry');
  });

  it('shows assigned item names inside each group row', () => {
    wrap(<SettingsClient {...baseProps} groups={groupsData} allItems={allItems} />);
    expect(screen.getByTestId('group-items-10').textContent).toContain('Milk');
  });

  it('shows add-group form when "Add group" button is clicked', () => {
    wrap(<SettingsClient {...baseProps} groups={groupsData} allItems={allItems} />);
    act(() => fireEvent.click(screen.getByTestId('add-group-btn')));
    expect(screen.getByTestId('add-group-form')).toBeDefined();
  });

  it('calls addGroup with the entered name on form submit', async () => {
    wrap(<SettingsClient {...baseProps} groups={groupsData} allItems={allItems} />);
    act(() => fireEvent.click(screen.getByTestId('add-group-btn')));
    act(() => fireEvent.change(screen.getByTestId('add-group-input'), { target: { value: 'Freezer' } }));
    await act(async () => fireEvent.submit(screen.getByTestId('add-group-form')));
    expect(addGroup as Mock).toHaveBeenCalledWith({ name: 'Freezer' });
  });

  it('shows rename input when rename button is clicked', () => {
    wrap(<SettingsClient {...baseProps} groups={groupsData} allItems={allItems} />);
    act(() => fireEvent.click(screen.getByTestId('rename-group-10')));
    expect(screen.getByTestId('rename-group-input-10')).toBeDefined();
  });

  it('calls renameGroup with new name on rename submit', async () => {
    wrap(<SettingsClient {...baseProps} groups={groupsData} allItems={allItems} />);
    act(() => fireEvent.click(screen.getByTestId('rename-group-10')));
    act(() => fireEvent.change(screen.getByTestId('rename-group-input-10'), { target: { value: 'Freezer' } }));
    await act(async () => fireEvent.submit(screen.getByTestId('rename-group-form-10')));
    expect(renameGroup as Mock).toHaveBeenCalledWith(10, { name: 'Freezer' });
  });

  it('calls deleteGroup when delete is confirmed', async () => {
    wrap(<SettingsClient {...baseProps} groups={groupsData} allItems={allItems} />);
    act(() => fireEvent.click(screen.getByTestId('delete-group-10')));
    await act(async () => fireEvent.click(screen.getByTestId('confirm-delete-group-10')));
    expect(deleteGroup as Mock).toHaveBeenCalledWith(10);
  });
});
