import { notFound } from 'next/navigation';
import { getInventoryItem, getEntriesByItem } from '@/app/app/actions';
import ItemDetailClient from '@/components/inventory/ItemDetailClient';

export default async function ItemDetailPage({ params }: { params: Promise<{ item: string }> }) {
    // Next.js 15+ params are promises
    const { item } = await params;
    const decodedItem = decodeURIComponent(item);

    const inventoryItem = await getInventoryItem(decodedItem);
    
    // If item doesn't exist in inventory, it might still have entries (if legacy?), 
    // but our flow enforces inventory creation on addEntry.
    // If accessed directly and not found, show 404 or maybe a "Create" state?
    // For now, 404 is safer.
    if (!inventoryItem) {
        notFound();
    }

    const history = await getEntriesByItem(decodedItem);

    return <ItemDetailClient inventoryItem={inventoryItem} history={history} />;
}
