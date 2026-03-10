# Mock Handler — Generation Guide

Mock handlers are TypeScript files that register routes with the mock registry. Each file covers one feature area and can contain multiple `registerMock()` calls. Handlers use an **in-memory store** so that data written via POST/PUT/PATCH persists across requests within the same session.

## File Location

```
src/features/{featureName}/mock/{featureName}Mock.ts
```

Place the mock handler inside the feature directory it belongs to. Name it using the feature name with a `Mock` suffix (e.g., `src/features/contracts/mock/contractsMock.ts`, `src/features/documents/mock/documentsMock.ts`).

## Core Concepts

### In-Memory Store

Every mock handler file declares a module-level store that holds data for the session. The store is keyed by the resource's primary ID so that **any arbitrary ID works** — you are not limited to predefined mock IDs.

```typescript
const store: Record<string, ContractData> = { /* pre-seeded entries */ };
```

### Pre-Seeded Data

The store MUST be pre-seeded with **multiple entries** (at least 2–3) that cover different shapes and states of the data. This gives the frontend realistic variety without needing to POST first. Each seed entry should:

- Use a different `mock-` prefixed ID
- Vary enum/status fields across entries (e.g., `"draft"`, `"active"`, `"completed"`)
- Fill optional/nullable fields in some entries but leave them `null` in others
- Use different realistic German-language placeholder values

### Arbitrary IDs

Because the store is keyed by the path parameter ID, the frontend can use **any ID** it wants. GET handlers lazy-initialize a default entry when an unknown ID is requested. POST/PUT/PATCH handlers create or update the entry for whatever ID is passed in the path.

## Template

```typescript
import { registerMock } from "@/shared/backend/mocks/registry";
import { NextResponse } from "next/server";

// Type matching the Zod schema for this resource
type ResourceData = {
  id: string;
  name: string;
  status: "draft" | "active" | "completed";
  description: string | null;
  createdAt: string;
};

// Pre-seeded store with varied entries
const store: Record<string, ResourceData> = {
  "mock-resource-1": {
    id: "mock-resource-1",
    name: "Erste Ressource",
    status: "active",
    description: "Vollständig ausgefüllte Ressource",
    createdAt: "2024-01-15T10:00:00Z",
  },
  "mock-resource-2": {
    id: "mock-resource-2",
    name: "Zweite Ressource",
    status: "draft",
    description: null, // nullable field left empty
    createdAt: "2024-03-20T14:30:00Z",
  },
  "mock-resource-3": {
    id: "mock-resource-3",
    name: "Dritte Ressource",
    status: "completed",
    description: "Abgeschlossene Ressource mit allen Daten",
    createdAt: "2023-11-05T08:15:00Z",
  },
};

// Helper to get or create a default entry for any ID
function getOrCreate(id: string): ResourceData {
  store[id] ??= {
    id,
    name: "Neue Ressource",
    status: "draft",
    description: null,
    createdAt: new Date().toISOString(),
  };
  return store[id];
}
```

## Writing the registerMock Call

### Imports

Always import `registerMock` from `"@/shared/backend/mocks/registry"` and `NextResponse` from `"next/server"`.

### Path Pattern

Use the same path as the `EndpointConfig.path` — including `{param}` placeholders:

```typescript
pathPattern: "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts",
```

### Handler Arguments

- `req` — the `NextRequest` object. Use it to read query params (`req.nextUrl.searchParams`) or request body (`await req.json()`)
- `params` — extracted path variables as `Record<string, string>`. Keys match the `{param}` names in the path pattern

### Method Patterns

**GET — return single resource (with lazy init):**

```typescript
registerMock({
  method: "GET",
  pathPattern: "/resources/{resourceId}",
  handler: (_req, params) => {
    const data = getOrCreate(params.resourceId);
    return NextResponse.json({ data });
  },
});
```

**GET — return list (from store values):**

```typescript
registerMock({
  method: "GET",
  pathPattern: "/resources",
  handler: () => {
    return NextResponse.json({ data: Object.values(store) });
  },
});
```

**POST — store submitted data:**

POST handlers merge the request body into the store so subsequent GETs reflect the change. The resource is created or updated for the given ID.

```typescript
registerMock({
  method: "POST",
  pathPattern: "/resources/{resourceId}/details",
  handler: async (req, params) => {
    const body = await req.json();
    const entry = getOrCreate(params.resourceId);
    entry.details = body;

    return NextResponse.json({
      data: { id: params.resourceId, ...body },
    });
  },
});
```

**PUT/PATCH — update stored data:**

Same pattern as POST — read body, merge into store, return updated data.

```typescript
registerMock({
  method: "PATCH",
  pathPattern: "/resources/{resourceId}",
  handler: async (req, params) => {
    const body = await req.json();
    const entry = getOrCreate(params.resourceId);
    Object.assign(entry, body, { updatedAt: new Date().toISOString() });

    return NextResponse.json({ data: entry });
  },
});
```

