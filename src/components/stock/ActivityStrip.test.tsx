import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ActivityStrip from './ActivityStrip';

afterEach(cleanup);

const items = [
  { id: 1, name: 'Downy 1L' },
  { id: 2, name: 'Chicken' },
  { id: 3, name: 'Oil' },
];

const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h ago

describe('ActivityStrip', () => {
  it('returns null when items list is empty', () => {
    const { container } = render(
      <ActivityStrip partnerName="Sam" items={[]} lastActivityAt={recentDate} onChipTap={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows partner name', () => {
    render(
      <ActivityStrip partnerName="Sam" items={items} lastActivityAt={recentDate} onChipTap={vi.fn()} />,
    );
    expect(screen.getByTestId('activity-strip').textContent).toContain('Sam');
  });

  it('shows item count in header text', () => {
    render(
      <ActivityStrip partnerName="Sam" items={items} lastActivityAt={recentDate} onChipTap={vi.fn()} />,
    );
    expect(screen.getByTestId('activity-header').textContent).toContain('3');
  });

  it('renders a chip for each item', () => {
    render(
      <ActivityStrip partnerName="Sam" items={items} lastActivityAt={recentDate} onChipTap={vi.fn()} />,
    );
    const chips = screen.getAllByTestId('activity-chip');
    expect(chips).toHaveLength(3);
    expect(chips[0].textContent).toContain('Downy 1L');
  });

  it('calls onChipTap with the item id when a chip is clicked', () => {
    const onChipTap = vi.fn();
    render(
      <ActivityStrip partnerName="Sam" items={items} lastActivityAt={recentDate} onChipTap={onChipTap} />,
    );
    fireEvent.click(screen.getAllByTestId('activity-chip')[1]);
    expect(onChipTap).toHaveBeenCalledWith(2);
  });

  it('shows relative time in header', () => {
    render(
      <ActivityStrip partnerName="Sam" items={items} lastActivityAt={recentDate} onChipTap={vi.fn()} />,
    );
    expect(screen.getByTestId('activity-header').textContent).toMatch(/2h ago/);
  });
});
