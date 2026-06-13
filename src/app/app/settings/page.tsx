import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  getHouseholdForUser,
  getHouseholdMembers,
  getCategories,
  getHouseholdStores,
  getGroups,
  getGroupItems,
  getHouseholdItems,
} from '@/lib/queries';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = await getHouseholdForUser(db, session.userId);
  if (!householdId) redirect('/app');

  const [members, categories, stores, groups, itemsRaw] = await Promise.all([
    getHouseholdMembers(db, householdId),
    getCategories(db, householdId),
    getHouseholdStores(db, householdId),
    getGroups(db, householdId),
    getHouseholdItems(db, householdId),
  ]);

  const allItems = itemsRaw.map(({ item }) => ({ id: item.id, name: item.name }));

  const groupsWithItems = await Promise.all(
    groups.map(async (g) => {
      const items = await getGroupItems(db, g.id);
      return { id: g.id, name: g.name, items: items.map((i) => ({ id: i.id, name: i.name })) };
    }),
  );

  return (
    <SettingsClient
      currentUserId={session.userId}
      members={members}
      categories={categories}
      stores={stores}
      groups={groupsWithItems}
      allItems={allItems}
    />
  );
}
