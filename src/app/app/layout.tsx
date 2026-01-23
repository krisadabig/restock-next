'use client';

import { ReactNode } from 'react';
import BottomNav from '@/components/dashboard/BottomNav';
import { OfflineProvider } from '@/components/providers/OfflineContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <OfflineProvider>
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-black transition-colors duration-200 font-sans text-slate-900 flex justify-center">
            {/* Background Blobs for depth */}
            <div className="bg-blob bg-indigo-500/10 -top-50 -left-50" />
            
            <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl min-h-screen relative shadow-2xl flex flex-col border-x border-slate-200/50 dark:border-white/5">
                <main className="flex-1 overflow-y-auto pb-24">
                    {children}
                </main>
            </div>
            <BottomNav />
        </div>
    </OfflineProvider>
  );
}
