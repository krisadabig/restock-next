import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, resetDb } from '../helpers/db';
import { makeSpace, makeCategory } from '../helpers/factories';
import { insertCategory, getCategories, updateCategoryRecord, deleteCategoryRecord } from '@/lib/queries';
import * as schema from '@/lib/db/schema';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('insertCategory', () => {
  it('creates row with correct spaceId and name', async () => {
    const space = await makeSpace(db);
    const category = await insertCategory(db, { spaceId: space.id, name: 'Dairy', defaultUnit: 'pcs' });

    expect(category.spaceId).toBe(space.id);
    expect(category.name).toBe('Dairy');
  });
});

describe('getCategories', () => {
  it('returns only categories for the given space', async () => {
    const s1 = await makeSpace(db);
    const s2 = await makeSpace(db);
    await makeCategory(db, s1.id, { name: 'Meat' });
    await makeCategory(db, s2.id, { name: 'Fish' });

    const result = await getCategories(db, s1.id);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Meat');
  });
});

describe('updateCategoryRecord', () => {
  it('updates name in categories row', async () => {
    const space = await makeSpace(db);
    const cat = await makeCategory(db, space.id, { name: 'Old' });

    await updateCategoryRecord(db, cat.id, { name: 'New' });

    const updated = await db.query.categories.findFirst({ where: eq(schema.categories.id, cat.id) });
    expect(updated?.name).toBe('New');
  });

  it('updates defaultUnit without touching name', async () => {
    const space = await makeSpace(db);
    const cat = await makeCategory(db, space.id, { name: 'Drinks', defaultUnit: 'pcs' });

    await updateCategoryRecord(db, cat.id, { defaultUnit: 'ml' });

    const updated = await db.query.categories.findFirst({ where: eq(schema.categories.id, cat.id) });
    expect(updated?.name).toBe('Drinks');
    expect(updated?.defaultUnit).toBe('ml');
  });
});

describe('deleteCategoryRecord', () => {
  it('removes the category from the database', async () => {
    const space = await makeSpace(db);
    const cat = await makeCategory(db, space.id);

    await deleteCategoryRecord(db, cat.id);

    const gone = await db.query.categories.findFirst({ where: eq(schema.categories.id, cat.id) });
    expect(gone).toBeUndefined();
  });
});
