import { getEntries } from './actions';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardHome(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const entries = await getEntries();
  const showAddModal = searchParams?.add === 'true';

  return <DashboardClient entries={entries} showAddModal={showAddModal} />;
}
