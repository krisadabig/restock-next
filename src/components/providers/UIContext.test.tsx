import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { UIProvider, useUI } from './UIContext';

afterEach(cleanup);

function ReadState() {
  const ui = useUI();
  return (
    <div>
      <span data-testid="log-open">{String(ui.isLogEntrySheetOpen)}</span>
      <span data-testid="edit-item-open">{String(ui.isEditItemSheetOpen)}</span>
      <span data-testid="edit-entry-open">{String(ui.isEditEntrySheetOpen)}</span>
      <span data-testid="delete-item-open">{String(ui.isDeleteItemModalOpen)}</span>
      <button onClick={() => ui.setLogEntrySheetOpen(true)}>open-log</button>
      <button onClick={() => ui.setEditItemSheetOpen(true, { id: 99 } as never)}>open-edit-item</button>
      <button onClick={() => ui.setEditEntrySheetOpen(true, { id: 42 } as never)}>open-edit-entry</button>
      <button onClick={() => ui.setDeleteItemModalOpen(true, { id: 7 } as never)}>open-delete-item</button>
    </div>
  );
}

describe('UIContext', () => {
  it('all sheets start closed', () => {
    render(<UIProvider><ReadState /></UIProvider>);
    expect(screen.getByTestId('log-open').textContent).toBe('false');
    expect(screen.getByTestId('edit-item-open').textContent).toBe('false');
    expect(screen.getByTestId('edit-entry-open').textContent).toBe('false');
    expect(screen.getByTestId('delete-item-open').textContent).toBe('false');
  });

  it('setLogEntrySheetOpen opens log sheet', () => {
    render(<UIProvider><ReadState /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open-log')));
    expect(screen.getByTestId('log-open').textContent).toBe('true');
  });

  it('setEditItemSheetOpen opens edit item sheet', () => {
    render(<UIProvider><ReadState /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open-edit-item')));
    expect(screen.getByTestId('edit-item-open').textContent).toBe('true');
  });

  it('setEditEntrySheetOpen opens edit entry sheet', () => {
    render(<UIProvider><ReadState /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open-edit-entry')));
    expect(screen.getByTestId('edit-entry-open').textContent).toBe('true');
  });

  it('setDeleteItemModalOpen opens delete item modal', () => {
    render(<UIProvider><ReadState /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open-delete-item')));
    expect(screen.getByTestId('delete-item-open').textContent).toBe('true');
  });

  it('useUI throws outside provider', () => {
    const Bad = () => { useUI(); return null; };
    expect(() => render(<Bad />)).toThrow('useUI must be used within UIProvider');
  });
});
