---
name: mock-api
description: "Create mock API endpoints that plug into the @finstreet/secure-fetch pattern. Use when the backend endpoint is not ready and you need to unblock frontend work."
---

# Mock API Route — Complete Guide

Mock API routes let the frontend work against realistic data before the backend is ready. They plug into the same `server.ts`/`client.ts` pattern as real endpoints — swapping to the real backend later is a one-line import change.

## Architecture

```
server.ts / client.ts
  │
  ├── Mock:  createMockServerFetchFunction(config)  → /api/mock/... → mock registry
  └── Real:  createServerFetchFunction(config)       → /api/proxy/... → Rails backend
```

The `EndpointConfig` is identical for mock and real. Only the import changes.

## Infrastructure Files (one-time setup)

Before generating a mock handler, check if these files exist in the bfw project. If any are missing, create them:

| File | Purpose |
|------|---------|
| `src/shared/backend/mocks/registry.ts` | Route registration and path-pattern matching |
| `src/shared/backend/mocks/handlers/index.ts` | Barrel file that imports all mock handlers |
| `src/app/api/mock/[...all]/route.ts` | Next.js catch-all route that dispatches to registered mocks |
| `src/shared/backend/createMockServerFetchFunction.ts` | Server-side mock fetch (bypasses HMAC/JWT) |
| `src/shared/backend/createMockClientFetchFunction.ts` | Client-side mock fetch |

If these files already exist, do NOT recreate or modify them.

## Task Approach

1. **Check infrastructure** — verify the files above exist in the bfw project
2. **Gather input** — route path, HTTP method(s), response field descriptions or Zod schema reference
3. **Generate mock handler** — see [mock-handler.md](mock-handler.md)
4. **Update barrel** — add the import to `src/shared/backend/mocks/handlers/index.ts`

## Using in server.ts

```typescript
// schema.ts stays IDENTICAL — same Zod schemas as the real endpoint
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createMockServerFetchFunction } from "@/shared/backend/createMockServerFetchFunction";
import { ContractsResultSchema, ContractsPathVariablesSchema } from "./schema";

const getContractsConfig = {
  protected: true,
  method: "GET",
  path: "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts",
  resultSchema: ContractsResultSchema,
  pathVariablesSchema: ContractsPathVariablesSchema,
} satisfies EndpointConfig;

export const ContractsService = {
  getContracts: createMockServerFetchFunction(getContractsConfig),
};
```

## Using in client.ts

```typescript
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createMockClientFetchFunction } from "@/shared/backend/createMockClientFetchFunction";
import { ContractsResultSchema, ContractsPathVariablesSchema } from "./schema";

const getContractsConfig = {
  protected: true,
  method: "GET",
  path: "/financial_service_providers/financing_cases/{product}/{financingCaseId}/contracts",
  resultSchema: ContractsResultSchema,
  pathVariablesSchema: ContractsPathVariablesSchema,
} satisfies EndpointConfig;

export const ContractsClientService = {
  getContracts: createMockClientFetchFunction(getContractsConfig),
};
```

## Swapping to Real Backend

When the backend endpoint is ready, change the import in `server.ts` or `client.ts`:

```diff
- import { createMockServerFetchFunction } from "@/shared/backend/createMockServerFetchFunction";
+ import { createServerFetchFunction } from "@/shared/backend/createServerFetchFunction";

  export const ContractsService = {
-   getContracts: createMockServerFetchFunction(getContractsConfig),
+   getContracts: createServerFetchFunction(getContractsConfig),
  };
```

Then optionally clean up: remove the mock handler file and its import from the barrel.

## Step-by-Step Reference

- For **generating mock handlers** (registerMock calls, realistic data, barrel updates), see [mock-handler.md](mock-handler.md)

## Rules

1. Mock data must be **camelCase** — it matches Zod schemas directly, no snake_case transformation
2. ALWAYS check if infrastructure files exist before creating them
3. ALWAYS update the barrel file when adding a new mock handler
4. One handler file per feature area (e.g., `contracts.ts`, `documents.ts`)
5. Use `{param}` syntax in path patterns to match path variables
6. Do NOT run any `tsc` or `pnpm` commands after implementation
