import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getItemAllEntries, getItemPurchaseHistory, getActiveSpaceForUser } from '@/lib/queries';
import ItemDetailClient from '@/components/item/ItemDetailClient';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) notFound();

  const session = await getSession();
  if (!session) redirect('/login');

  const membership = await getActiveSpaceForUser(db, session.userId);
  if (!membership) redirect('/app');

  // Fetch item + category
  const item = await db.query.items.findFirst({
    where: eq(schema.items.id, itemId),
  });

  if (!item || item.spaceId !== membership.spaceId) notFound();

  const category = item.categoryId
    ? await db.query.categories.findFirst({
        where: eq(schema.categories.id, item.categoryId),
      }) ?? null
    : null;

  const [allEntries, purchaseHistory] = await Promise.all([
    getItemAllEntries(db, itemId),
    getItemPurchaseHistory(db, itemId),
  ]);

  return (
    <ItemDetailClient
      item={item}
      category={category}
      allEntries={allEntries}
      purchaseHistory={purchaseHistory}
    />
  );
}
