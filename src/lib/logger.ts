import { Logger } from 'next-axiom';

const log = new Logger();

export { log };

// Usage in server actions:
//   import { log } from '@/lib/logger';
//   log.info('entry.add', { itemId, type, userId, householdId });
//   log.error('entry.add.failed', { error: e.message, itemId });
//
// Log levels: log.debug / log.info / log.warn / log.error
// In development: output goes to console (Axiom not required locally).
// In production: streamed to Axiom via Vercel Log Drain.
