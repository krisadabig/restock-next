import { Suspense } from 'react';
import { SkeletonList } from '@/components/SkeletonList';
import { getEntries } from './actions';
import DashboardClient from '@/components/dashboard/DashboardClient';

async function DashboardContent({ showAddModal }: { showAddModal: boolean }) {
  const entries = await getEntries();
  return <DashboardClient entries={entries} showAddModal={showAddModal} />;
}

export default async function DashboardHome(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const showAddModal = searchParams?.add === 'true';

  return (
    <Suspense fallback={<SkeletonList />}>
         <DashboardContent showAddModal={showAddModal} />
    </Suspense>
  );
}
