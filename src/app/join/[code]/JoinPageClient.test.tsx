import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import JoinPageClient from './JoinPageClient';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockJoinByInviteCode = vi.hoisted(() => vi.fn());
const mockRouterPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock('@/app/app/actions', () => ({
  joinByInviteCode: mockJoinByInviteCode,
}));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('JoinPageClient', () => {
  it('renders invite card with Accept button', () => {
    wrap(<JoinPageClient code="abc123" />);
    expect(screen.getByText(/You've been invited to join a space/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /accept/i })).toBeTruthy();
  });

  it('calls joinByInviteCode with code and redirects to /app on success', async () => {
    mockJoinByInviteCode.mockResolvedValueOnce({ spaceId: 'sp1' });
    wrap(<JoinPageClient code="abc123" />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    await waitFor(() => expect(mockJoinByInviteCode).toHaveBeenCalledWith('abc123'));
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/app'));
  });

  it('shows join.expired message when action throws "Code expired"', async () => {
    mockJoinByInviteCode.mockRejectedValueOnce(new Error('Code expired'));
    wrap(<JoinPageClient code="expired-code" />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    await waitFor(() =>
      expect(screen.getByTestId('join-error')).toBeTruthy()
    );
    expect(screen.getByTestId('join-error').textContent).toContain('expired');
  });

  it('shows join.invalid message when action throws "Invalid code"', async () => {
    mockJoinByInviteCode.mockRejectedValueOnce(new Error('Invalid code'));
    wrap(<JoinPageClient code="bad-code" />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    await waitFor(() =>
      expect(screen.getByTestId('join-error')).toBeTruthy()
    );
    expect(screen.getByTestId('join-error').textContent).toContain('invalid');
  });

  it('shows join.invalid message when action throws "Already used"', async () => {
    mockJoinByInviteCode.mockRejectedValueOnce(new Error('Already used'));
    wrap(<JoinPageClient code="used-code" />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    await waitFor(() =>
      expect(screen.getByTestId('join-error')).toBeTruthy()
    );
    expect(screen.getByTestId('join-error').textContent).toContain('invalid');
  });

  it('shows join.alreadyMember message when action throws "Already a member"', async () => {
    mockJoinByInviteCode.mockRejectedValueOnce(new Error('Already a member'));
    wrap(<JoinPageClient code="already-code" />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    await waitFor(() =>
      expect(screen.getByTestId('join-error')).toBeTruthy()
    );
    expect(screen.getByTestId('join-error').textContent).toContain('already');
  });

  it('does not redirect on error', async () => {
    mockJoinByInviteCode.mockRejectedValueOnce(new Error('Invalid code'));
    wrap(<JoinPageClient code="bad-code" />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    await waitFor(() => expect(screen.getByTestId('join-error')).toBeTruthy());
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
