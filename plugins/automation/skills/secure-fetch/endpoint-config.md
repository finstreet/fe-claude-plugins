# Building Endpoint Configs

Files: `{featurePath}/server.ts` or `{featurePath}/client.ts`

## Standard Endpoint Config

```typescript
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createServerFetchFunction } from "@/shared/backend/createServerFetchFunction";
import { SomeResultSchema } from "./schema";
import { SomePayloadSchema } from "./schema";
import { SomePathVariablesSchema } from "./schema";

const getSomethingConfig = {
  protected: true,
  method: "GET",
  path: "/some-resource/{resourceId}",       // ← camelCase dynamic segments
  resultSchema: SomeResultSchema,            // ← GET only
  pathVariablesSchema: SomePathVariablesSchema,
} satisfies EndpointConfig;

const updateSomethingConfig = {
  protected: true,
  method: "POST",
  path: "/some-resource/{resourceId}",
  payloadSchema: SomePayloadSchema,
  pathVariablesSchema: SomePathVariablesSchema,
} satisfies EndpointConfig;
```

**Path conversion:** strip the `/api/internal/` prefix and convert dynamic segments to camelCase:
- `/api/internal/financial_service_providers/{financial_service_provider_id}/memberships`
- → `/financial_service_providers/{financialServiceProviderId}/memberships`

## Service Export

All configs are wrapped in a named `Service` constant. The service name comes from context.

```typescript
// server.ts
import { createServerFetchFunction } from "@/shared/backend/createServerFetchFunction";

export const FinancingCaseService = {
  getSomething: createServerFetchFunction(getSomethingConfig),
  updateSomething: createServerFetchFunction(updateSomethingConfig),
};

// client.ts  (only for polling / dynamic client-side requests)
import { createClientFetchFunction } from "@/shared/backend/createClientFetchFunction";

export const FinancingCaseClientService = {
  getSomething: createClientFetchFunction(getSomethingConfig),
};
```

## Paginated Endpoint Config

For paginated requests the config is a function accepting the dynamic `path` (which will include query params for page/filter/sort). Do NOT hardcode query params or build a query params schema.

```typescript
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createPaginatedServerFetchFunction } from "@/shared/backend/createServerFetchFunction";
import { FinancingCasesPaginatedSchema } from "./schema";

const getFinancingCasesConfig = (path: string) =>
  ({
    protected: true,
    method: "GET",
    path,
    resultSchema: FinancingCasesPaginatedSchema,
  }) satisfies EndpointConfig;

export const getPaginatedFinancingCases = (path: string) =>
  createPaginatedServerFetchFunction(getFinancingCasesConfig(path));
```

Paginated functions are exported directly (not bundled into a Service object) because the path is passed at call time.

## Rules

- `protected: true` always, unless explicitly stated otherwise
- Only include `resultSchema` for GET requests
- Only include `payloadSchema` for non-GET requests
- Only include `pathVariablesSchema` when the path has dynamic segments
- Never include query params in the config
- Use `satisfies EndpointConfig` (not `as EndpointConfig`)
- Do NOT run `tsc` or `pnpm` commands after creating files
