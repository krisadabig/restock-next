import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  getActiveSpaceForUser,
  getSpaceMembers,
  getCategories,
  getSpaceStores,
} from '@/lib/queries';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const membership = await getActiveSpaceForUser(db, session.userId);
  if (!membership) redirect('/app');

  const [members, categories, stores] = await Promise.all([
    getSpaceMembers(db, membership.spaceId),
    getCategories(db, membership.spaceId),
    getSpaceStores(db, membership.spaceId),
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
