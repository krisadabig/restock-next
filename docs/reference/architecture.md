# Application Architecture

## System Context

```mermaid
graph TD
    User((User))
    PWA[Next.js PWA\n(Browser/Mobile)]
    API[Next.js API Routes\n/api/*]
    ServerActions[Server Actions\n(Data Mutation)]
    DB[(PostgreSQL)]
    IDB[(IndexedDB\nLocal Storage)]

    User -->|Interacts| PWA
    PWA -->|Read/Write (Offline)| IDB
    PWA -->|Sync (Online)| ServerActions
    PWA -->|Auth| API
    ServerActions -->|Query/Mutation| DB
    API -->|Auth Verification| DB
```

## Component Architecture

```mermaid
graph TD
    subgraph Client [Client Side]
        Layout[RootLayout] --> Providers
        Providers --> UIContext
        Providers --> OfflineContext
        
        subgraph Pages
            Dashboard[Dashboard Page]
            Inventory[Inventory Page]
            Settings[Settings Page]
            Login[Login Page]
        end
        
        Dashboard --> EntryCard
        Dashboard --> DashboardFilters
        Dashboard --> AddEntryModal
        
        Inventory --> InventoryCard
        Inventory --> ItemDetail
    end

    subgraph Server [Server Side]
        Actions[Server Actions\nsrc/app/api/*/actions.ts]
        APIRoute[API Routes\nsrc/app/api/auth/route.ts]
        Drizzle[Drizzle ORM]
    end

    AddEntryModal -.->|useActionState| Actions
    Login -.->|Fetch| APIRoute
    Actions --> Drizzle
    APIRoute --> Drizzle
```

## Database Schema

```mermaid
erDiagram
    users {
        text id PK
        text username
        text email
        text password_hash
    }

    authenticators {
        text credential_id PK
        text user_id FK
        text credential_public_key
        int counter
    }

    entries {
        serial id PK
        text user_id FK
        text item
        real price
        real quantity
        text unit
        text type
        text date
    }

    inventory {
        serial id PK
        text user_id FK
        text item
        real quantity
        text unit
        text status
        int alert_enabled
    }

    feedback {
        text id PK
        text user_id FK
        text message
        text type
    }

    users ||--o{ entries : "has"
    users ||--o{ inventory : "owns"
    users ||--o{ authenticators : "authenticates_with"
    users ||--o{ feedback : "submits"
```
