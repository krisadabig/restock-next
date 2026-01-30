import { Suspense } from 'react';
import { SkeletonList } from '@/components/SkeletonList';
import { getEntries } from './actions';
import DashboardClient from '@/components/dashboard/DashboardClient';

async function DashboardContent() {
  const entries = await getEntries();
  return <DashboardClient entries={entries} />;
}

export default async function DashboardHome() {
  return (
    <Suspense fallback={<SkeletonList />}>
         <DashboardContent />
    </Suspense>
  );
}
