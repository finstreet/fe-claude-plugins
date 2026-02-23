---
name: secure-fetch
description: "Complete guide to creating or updating type-safe server/client HTTP requests using the @finstreet/secure-fetch library. Use whenever creating or modifying backend requests."
---

# @finstreet/secure-fetch — Complete Guide

The `@finstreet/secure-fetch` library provides a fully type-safe approach to backend requests using Zod for schema validation of payloads, path variables, and responses.

## File Structure

Every feature's backend integration lives in exactly three files:

```
{featurePath}/
  ├── schema.ts    ← all Zod schemas and exported types
  ├── server.ts    ← server-side request functions (default)
  └── client.ts    ← client-side request functions (only when needed)
```

NEVER create additional files or directories. If these files already exist, update them.

## Task Approach

1. Fetch the Swagger documentation for the endpoint (repo: `eco-scale-bfw`, path from context)
2. Check the existing `schema.ts` for reusable schemas
3. Build the required schemas in `schema.ts`
4. Build the endpoint config and service export in `server.ts` or `client.ts`

## Key Imports

```typescript
// schema.ts
import * as z from "@/lib/zod"; // or from "zod"

// server.ts
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createServerFetchFunction } from "@/shared/backend/createServerFetchFunction";
import { createPaginatedServerFetchFunction } from "@/shared/backend/createServerFetchFunction";

// client.ts
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createClientFetchFunction } from "@/shared/backend/createClientFetchFunction";
```

## Step-by-Step Reference

- For **building schemas** (pathVariables, result, payload, paginated), see [schema.md](schema.md)
- For **building endpoint configs** and service exports (server/client, paginated), see [endpoint-config.md](endpoint-config.md)

## Rules

1. ALWAYS use `eco-scale-bfw` as the repo when fetching Swagger docs
2. ALWAYS convert `snake_case` to `camelCase` in schemas AND in path templates
3. `protected: true` unless explicitly told otherwise
4. Only add a `resultSchema` for GET requests (or if explicitly required)
5. Only add a `payloadSchema` for non-GET requests
6. Use `server.ts` by default; only use `client.ts` for polling or dynamic client-side requests
7. Do NOT run any `tsc` or `pnpm` commands after implementation