**DELETE — remove from store:**

```typescript
registerMock({
  method: "DELETE",
  pathPattern: "/resources/{resourceId}",
  handler: (_req, params) => {
    delete store[params.resourceId];
    return new NextResponse(null, { status: 200 });
  },
});
```

## Generating Realistic Pre-Seeded Data

- Use **German-language** placeholder text where appropriate (e.g., company names, document titles)
- Use **camelCase** for all field names — the data must match the Zod schema directly without transformation
- Use realistic IDs prefixed with `mock-` for easy identification (e.g., `"mock-contract-1"`)
- Use ISO 8601 date strings for date fields
- **Vary the data across seed entries:**
  - Different enum/status values per entry
  - Some entries with all optional fields filled, others with `null`
  - Different realistic values (names, dates, amounts) — not just incremented copies
- If a Zod schema is available, derive the type and seed data from it

## Updating the Barrel File

After creating a handler file, add its import to `src/shared/backend/mocks/handlers/index.ts`:

```typescript
// Import mock handler files here to register them.
// Each import triggers registerMock() calls.
import "@/features/contracts/mock/contractsMock";
```

The import is side-effect only (no named imports needed) — importing the file triggers the `registerMock()` calls.

## Full Example

File: `src/features/contracts/mock/contractsMock.ts`

```typescript
import { registerMock } from "@/shared/backend/mocks/registry";
import { NextResponse } from "next/server";

type ContractData = {
  id: string;
  financingCaseId: string;
  name: string;
  status: "draft" | "active" | "terminated";
  signedAt: string | null;
  createdAt: string;
};

const store: Record<string, ContractData> = {
  "mock-contract-1": {
    id: "mock-contract-1",
    financingCaseId: "mock-financing-case-1",
    name: "Darlehensvertrag Nr. 12345",
    status: "active",
    signedAt: "2024-02-01T09:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
  },
  "mock-contract-2": {
    id: "mock-contract-2",
    financingCaseId: "mock-financing-case-1",
    name: "Buergschaftsvertrag Nr. 67890",
    status: "draft",
    signedAt: null,
    createdAt: "2024-02-20T14:30:00Z",
  },
  "mock-contract-3": {
    id: "mock-contract-3",
    financingCaseId: "mock-financing-case-2",
    name: "Rahmenvertrag Nr. 11223",
    status: "terminated",
    signedAt: "2023-06-15T11:00:00Z",
    createdAt: "2023-05-10T08:00:00Z",
  },
};

function getOrCreateContract(id: string, financingCaseId: string): ContractData {
  store[id] ??= {
    id,
    financingCaseId,
    name: "Neuer Vertrag",
    status: "draft",
    signedAt: null,
    createdAt: new Date().toISOString(),
  };
  return store[id];
}

// GET — list contracts for a financing case
registerMock({
  method: "GET",
  pathPattern:
    "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts",
  handler: (_req, params) => {
    const contracts = Object.values(store).filter(
      (c) => c.financingCaseId === params.financingCaseId,
    );
    return NextResponse.json({ data: contracts });
  },
});

// GET — single contract
registerMock({
  method: "GET",
  pathPattern:
    "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts/{contractId}",
  handler: (_req, params) => {
    const data = getOrCreateContract(params.contractId, params.financingCaseId);
    return NextResponse.json({ data });
  },
});

// POST — create contract
registerMock({
  method: "POST",
  pathPattern:
    "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts",
  handler: async (req, params) => {
    const body = await req.json();
    const id = `mock-contract-${Date.now()}`;
    store[id] = {
      id,
      financingCaseId: params.financingCaseId,
      ...body,
      status: "draft",
      signedAt: null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: store[id] });
  },
});

// PATCH — update contract
registerMock({
  method: "PATCH",
  pathPattern:
    "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts/{contractId}",
  handler: async (req, params) => {
    const body = await req.json();
    const entry = getOrCreateContract(params.contractId, params.financingCaseId);
    Object.assign(entry, body);

    return NextResponse.json({ data: entry });
  },
});
```

Barrel update in `src/shared/backend/mocks/handlers/index.ts`:

```typescript
import "@/features/contracts/mock/contractsMock";
```

## Rules

1. All response data must be **camelCase** — no snake_case
2. One handler file per feature area — group related routes together
3. Always prefix mock IDs with `mock-` for easy identification
4. Always update the barrel file after creating a new handler
5. Use `_req` (underscore prefix) when the request object is not used
6. **Always use an in-memory store** — POST/PUT/PATCH must persist data so subsequent GETs reflect changes
7. **Pre-seed the store** with 2–3 entries covering different data shapes and states
8. **Support arbitrary IDs** — use lazy initialization in GET handlers so any ID works
