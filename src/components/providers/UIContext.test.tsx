import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { UIProvider, useLogSheet, useQuickLog, useItemSheet } from './UIContext';
import type { Item } from '@/lib/db/schema';

afterEach(cleanup);

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
