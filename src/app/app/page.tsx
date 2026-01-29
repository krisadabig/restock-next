import { Suspense } from 'react';
import { SkeletonList } from '@/components/SkeletonList';
import { getEntries, getInventory } from './actions';
import DashboardClient from '@/components/dashboard/DashboardClient';

async function DashboardContent() {
  const entries = await getEntries();
  const inventory = await getInventory();
  return <DashboardClient entries={entries} inventory={inventory} />;
}

export default async function DashboardHome() {
  return (
    <Suspense fallback={<SkeletonList />}>
         <DashboardContent />
    </Suspense>
  );
}
