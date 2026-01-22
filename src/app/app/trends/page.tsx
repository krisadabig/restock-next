import { getEntries } from '../actions';
import TrendsClient from '@/components/dashboard/TrendsClient';

export const metadata = {
    title: 'Trends | Restock',
};

export default async function TrendsPage() {
    const entries = await getEntries();

    return <TrendsClient entries={entries} />;
}
