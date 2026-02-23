# Building Schemas

File: `{featurePath}/schema.ts`

All schemas and their inferred types live here. Check the existing file before adding new ones — reuse schemas where possible.

## 1. PathVariablesSchema

Required when the request URL contains dynamic segments (e.g. `{financing_case_id}`).

Name the schema after the operation it belongs to. ALWAYS use camelCase for keys (never snake_case).

```typescript
// Path: /financing_cases/{financing_case_id}/archive
export const ArchiveFinancingCasePathVariablesSchema = z.object({
  financingCaseId: z.string(),
});
export type ArchiveFinancingCasePathVariables = z.infer<typeof ArchiveFinancingCasePathVariablesSchema>;
```

## 2. ResultSchema (GET requests only)

Only implement for GET requests (or when explicitly told otherwise). Map the Swagger `data` property's children — ignore the outer `data` wrapper, the abstraction handles it.

Mark optional/nullable fields accordingly. Use descriptive singular/plural names:
- single object → `ContractSchema` / `Contract`
- array → `ContractsSchema` / `Contracts`

```yaml
# Swagger example
properties:
  data:
    type: object
    required: [id, byte_size]
    properties:
      id: { type: string }
      byte_size: { type: integer }
      content_type: { type: string }   # not required → optional
```

```typescript
export const ContractSchema = z.object({
  id: z.string(),
  byteSize: z.number(),
  contentType: z.string().optional(),
});
export type Contract = z.infer<typeof ContractSchema>;
```

## 3. PayloadSchema (non-GET requests)

Same approach as ResultSchema but for the request body. NEVER use enums — use plain strings instead (selects/radio groups prevent invalid values at the UI level).

```typescript
export const UpdatePropertyManagementDetailsPayloadSchema = z.object({
  name: z.string(),
  street: z.string(),
  status: z.string(), // ← enum in API, plain string here
});
export type UpdatePropertyManagementDetailsPayload = z.infer<typeof UpdatePropertyManagementDetailsPayloadSchema>;
```

## 4. Paginated Schema

For paginated GET requests, build the item schema normally then wrap it with `MetaSchema`. Import `MetaSchema` from wherever it lives in the project.

```typescript
export const FinancingCaseSchema = z.object({
  id: z.string(),
  // ...
});
export type FinancingCase = z.infer<typeof FinancingCaseSchema>;

export const FinancingCasesSchema = z.array(FinancingCaseSchema);
export type FinancingCases = z.infer<typeof FinancingCasesSchema>;

export const FinancingCasesPaginatedSchema = z.object({
  response: FinancingCasesSchema,
  meta: MetaSchema,
});
export type FinancingCasesPaginated = z.infer<typeof FinancingCasesPaginatedSchema>;
```

## Rules

- ALWAYS convert `snake_case` keys to `camelCase`
- Never ignore validation that maps to type correctness (required vs optional)
- Ignore Swagger validation constraints (min/max, patterns) — only the type matters
- Never use Zod enums in payload schemas — always `z.string()`
- Use descriptive names, not generic ones like `GetContractsResponseSchema`
