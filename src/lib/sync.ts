import { getPendingMutations, removePendingMutation, saveEntriesCache } from './idb';
import { addEntry, updateEntry, deleteEntry, getEntries } from '@/app/app/actions';

export type SyncStatus = 'idle' | 'syncing' | 'error';

export class SyncEngine {
	private isSyncing = false;
	private onStatusChange: (status: SyncStatus) => void;
	private onDataChange: () => void;

	constructor(onStatusChange: (status: SyncStatus) => void, onDataChange: () => void) {
		this.onStatusChange = onStatusChange;
		this.onDataChange = onDataChange;
	}

	async sync() {
		if (this.isSyncing) return;

		try {
			this.isSyncing = true;
			this.onStatusChange('syncing');

			const mutations = await getPendingMutations();
			const processedIds: string[] = [];

			// Process mutations in order
			for (const mutation of mutations.sort((a, b) => a.timestamp - b.timestamp)) {
				try {
					switch (mutation.type) {
						case 'add':
							await addEntry(mutation.payload);
							break;
						case 'edit':
							await updateEntry(mutation.payload.id, mutation.payload.data);
							break;
						case 'delete':
							await deleteEntry(mutation.payload.id);
							break;
					}
					// Mark for removal but don't remove yet (avoids UI gap)
					processedIds.push(mutation.id);
				} catch (error) {
					console.error(`Failed to process mutation ${mutation.id}:`, error);
					// If failed, we should probably still remove it or move to dead-letter queue
					// For now, removing to prevent block, same as before
					processedIds.push(mutation.id);
				}
			}

			// After processing queue, try to refresh local cache from server
			// We wrap this in try-catch so that if it fails, we STILL remove the mutations
			// to prevent duplication on next sync.
			try {
				const freshEntries = await getEntries();
				await saveEntriesCache(freshEntries);
			} catch (err) {
				console.error('Failed to refresh cache after sync:', err);
			}

			// NOW remove the mutations
			for (const id of processedIds) {
				await removePendingMutation(id);
			}

			this.onDataChange(); // Notify UI to re-render
			this.onStatusChange('idle');
		} catch (error) {
			console.error('Sync failed:', error);
			this.onStatusChange('error');
		} finally {
			this.isSyncing = false;
		}
	}
}
