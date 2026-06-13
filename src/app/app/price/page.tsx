import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  getHouseholdForUser,
  getHouseholdSpend,
  getRecentPurchases,
  getStoreBreakdown,
} from '@/lib/queries';
import PriceClient from '@/components/price/PriceClient';
import type { TimeRange } from '@/components/price/TimeRangeSelector';

interface Props {
  searchParams: Promise<{ range?: string }>;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getRangeDates(range: TimeRange): {
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
} {
  const today = new Date();
  const todayStr = toDateStr(today);

  if (range === 'month') {
    const from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
    const prevEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const prevFrom = `${prevEnd.getFullYear()}-${pad(prevEnd.getMonth() + 1)}-01`;
    return { from, to: todayStr, prevFrom, prevTo: toDateStr(prevEnd) };
  }

  if (range === '3months') {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 3);
    const from = toDateStr(d);
    const prevD = new Date(d);
    prevD.setMonth(prevD.getMonth() - 3);
    return { from, to: todayStr, prevFrom: toDateStr(prevD), prevTo: from };
  }

  if (range === 'year') {
    const from = `${today.getFullYear()}-01-01`;
    const prevFrom = `${today.getFullYear() - 1}-01-01`;
    const prevTo = `${today.getFullYear() - 1}-12-31`;
    return { from, to: todayStr, prevFrom, prevTo };
  }

  // all time
  return { from: '1970-01-01', to: todayStr, prevFrom: '1970-01-01', prevTo: '1970-01-01' };
}

function parseRange(raw?: string): TimeRange {
  if (raw === '3months' || raw === 'year' || raw === 'all') return raw;
  return 'month';
}

export default async function PricePage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = await getHouseholdForUser(db, session.userId);
  if (!householdId) redirect('/app');

  const { range: rawRange } = await searchParams;
  const range = parseRange(rawRange);
  const { from, to, prevFrom, prevTo } = getRangeDates(range);

  const [current, previous, recentRows, storeSpend] = await Promise.all([
    getHouseholdSpend(db, householdId, from, to),
    getHouseholdSpend(db, householdId, prevFrom, prevTo),
    getRecentPurchases(db, householdId, 10),
    getStoreBreakdown(db, householdId, from, to),
  ]);

  const categorySpend = current.byCategory.map((c) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    total: c.total,
  }));

  const recentPurchases = recentRows
    .filter((r) => r.entry.itemId != null)
    .map((r) => ({
      entry: r.entry,
      itemId: r.entry.itemId as number,
      itemName: r.itemName,
      categoryName: r.categoryName ?? null,
    }));

  return (
    <PriceClient
      range={range}
      totalSpend={{ current: current.total, previous: previous.total }}
      categorySpend={categorySpend}
      recentPurchases={recentPurchases}
      storeSpend={storeSpend}
    />
  );
}
