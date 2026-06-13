import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { HouseholdProvider, useHousehold } from './HouseholdContext';

afterEach(cleanup);

const testMembers = [
  { userId: 'u1', username: 'alex' },
  { userId: 'u2', username: 'sam' },
];

function ReadHousehold() {
  const { householdId, members } = useHousehold();
  return (
    <div>
      <span data-testid="household-id">{householdId}</span>
      <span data-testid="member-count">{members.length}</span>
      <span data-testid="first-member">{members[0]?.username}</span>
    </div>
  );
}

describe('HouseholdContext', () => {
  it('provides householdId and members to children', () => {
    render(
      <HouseholdProvider householdId="hh-123" members={testMembers}>
        <ReadHousehold />
      </HouseholdProvider>,
    );
    expect(screen.getByTestId('household-id').textContent).toBe('hh-123');
    expect(screen.getByTestId('member-count').textContent).toBe('2');
    expect(screen.getByTestId('first-member').textContent).toBe('alex');
  });

  it('works with empty members list', () => {
    render(
      <HouseholdProvider householdId="hh-456" members={[]}>
        <ReadHousehold />
      </HouseholdProvider>,
    );
    expect(screen.getByTestId('member-count').textContent).toBe('0');
  });

  it('useHousehold throws outside provider', () => {
    const Bad = () => { useHousehold(); return null; };
    expect(() => render(<Bad />)).toThrow('useHousehold must be used within HouseholdProvider');
  });
});
