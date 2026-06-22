'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import LogEntrySheet from '@/components/entry/LogEntrySheet';
import QuickLogSheet from '@/components/entry/QuickLogSheet';
import EditItemSheet from '@/components/item/EditItemSheet';
import DeleteItemModal from '@/components/item/DeleteItemModal';
import { deleteItem } from '@/app/app/actions';
import { useLogSheet, useQuickLog, useItemSheet } from '@/components/providers/UIContext';
import { useSpace } from '@/components/providers/SpaceContext';
import SpaceSwitcher from '@/components/space/SpaceSwitcher';
import type { Category } from '@/lib/db/schema';
import { ROUTES } from '@/lib/constants';

interface Props {
  categories: Category[];
  children: ReactNode;
}

export default function AppShell({ categories, children }: Props) {
  const router = useRouter();
  const { spaceId, mySpaces } = useSpace();
  const { isOpen: isLogOpen, prefillItemId, prefillType, close: closeLog } = useLogSheet();
  const { isOpen: isQuickOpen, itemId: quickItemId, prefill: quickPrefill, close: closeQuick } = useQuickLog();
  const { isEditOpen, editTarget, editEntryCount, isDeleteOpen, deleteTarget, close: closeItem, openDelete } = useItemSheet();

  const handleDeleteItemConfirm = async () => {
    if (!deleteTarget) return;
    await deleteItem(deleteTarget.id);
    closeItem();
    router.push(ROUTES.STOCK);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-sans flex justify-center">
<div className="w-full max-w-md bg-background/80 backdrop-blur-xl min-h-screen relative shadow-2xl flex flex-col border-x border-border/50">
        {mySpaces.length > 1 && (
          <header className="flex items-center px-4 py-3 border-b border-border/30">
            <SpaceSwitcher activeSpaceId={spaceId} mySpaces={mySpaces} />
          </header>
        )}
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>
      </div>
      <BottomNav />
      <LogEntrySheet
        isOpen={isLogOpen}
        onClose={closeLog}
        prefillItemId={prefillItemId}
        prefillType={prefillType}
      />
      <QuickLogSheet
        isOpen={isQuickOpen}
        onClose={closeQuick}
        itemId={quickItemId}
        prefill={quickPrefill}
      />
      {editTarget && (
        <EditItemSheet
          item={editTarget}
          categories={categories}
          hasEntries={editEntryCount > 0}
          isOpen={isEditOpen}
          onClose={closeItem}
          onDeleteClick={(item) => {
            closeItem();
            openDelete(item);
          }}
        />
      )}
      {deleteTarget && (
        <DeleteItemModal
          item={deleteTarget}
          entryCount={editEntryCount}
          isOpen={isDeleteOpen}
          onClose={closeItem}
          onConfirm={handleDeleteItemConfirm}
        />
      )}
    </div>
  );
}
