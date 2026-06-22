'use client';

import { useState } from 'react';
import BottomSheetContainer from '@/components/ui/BottomSheetContainer';
import { switchSpace } from '@/app/app/actions';

interface Props {
  activeSpaceId: string;
  mySpaces: Array<{ id: string; name: string }>;
}

export default function SpaceSwitcher({ activeSpaceId, mySpaces }: Props) {
  const [open, setOpen] = useState(false);
  const activeSpace = mySpaces.find((s) => s.id === activeSpaceId);

  const handleSelect = async (spaceId: string) => {
    setOpen(false);
    await switchSpace(spaceId);
  };

  return (
    <>
      <button
        data-testid="space-switcher-trigger"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        <span>{activeSpace?.name ?? 'Space'}</span>
        <svg
          className="w-3.5 h-3.5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <BottomSheetContainer
        isOpen={open}
        onClose={() => setOpen(false)}
        testId="space-switcher-sheet"
      >
        <h2 className="text-base font-bold text-foreground mb-4">Switch Space</h2>
        <ul className="space-y-2">
          {mySpaces.map((space) => (
            <li key={space.id}>
              <button
                data-testid={`space-option-${space.id}`}
                aria-current={space.id === activeSpaceId ? 'true' : undefined}
                onClick={() => handleSelect(space.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  space.id === activeSpaceId
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground hover:bg-secondary/50'
                }`}
              >
                {space.name}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheetContainer>
    </>
  );
}
