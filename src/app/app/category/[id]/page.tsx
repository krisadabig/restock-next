import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  getHouseholdForUser,
  getCategoryItems,
  getCategoryPurchaseEntries,
  getCategoryMonthlySpend,
} from '@/lib/queries';
import * as schema from '@/lib/db/schema';
import CategoryClient from '@/components/category/CategoryClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);
  if (isNaN(categoryId)) notFound();

  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = await getHouseholdForUser(db, session.userId);
  if (!householdId) redirect('/app');

  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.id, categoryId),
  });

  if (!category || category.householdId !== householdId) notFound();

  const [items, purchaseEntries, monthlySpend] = await Promise.all([
    getCategoryItems(db, categoryId),
    getCategoryPurchaseEntries(db, categoryId),
    getCategoryMonthlySpend(db, categoryId),
  ]);

  return (
    <CategoryClient
      category={category}
      items={items}
      purchaseEntries={purchaseEntries}
      monthlySpend={monthlySpend}
    />
  );
}
