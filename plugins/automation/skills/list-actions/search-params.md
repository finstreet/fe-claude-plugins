# Search Params

File: `{featurePath}/{listName}SearchParams.ts`

URL-based state via `nuqs`. One file per feature (not per list). Always export the cache and its parsed type.

## Required Exports (always)

```typescript
import { createSearchParamsCache } from "nuqs/server";

export const {listName}SearchParamsCache = createSearchParamsCache(
  {listName}SearchParams,
);

export type Parsed{ListName}SearchParams = Awaited<
  ReturnType<typeof {listName}SearchParamsCache.parse>
>;
```

## Pagination

```typescript
import { createBase64Parser } from '@/shared/utils/paramsBase64Parser';

export const {listName}SearchParams = {
  pagination: createBase64Parser<Record<string, string>>().withDefault({}),
};
```

Multiple lists with separate pagination keys:

```typescript
export const {listName}SearchParams = {
  pagination: createBase64Parser<Record<string, string>>().withDefault({
    members: '1',
    invitedMembers: '1',
  }),
};
```

## Search

```typescript
import { parseAsString } from "nuqs/server";

export const {listName}SearchParams = {
  search: parseAsString.withDefault(""),
};
```

## Sorting

Only add when explicitly requested. Check the Swagger `sort` enum for values.

```typescript
import { parseAsStringEnum } from "nuqs/server";

export enum {ListName}SortByEnum {
  SUBMITTED_AT_ASC = 'submitted_at asc',
  SUBMITTED_AT_DESC = 'submitted_at desc',
  STATUS_ASC = 'status asc',
  STATUS_DESC = 'status desc',
}

export const {listName}SearchParams = {
  sortBy: parseAsStringEnum<{ListName}SortByEnum>(Object.values({ListName}SortByEnum)),
};
```

## Grouping

Only add when explicitly requested. Use Swagger filter params (exclude `sort` and `search_term`). For enum types use their values; for booleans use `'true'` / `'false'` strings.

```typescript
import { parseAsStringEnum } from "nuqs/server";

export enum {ListName}GroupByEnum {
  STATUS = 'status',
  HOA_ALREADY_CUSTOMER = 'hoa_already_customer',
}

export enum {ListName}GroupByStatusEnum {
  UNMAPPED = 'unmapped',
  INCOMPLETE = 'incomplete',
  ACTIVE_CONTRACT = 'active_contract',
  ARCHIVED = 'archived',
}

export enum {ListName}GroupByHoaAlreadyCustomerEnum {
  TRUE = 'true',
  FALSE = 'false',
}

export const {listName}SearchParams = {
  groupBy: parseAsStringEnum<{ListName}GroupByEnum>(Object.values({ListName}GroupByEnum)),
};
```

## Combined Example (all features)

```typescript
import { createBase64Parser } from '@/shared/utils/paramsBase64Parser';
import { parseAsString, parseAsStringEnum, createSearchParamsCache } from "nuqs/server";

export enum FinancingCasesSortByEnum { /* ... */ }
export enum FinancingCasesGroupByEnum { /* ... */ }
export enum FinancingCasesGroupByStatusEnum { /* ... */ }

export const financingCasesSearchParams = {
  pagination: createBase64Parser<Record<string, string>>().withDefault({}),
  search: parseAsString.withDefault(""),
  sortBy: parseAsStringEnum<FinancingCasesSortByEnum>(Object.values(FinancingCasesSortByEnum)),
  groupBy: parseAsStringEnum<FinancingCasesGroupByEnum>(Object.values(FinancingCasesGroupByEnum)),
};

export const financingCasesSearchParamsCache = createSearchParamsCache(financingCasesSearchParams);
export type ParsedFinancingCasesSearchParams = Awaited<ReturnType<typeof financingCasesSearchParamsCache.parse>>;
```
