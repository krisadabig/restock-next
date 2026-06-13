'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import LogEntrySheet from '@/components/entry/LogEntrySheet';
import EditItemSheet from '@/components/item/EditItemSheet';
import DeleteItemModal from '@/components/item/DeleteItemModal';
import { deleteItem } from '@/app/app/actions';
import { useUI } from '@/components/providers/UIContext';
import type { Category } from '@/lib/db/schema';

interface Props {
  categories: Category[];
  children: ReactNode;
}

export default function AppShell({ categories, children }: Props) {
  const router = useRouter();
  const {
    isLogEntrySheetOpen, setLogEntrySheetOpen, logEntryPrefillItemId, logEntryPrefillType,
    isEditItemSheetOpen, editItemTarget, editItemEntryCount, setEditItemSheetOpen,
    isDeleteItemModalOpen, deleteItemTarget, setDeleteItemModalOpen,
  } = useUI();

  const handleDeleteItemConfirm = async () => {
    if (!deleteItemTarget) return;
    await deleteItem(deleteItemTarget.id);
    setDeleteItemModalOpen(false);
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-sans flex justify-center">
      <div className="bg-blob bg-primary/5 -top-50 -left-50" />
      <div className="w-full max-w-md bg-background/80 backdrop-blur-xl min-h-screen relative shadow-2xl flex flex-col border-x border-border/50">
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>
      </div>
      <BottomNav />
      <LogEntrySheet
        isOpen={isLogEntrySheetOpen}
        onClose={() => setLogEntrySheetOpen(false)}
        prefillItemId={logEntryPrefillItemId}
        prefillType={logEntryPrefillType}
      />
      {editItemTarget && (
        <EditItemSheet
          item={editItemTarget}
          categories={categories}
          hasEntries={editItemEntryCount > 0}
          isOpen={isEditItemSheetOpen}
          onClose={() => setEditItemSheetOpen(false)}
          onDeleteClick={(item) => {
            setEditItemSheetOpen(false);
            setDeleteItemModalOpen(true, item);
          }}
        />
      )}
      {deleteItemTarget && (
        <DeleteItemModal
          item={deleteItemTarget}
          entryCount={editItemEntryCount}
          isOpen={isDeleteItemModalOpen}
          onClose={() => setDeleteItemModalOpen(false)}
          onConfirm={handleDeleteItemConfirm}
        />
      )}
    </div>
  );
}
