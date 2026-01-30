import { getInventory } from '@/app/app/actions';
import InventoryClient from '@/components/inventory/InventoryClient';

export default async function InventoryPage() {
    const inventory = await getInventory();

    return <InventoryClient inventory={inventory} />;
}
