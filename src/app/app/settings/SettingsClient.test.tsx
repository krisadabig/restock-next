import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import SettingsClient from './SettingsClient';

afterEach(cleanup);

const mockCreateInvite = vi.hoisted(() => vi.fn());
const mockUpdateMemberProfile = vi.hoisted(() => vi.fn());
const mockLeaveSpace = vi.hoisted(() => vi.fn());
const mockSwitchSpace = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));
vi.mock('@/app/auth/actions', () => ({ logout: vi.fn() }));
vi.mock('@/lib/auth', () => ({ registerPasskey: vi.fn() }));
vi.mock('@/app/app/actions', () => ({
  createInvite: mockCreateInvite,
  updateMemberProfile: mockUpdateMemberProfile,
  leaveSpace: mockLeaveSpace,
  switchSpace: mockSwitchSpace,
}));
vi.mock('@/components/providers/SpaceContext', () => ({
  useSpace: () => ({
    spaceId: 'sp1',
    memberId: 1,
    displayName: 'Alex',
    avatar: null,
    members: [
      { memberId: 1, displayName: 'Alex', avatar: null },
      { memberId: 2, displayName: 'Sam', avatar: null },
    ],
    mySpaces: [
      { id: 'sp1', name: 'My Home' },
      { id: 'sp2', name: 'Office' },
    ],
  }),
}));

const categories = [
  { id: 1, spaceId: 'sp1', name: 'Fabric Softener', defaultUnit: 'bottle', createdAt: new Date() },
  { id: 2, spaceId: 'sp1', name: 'Meat', defaultUnit: 'pack', createdAt: new Date() },
];
const stores = ['Big C', 'CJ'];

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('SettingsClient — members section', () => {
  it('shows each member displayName', () => {
    wrap(<SettingsClient categories={categories} stores={stores} />);
    expect(screen.getByTestId('member-1').textContent).toContain('Alex');
    expect(screen.getByTestId('member-2').textContent).toContain('Sam');
  });

  it('marks the current user with "(you)"', () => {
    wrap(<SettingsClient categories={categories} stores={stores} />);
    expect(screen.getByTestId('member-1').textContent).toContain('you');
  });
});

describe('SettingsClient — categories section', () => {
  it('renders each category name', () => {
    wrap(<SettingsClient categories={categories} stores={stores} />);
    expect(screen.getByTestId('category-row-1').textContent).toContain('Fabric Softener');
    expect(screen.getByTestId('category-row-2').textContent).toContain('Meat');
  });

  it('shows empty state when no categories', () => {
    wrap(<SettingsClient categories={[]} stores={stores} />);
    expect(screen.getByTestId('no-categories')).toBeDefined();
  });
});

describe('SettingsClient — stores section', () => {
  it('renders each store name', () => {
    wrap(<SettingsClient categories={categories} stores={stores} />);
    expect(screen.getByText('Big C')).toBeDefined();
    expect(screen.getByText('CJ')).toBeDefined();
  });

  it('shows empty state when no stores', () => {
    wrap(<SettingsClient categories={categories} stores={[]} />);
    expect(screen.getByTestId('no-stores-settings')).toBeDefined();
  });
});

describe('SettingsClient — invite flow', () => {
  beforeEach(() => { mockCreateInvite.mockReset(); });

  it('"Invite member" tap calls createInvite and shows the code', async () => {
    mockCreateInvite.mockResolvedValue({ code: 'ABC12345' });
    wrap(<SettingsClient categories={categories} stores={stores} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('invite-member-btn'));
    });
    expect(mockCreateInvite).toHaveBeenCalledOnce();
    expect(screen.getByTestId('invite-code').textContent).toContain('ABC12345');
  });
});

describe('SettingsClient — profile edit', () => {
  beforeEach(() => { mockUpdateMemberProfile.mockReset(); });

  it('profile save calls updateMemberProfile with new displayName', async () => {
    mockUpdateMemberProfile.mockResolvedValue({});
    wrap(<SettingsClient categories={categories} stores={stores} />);
    fireEvent.change(screen.getByTestId('profile-display-name-input'), { target: { value: 'Alex New' } });
    await act(async () => {
      fireEvent.click(screen.getByTestId('profile-save-btn'));
    });
    expect(mockUpdateMemberProfile).toHaveBeenCalledWith({ displayName: 'Alex New' });
  });
});

describe('SettingsClient — switch space', () => {
  beforeEach(() => { mockSwitchSpace.mockReset(); });

  it('clicking a non-active space calls switchSpace with its id', async () => {
    mockSwitchSpace.mockResolvedValue(undefined);
    wrap(<SettingsClient categories={categories} stores={stores} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('switch-space-sp2'));
    });
    expect(mockSwitchSpace).toHaveBeenCalledWith('sp2');
  });
});

describe('SettingsClient — leave space', () => {
  beforeEach(() => { mockLeaveSpace.mockReset(); });

  it('leave space button opens confirm dialog then calls leaveSpace', async () => {
    mockLeaveSpace.mockResolvedValue(undefined);
    wrap(<SettingsClient categories={categories} stores={stores} />);
    fireEvent.click(screen.getByTestId('leave-space-btn'));
    expect(screen.getByTestId('leave-space-confirm-btn')).toBeDefined();
    await act(async () => {
      fireEvent.click(screen.getByTestId('leave-space-confirm-btn'));
    });
    expect(mockLeaveSpace).toHaveBeenCalledWith('sp1');
  });
});
