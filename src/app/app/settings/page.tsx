import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  getHouseholdForUser,
  getHouseholdMembers,
  getCategories,
  getHouseholdStores,
} from '@/lib/queries';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = await getHouseholdForUser(db, session.userId);
  if (!householdId) redirect('/app');

  const [members, categories, stores] = await Promise.all([
    getHouseholdMembers(db, householdId),
    getCategories(db, householdId),
    getHouseholdStores(db, householdId),
  ]);

  return (
    <SettingsClient
      currentUserId={session.userId}
      members={members}
      categories={categories}
      stores={stores}
    />
  );
}
