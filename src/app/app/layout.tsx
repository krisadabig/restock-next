'use client';

import { ReactNode } from 'react';
import BottomNav from '@/components/dashboard/BottomNav';
import { OfflineProvider } from '@/components/providers/OfflineContext';
import { UIProvider } from '@/components/providers/UIContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <OfflineProvider>
      <UIProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-sans flex justify-center">
            {/* Background Blobs for depth */}
            <div className="bg-blob bg-primary/5 -top-50 -left-50" />
            
            <div className="w-full max-w-md bg-background/80 backdrop-blur-xl min-h-screen relative shadow-2xl flex flex-col border-x border-border/50">
                <main className="flex-1 overflow-y-auto pb-24">
                    {children}
                </main>
            </div>
            <BottomNav />
        </div>
      </UIProvider>
    </OfflineProvider>
  );
}
