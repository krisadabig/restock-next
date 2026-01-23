import { getPendingMutations, removePendingMutation, saveEntriesCache } from './idb';
import { addEntry, updateEntry, deleteEntry, getEntries } from '@/app/app/actions';

export type SyncStatus = 'idle' | 'syncing' | 'error';

export class SyncEngine {
	private isSyncing = false;
	private onStatusChange: (status: SyncStatus) => void;

	constructor(onStatusChange: (status: SyncStatus) => void) {
		this.onStatusChange = onStatusChange;
	}

	async sync() {
		if (this.isSyncing) return;

		try {
			this.isSyncing = true;
			this.onStatusChange('syncing');

			const mutations = await getPendingMutations();

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
					// Remove successfully processed mutation
					await removePendingMutation(mutation.id);
				} catch (error) {
					console.error(`Failed to process mutation ${mutation.id}:`, error);
					// For now, we keep failing mutations in the queue or logic to discard?
					// Strategy: If 400/500, maybe discard? For now, we'll implement a simple retry logic
					// by not deleting it from IDB, but this can block queue.
					// Better approach for MVP: Log error and remove to prevent blocking.
					await removePendingMutation(mutation.id);
				}
			}

			// After processing queue, refresh local cache from server
			const freshEntries = await getEntries();
			await saveEntriesCache(freshEntries);

			this.onStatusChange('idle');
		} catch (error) {
			console.error('Sync failed:', error);
			this.onStatusChange('error');
		} finally {
			this.isSyncing = false;
		}
	}
}
