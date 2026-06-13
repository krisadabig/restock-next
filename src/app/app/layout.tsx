import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { getHouseholdForUser, getHouseholdMembers, getCategories } from '@/lib/queries';
import ClientLayout from './ClientLayout';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = await getHouseholdForUser(db, session.userId);

  // No household yet — show empty layout; onboarding will create one
  if (!householdId) {
    return (
      <ClientLayout householdId="" currentUserId={session.userId} members={[]} categories={[]}>
        {children}
      </ClientLayout>
    );
  }

  const [members, categories] = await Promise.all([
    getHouseholdMembers(db, householdId),
    getCategories(db, householdId),
  ]);

  return (
    <ClientLayout householdId={householdId} currentUserId={session.userId} members={members} categories={categories}>
      {children}
    </ClientLayout>
  );
}
