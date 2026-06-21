import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SpaceProvider, useSpace } from './SpaceContext';

afterEach(cleanup);

const INITIAL_VALUE = {
  spaceId: 'sp-1',
  memberId: 7,
  displayName: 'Alice',
  avatar: null,
  members: [
    { memberId: 7, displayName: 'Alice', avatar: null },
    { memberId: 8, displayName: 'Bob', avatar: null },
  ],
  mySpaces: [
    { id: 'sp-1', name: 'Home' },
    { id: 'sp-2', name: 'Office' },
  ],
};

function ReadSpace() {
  const { spaceId, memberId, displayName, avatar, members, mySpaces } = useSpace();
  return (
    <div>
      <span data-testid="space-id">{spaceId}</span>
      <span data-testid="member-id">{memberId}</span>
      <span data-testid="display-name">{displayName}</span>
      <span data-testid="avatar">{avatar ?? 'null'}</span>
      <span data-testid="member-count">{members.length}</span>
      <span data-testid="space-count">{mySpaces.length}</span>
    </div>
  );
}

describe('SpaceContext', () => {
  it('useSpace throws when used outside SpaceProvider', () => {
    const Bad = () => { useSpace(); return null; };
    expect(() => render(<Bad />)).toThrow('useSpace must be used within SpaceProvider');
  });

  it('SpaceProvider provides the initialValue to children', () => {
    render(
      <SpaceProvider initialValue={INITIAL_VALUE}>
        <ReadSpace />
      </SpaceProvider>,
    );
    expect(screen.getByTestId('space-id').textContent).toBe('sp-1');
    expect(screen.getByTestId('member-id').textContent).toBe('7');
    expect(screen.getByTestId('display-name').textContent).toBe('Alice');
    expect(screen.getByTestId('avatar').textContent).toBe('null');
    expect(screen.getByTestId('member-count').textContent).toBe('2');
    expect(screen.getByTestId('space-count').textContent).toBe('2');
  });
});
