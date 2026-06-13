'use client';

import { useSyncExternalStore, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  testId?: string;
  children: ReactNode;
}

const subscribe = () => () => {};

export default function BottomSheetContainer({ isOpen, onClose, testId, children }: Props) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        data-testid={testId}
        className="relative w-full max-w-md glass rounded-t-[2.5rem] sm:rounded-[2.5rem] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 p-6 space-y-5"
      >
        <div className="sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto -mt-2 mb-2" />
        {children}
      </div>
    </div>,
    document.body,
  );
}
