import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { getActiveSpaceForUser, getSpaceMembers, getCategories } from '@/lib/queries';
import ClientLayout from './ClientLayout';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const membership = await getActiveSpaceForUser(db, session.userId);

  if (!membership) {
    return (
      <ClientLayout householdId="" currentUserId={session.userId} members={[]} categories={[]}>
        {children}
      </ClientLayout>
    );
  }

  const [members, categories] = await Promise.all([
    getSpaceMembers(db, membership.spaceId),
    getCategories(db, membership.spaceId),
  ]);

  return (
    <ClientLayout householdId={membership.spaceId} currentUserId={session.userId} members={members} categories={categories}>
      {children}
    </ClientLayout>
  );
}
