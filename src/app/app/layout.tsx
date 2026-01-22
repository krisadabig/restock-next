'use client';

import { ReactNode } from 'react';
import BottomNav from '@/components/dashboard/BottomNav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 font-sans text-gray-900 flex justify-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 min-h-screen relative shadow-2xl flex flex-col">
            <main className="flex-1 overflow-y-auto pb-24">
                {children}
            </main>
            <BottomNav />
        </div>
    </div>
  );
}
