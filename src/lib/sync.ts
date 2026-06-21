'use client';

import { getPendingMutations, removePendingMutation } from './idb';
import { log } from './logger';
import type { MutationType, PendingMutation } from './idb';

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
      if (mutations.length === 0) {
        this.onStatusChange('idle');
        return;
      }

      const sorted = [...mutations].sort((a, b) => a.timestamp - b.timestamp);
      const processed: string[] = [];

      for (const mutation of sorted) {
        try {
          await this.applyMutation(mutation);
          processed.push(mutation.id);
        } catch (e) {
          log.error('sync.failed', { mutation: mutation.type, error: (e as Error).message });
          processed.push(mutation.id); // remove to prevent queue block
        }
      }

      for (const id of processed) await removePendingMutation(id);

      log.info('sync.replay', { mutationCount: processed.length });
      this.onDataChange();
      this.onStatusChange('idle');
    } catch (e) {
      log.error('sync.failed', { error: (e as Error).message });
      this.onStatusChange('error');
    } finally {
      this.isSyncing = false;
    }
  }

  private async applyMutation(mutation: PendingMutation) {
    // Server actions are imported lazily to avoid including server code in the
    // client bundle at module load time.
    const actions = await import('@/app/app/actions');

    switch (mutation.type as MutationType) {
      case 'entry.add':
        await actions.addEntry(mutation.payload);
        break;
      case 'entry.update':
        await actions.updateEntry(mutation.payload.id, mutation.payload.data);
        break;
      case 'entry.delete':
        await actions.deleteEntry(mutation.payload.id);
        break;
    }
  }
}
