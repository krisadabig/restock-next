---
name: yjs-collaboration
description: Patterns for real-time collaborative editing using Yjs, Svelte/React, and WebSocket.
---

# Yjs Collaboration Skill

This skill documents the implementation details for Yjs-based real-time collaboration in Bill-Harmony.

## Component architecture

- **Y.Doc**: The single source of truth for a collaborative document.
- **Provider**: Connects the `Y.Doc` to a communication channel (WebSocket).
- **Binding**: Maps Yjs types (Map, Array, Text) to UI state (React/Svelte).

## Real-time Flow

1. **Connection**: Client connects to `ws://api/bills/{billId}`.
2. **Sync**: The `y-websocket` provider syncs the state between client and server.
3. **Observation**: UI components observe changes in the Yjs types and update state.

## Implementation Details (Next.js/React)

### 1. Hook for Collaborative State
Use a hook to manage the lifecycle of the `Y.Doc` and its provider:

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useBillEditor(billId: string) {
    const [doc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);

    useEffect(() => {
        const p = new WebsocketProvider(WS_URL, `bill-${billId}`, doc);
        setProvider(p);
        return () => p.destroy();
    }, [billId]);

    const items = doc.getArray('items');
    // Observer logic here
    return { doc, items, status: provider?.status };
}
```

## Best Practices

- **Avoid Conflicts**: Always use unique IDs for items added to a `Y.Array`.
- **Granular Updates**: Only update specific properties in a `Y.Map` to minimize network traffic.
- **Offline Support**: Leverages Yjs's ability to sync when reconnected.
- **Binary Persistence**: Store snapshots as `Uint8Array` in the database `bytea` column.
