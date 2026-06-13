import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import QuickLogStrip from './QuickLogStrip';

afterEach(cleanup);

const items = [
  { id: 1, name: 'Downy 1L' },
  { id: 2, name: 'Chicken' },
  { id: 3, name: 'Rice' },
  { id: 4, name: 'Oil' },
  { id: 5, name: 'Sugar' }, // beyond the 4-item cap
];

describe('QuickLogStrip', () => {
  it('returns null when items list is empty', () => {
    const { container } = render(<QuickLogStrip items={[]} onSelect={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a chip for each item (up to 4)', () => {
    render(<QuickLogStrip items={items} onSelect={vi.fn()} />);
    expect(screen.getAllByTestId('quick-log-chip')).toHaveLength(4);
  });

  it('shows item names on chips', () => {
    render(<QuickLogStrip items={items} onSelect={vi.fn()} />);
    const chips = screen.getAllByTestId('quick-log-chip');
    expect(chips[0].textContent).toContain('Downy 1L');
    expect(chips[3].textContent).toContain('Oil');
  });

  it('calls onSelect with item id when chip is clicked', () => {
    const onSelect = vi.fn();
    render(<QuickLogStrip items={items} onSelect={onSelect} />);
    fireEvent.click(screen.getAllByTestId('quick-log-chip')[2]);
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});
