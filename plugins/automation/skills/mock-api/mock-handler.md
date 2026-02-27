# Mock Handler — Generation Guide

Mock handlers are TypeScript files that register routes with the mock registry. Each file covers one feature area and can contain multiple `registerMock()` calls.

## File Location

```
src/shared/backend/mocks/handlers/{feature}.ts
```

Name the file after the feature area (e.g., `contracts.ts`, `documents.ts`, `users.ts`).

## Template

```typescript
import { registerMock } from "../registry";
import { NextResponse } from "next/server";

registerMock({
  method: "{METHOD}",
  pathPattern: "{path}",
  handler: (req, params) => {
    return NextResponse.json({/* response data */});
  },
});
```

## Writing the registerMock Call

### Imports

Always import `registerMock` from `"../registry"` and `NextResponse` from `"next/server"`.

### Path Pattern

Use the same path as the `EndpointConfig.path` — including `{param}` placeholders:

```typescript
pathPattern: "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts",
```

### Handler Arguments

- `req` — the `NextRequest` object. Use it to read query params (`req.nextUrl.searchParams`) or request body (`await req.json()`)
- `params` — extracted path variables as `Record<string, string>`. Keys match the `{param}` names in the path pattern

### Method Patterns

**GET — return data:**

```typescript
registerMock({
  method: "GET",
  pathPattern: "/resources/{resourceId}",
  handler: (_req, params) => {
    return NextResponse.json({
      id: params.resourceId,
      name: "Beispiel Ressource",
      status: "active",
      createdAt: "2024-01-15T10:00:00Z",
    });
  },
});
```

**GET — return list:**

```typescript
registerMock({
  method: "GET",
  pathPattern: "/resources",
  handler: () => {
    return NextResponse.json([
      {
        id: "mock-1",
        name: "Erste Ressource",
        status: "active",
      },
      {
        id: "mock-2",
        name: "Zweite Ressource",
        status: "pending",
      },
    ]);
  },
});
```

**POST — return created object:**

```typescript
registerMock({
  method: "POST",
  pathPattern: "/resources",
  handler: async (req) => {
    const body = await req.json();
    return NextResponse.json({
      id: "mock-new-resource",
      ...body,
      status: "created",
      createdAt: new Date().toISOString(),
    });
  },
});
```

**PATCH/PUT — return updated object:**

```typescript
registerMock({
  method: "PATCH",
  pathPattern: "/resources/{resourceId}",
  handler: async (req, params) => {
    const body = await req.json();
    return NextResponse.json({
      id: params.resourceId,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  },
});
```

**DELETE — return empty success:**

```typescript
registerMock({
  method: "DELETE",
  pathPattern: "/resources/{resourceId}",
  handler: () => {
    return new NextResponse(null, { status: 200 });
  },
});
```

## Generating Realistic Data

- Use **German-language** placeholder text where appropriate (e.g., company names, document titles)
- Use **camelCase** for all field names — the data must match the Zod schema directly without transformation
- Use realistic IDs (`"mock-contract-1"`, `"mock-doc-abc"`) prefixed with `mock-` for easy identification
- Use ISO 8601 date strings for date fields
- Spread path params into the response where they appear in the schema (e.g., `financingCaseId: params.financingCaseId`)
- If field descriptions are provided, generate values that match those descriptions

## Updating the Barrel File

After creating a handler file, add its import to `src/shared/backend/mocks/handlers/index.ts`:

```typescript
// Import mock handler files here to register them.
// Each import triggers registerMock() calls.
import "./contracts";
```

The import is side-effect only (no named imports needed) — importing the file triggers the `registerMock()` calls.

## Full Example

File: `src/shared/backend/mocks/handlers/contracts.ts`

```typescript
import { registerMock } from "../registry";
import { NextResponse } from "next/server";

registerMock({
  method: "GET",
  pathPattern:
    "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts",
  handler: (_req, params) => {
    return NextResponse.json([
      {
        id: "mock-contract-1",
        financingCaseId: params.financingCaseId,
        name: "Darlehensvertrag Nr. 12345",
        status: "active",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "mock-contract-2",
        financingCaseId: params.financingCaseId,
        name: "Buergschaftsvertrag Nr. 67890",
        status: "pending",
        createdAt: "2024-02-20T14:30:00Z",
      },
    ]);
  },
});

registerMock({
  method: "POST",
  pathPattern:
    "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts",
  handler: () => {
    return NextResponse.json({
      id: "mock-contract-new",
      status: "created",
    });
  },
});
```

Barrel update in `src/shared/backend/mocks/handlers/index.ts`:

```typescript
import "./contracts";
```

## Rules

1. All response data must be **camelCase** — no snake_case
2. One handler file per feature area — group related routes together
3. Always prefix mock IDs with `mock-` for easy identification
4. Always update the barrel file after creating a new handler
5. Use `_req` (underscore prefix) when the request object is not used
