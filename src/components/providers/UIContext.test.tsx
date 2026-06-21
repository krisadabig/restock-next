import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { UIProvider, useUI, useLogSheet, useQuickLog, useItemSheet } from './UIContext';
import type { Item } from '@/lib/db/schema';

afterEach(cleanup);

// ── Legacy useUI tests (kept for backward compat verification) ────────────────

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

describe('UIContext (legacy useUI)', () => {
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
    expect(() => render(<Bad />)).toThrow(/must be used within UIProvider/);
  });
});

// ── useLogSheet ───────────────────────────────────────────────────────────────

function ReadLogSheet() {
  const { isOpen, prefillItemId, prefillType, open, close } = useLogSheet();
  return (
    <div>
      <span data-testid="is-open">{String(isOpen)}</span>
      <span data-testid="prefill-item">{prefillItemId ?? 'none'}</span>
      <span data-testid="prefill-type">{prefillType ?? 'none'}</span>
      <button onClick={() => open(42, 'purchase')}>open</button>
      <button onClick={close}>close</button>
    </div>
  );
}

describe('useLogSheet', () => {
  it('starts closed with no prefill', () => {
    render(<UIProvider><ReadLogSheet /></UIProvider>);
    expect(screen.getByTestId('is-open').textContent).toBe('false');
    expect(screen.getByTestId('prefill-item').textContent).toBe('none');
  });

  it('open() sets isOpen true with prefill', () => {
    render(<UIProvider><ReadLogSheet /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open')));
    expect(screen.getByTestId('is-open').textContent).toBe('true');
    expect(screen.getByTestId('prefill-item').textContent).toBe('42');
    expect(screen.getByTestId('prefill-type').textContent).toBe('purchase');
  });

  it('close() resets to closed with no prefill', () => {
    render(<UIProvider><ReadLogSheet /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open')));
    act(() => fireEvent.click(screen.getByText('close')));
    expect(screen.getByTestId('is-open').textContent).toBe('false');
    expect(screen.getByTestId('prefill-item').textContent).toBe('none');
  });
});

// ── useQuickLog ───────────────────────────────────────────────────────────────

const PREFILL = { itemName: 'Milk', categoryName: null, unit: 'L', lastQty: 2, lastPrice: 30, lastStore: 'Big C' };

function ReadQuickLog() {
  const { isOpen, itemId, prefill, open, close } = useQuickLog();
  return (
    <div>
      <span data-testid="is-open">{String(isOpen)}</span>
      <span data-testid="item-id">{itemId ?? 'none'}</span>
      <span data-testid="prefill-name">{prefill?.itemName ?? 'none'}</span>
      <button onClick={() => open(7, PREFILL)}>open</button>
      <button onClick={close}>close</button>
    </div>
  );
}

describe('useQuickLog', () => {
  it('open() stores itemId', () => {
    render(<UIProvider><ReadQuickLog /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open')));
    expect(screen.getByTestId('is-open').textContent).toBe('true');
    expect(screen.getByTestId('item-id').textContent).toBe('7');
    expect(screen.getByTestId('prefill-name').textContent).toBe('Milk');
  });

  it('close() clears itemId and prefill', () => {
    render(<UIProvider><ReadQuickLog /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open')));
    act(() => fireEvent.click(screen.getByText('close')));
    expect(screen.getByTestId('is-open').textContent).toBe('false');
    expect(screen.getByTestId('item-id').textContent).toBe('none');
    expect(screen.getByTestId('prefill-name').textContent).toBe('none');
  });
});

// ── useItemSheet ──────────────────────────────────────────────────────────────

const ITEM_A = { id: 1, name: 'Milk' } as Item;
const ITEM_B = { id: 2, name: 'Rice' } as Item;

function ReadItemSheet() {
  const { isEditOpen, editTarget, isDeleteOpen, deleteTarget, openEdit, openDelete, close } = useItemSheet();
  return (
    <div>
      <span data-testid="is-edit-open">{String(isEditOpen)}</span>
      <span data-testid="edit-target">{editTarget?.name ?? 'none'}</span>
      <span data-testid="is-delete-open">{String(isDeleteOpen)}</span>
      <span data-testid="delete-target">{deleteTarget?.name ?? 'none'}</span>
      <button onClick={() => openEdit(ITEM_A)}>open-edit</button>
      <button onClick={() => openDelete(ITEM_B)}>open-delete</button>
      <button onClick={close}>close</button>
    </div>
  );
}

describe('useItemSheet', () => {
  it('openEdit and openDelete are independent', () => {
    render(<UIProvider><ReadItemSheet /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open-edit')));
    expect(screen.getByTestId('is-edit-open').textContent).toBe('true');
    expect(screen.getByTestId('edit-target').textContent).toBe('Milk');
    expect(screen.getByTestId('is-delete-open').textContent).toBe('false');

    act(() => fireEvent.click(screen.getByText('open-delete')));
    expect(screen.getByTestId('is-delete-open').textContent).toBe('true');
    expect(screen.getByTestId('delete-target').textContent).toBe('Rice');
    expect(screen.getByTestId('is-edit-open').textContent).toBe('false');
  });

  it('close() resets both edit and delete', () => {
    render(<UIProvider><ReadItemSheet /></UIProvider>);
    act(() => fireEvent.click(screen.getByText('open-edit')));
    act(() => fireEvent.click(screen.getByText('close')));
    expect(screen.getByTestId('is-edit-open').textContent).toBe('false');
    expect(screen.getByTestId('edit-target').textContent).toBe('none');
  });
});
