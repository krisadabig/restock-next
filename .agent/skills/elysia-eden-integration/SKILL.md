---
name: elysia-eden-integration
description: Guidelines for type-safe API communication between Next.js (FE) and Elysia (BE) using Eden Treaty.
---

# Elysia-Eden Integration Skill

This skill provides guidelines and patterns for implementing type-safe API communication in the Bill-Harmony project using Elysia's Eden Treaty.

## Core Concepts

- **Eden Treaty**: A type-safe fetch client that provides full-type safety for Elysia APIs.
- **RSC vs Client Components**: Pattern for using Eden in Next.js Server Components and Client Components.
- **Shared Types**: Utilization of `@bill-harmony/types` for data validation and consistency.

## Implementation Patterns

### 1. Initializing the Client
The client should be initialized in `apps/web/src/lib/api/eden.ts`:

```typescript
import { treaty } from '@elysiajs/eden';
import type { App } from '@/apps/api/src/app';

const api = treaty<App>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

export { api };
```

### 2. Usage in Server Components (RSC)
In Next.js 16 Server Components, use the client directly for data fetching without hooks:

```typescript
import { api } from '@/lib/api/eden';

export default async function Page() {
    const { data, error } = await api.groups.get();
    if (error) return <div>Error loading groups</div>;
    return <GroupList groups={data.data} />;
}
```

### 3. Usage in Client Components
Wrap Eden calls in React hooks (like `useEffect` or `useQuery`) for interactive elements:

```typescript
'use client';
import { api } from '@/lib/api/eden';
import { useActionState } from 'react';

export function CreateGroupForm() {
    const [state, action, isPending] = useActionState(async (prev, formData) => {
        const name = formData.get('name') as string;
        const { data, error } = await api.groups.post({ name });
        if (error) return { error: error.value.message };
        return { success: true, data: data.data };
    }, null);

    return <form action={action}>...</form>;
}
```

## Best Practices

- **Error Handling**: Always check both `success` boolean from the backend response and the `error` object from Eden.
- **Optimistic Updates**: Use `useOptimistic` for UI responsiveness during API calls.
- **Secret Hygiene**: Never expose `PORT` or database strings to the client-side via Eden config.
