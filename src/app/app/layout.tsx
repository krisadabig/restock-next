import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { getActiveSpaceForUser, getSpaceMembers, getCategories, getUserSpaces } from '@/lib/queries';
import ClientLayout from './ClientLayout';
import type { SpaceContextValue } from '@/components/providers/SpaceContext';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const membership = await getActiveSpaceForUser(db, session.userId);

  const emptySpace: SpaceContextValue = {
    spaceId: '',
    memberId: 0,
    displayName: session.username,
    avatar: null,
    members: [],
    mySpaces: [],
  };

  if (!membership) {
    return (
      <ClientLayout categories={[]} spaceValue={emptySpace}>
        {children}
      </ClientLayout>
    );
  }

  const [members, categories, mySpaces] = await Promise.all([
    getSpaceMembers(db, membership.spaceId),
    getCategories(db, membership.spaceId),
    getUserSpaces(db, session.userId),
  ]);

  const me = members.find((m) => m.memberId === membership.memberId);
  const spaceValue: SpaceContextValue = {
    spaceId: membership.spaceId,
    memberId: membership.memberId,
    displayName: me?.displayName ?? session.username,
    avatar: me?.avatar ?? null,
    members: members.map((m) => ({ memberId: m.memberId, displayName: m.displayName, avatar: m.avatar ?? null })),
    mySpaces: mySpaces.map((s) => ({ id: s.id, name: s.name })),
  };

  return (
    <ClientLayout categories={categories} spaceValue={spaceValue}>
      {children}
    </ClientLayout>
  );
}
