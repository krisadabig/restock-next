import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getActiveSpaceForUser, getCategories, getSpaceStores } from '@/lib/queries';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const membership = await getActiveSpaceForUser(db, session.userId);
  if (!membership) redirect('/app');

  const [categories, stores] = await Promise.all([
    getCategories(db, membership.spaceId),
    getSpaceStores(db, membership.spaceId),
  ]);

  return <SettingsClient categories={categories} stores={stores} />;
}
