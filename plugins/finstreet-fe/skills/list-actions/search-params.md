# Search Params Scaffold

The `{listName}SearchParams.ts` file is the single source of truth for URL state on a list. URL-based state is managed via `nuqs`. One file per feature (not per list — multiple lists on a page share params).

This file covers only the **scaffold** (the cache, the parsed type, pagination, the multi-list pagination union). For the parser of any specific action, see that action's section in [actions.md](actions.md):

| Action | See |
|--------|-----|
| Search | [actions.md § Search](actions.md#search) |
| Sort | [actions.md § Sort](actions.md#sort) |
| Group | [actions.md § Group](actions.md#group) |
| Archived | [actions.md § Archived](actions.md#archived) |

## File structure

`{featurePath}/{listName}SearchParams.ts`

Always export:
- The parser config object (`{listName}SearchParams`)
- The cache built from it (`{listName}SearchParamsCache`)
- The parsed type derived from the cache (`Parsed{ListName}SearchParams`)

```ts
import { createSearchParamsCache } from "nuqs/server";

export const {listName}SearchParams = {
  // pagination + each action's parser, see actions.md
};

export const {listName}SearchParamsCache = createSearchParamsCache(
  {listName}SearchParams,
);

export type Parsed{ListName}SearchParams = Awaited<
  ReturnType<typeof {listName}SearchParamsCache.parse>
>;
```

## Pagination (always required)

Every list has pagination. The parser is a base64-encoded JSON object so multi-list pages can store one page number per list under typed keys.

```ts
import { createBase64Parser } from "@/shared/utils/paramsBase64Parser";

export const {listName}SearchParams = {
  pagination: createBase64Parser<Record<string, string>>().withDefault({}),
};
```

The shape is `Record<groupKey, pageNumber>`. For a single list, the convention is the literal key `'default'` (which the request reads as `pagination['default'] || '1'`).

### Multi-list pagination (typed union)

When two+ lists share SearchParams, replace `Record<string, string>` with a typed union of literal keys — one per list — so the type system enforces matching pagination keys across the request, the SearchAction, and the presentation.

```ts
type {ListName}Type = "{listKeyA}" | "{listKeyB}";

export const {listName}SearchParams = {
  search: parseAsString.withDefault(""),
  pagination: createBase64Parser<Record<{ListName}Type, string>>().withDefault({
    {listKeyA}: "1",
    {listKeyB}: "1",
  }),
};
```

For the full multi-list pattern, see [multi-list-shared-search.md](multi-list-shared-search.md).

## Combined example

Single list with all five actions wired up:

```ts
import { createBase64Parser } from "@/shared/utils/paramsBase64Parser";
import {
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export enum {ListName}SortByEnum {
  CREATED_AT_ASC = "created_at asc",
  CREATED_AT_DESC = "created_at desc",
  // ...
}

export enum {ListName}GroupByEnum {
  NONE = "none",
  STATUS = "status",
  // ...
}

export enum {ListName}GroupByStatusEnum {
  UNMAPPED = "unmapped",
  ACTIVE_CONTRACT = "active_contract",
  ARCHIVED = "archived",
  // ...
}

export const {listName}SearchParams = {
  pagination: createBase64Parser<Record<string, string>>().withDefault({}),
  search: parseAsString.withDefault(""),
  sortBy: parseAsStringEnum<{ListName}SortByEnum>(Object.values({ListName}SortByEnum)),
  groupBy: parseAsStringEnum<{ListName}GroupByEnum>(Object.values({ListName}GroupByEnum)),
  archived: parseAsBoolean.withDefault(false),
};

export const {listName}SearchParamsCache = createSearchParamsCache({listName}SearchParams);
export type Parsed{ListName}SearchParams = Awaited<
  ReturnType<typeof {listName}SearchParamsCache.parse>
>;
```

Only declare the parsers for actions the list actually uses — don't add `archived` parser if there's no archived toggle, etc.

## Rules

- One SearchParams file per feature, even when multiple lists share it.
- Always export the cache and the parsed type — the request and the page rely on the cache.
- Use `nuqs` parsers (`parseAsString`, `parseAsStringEnum`, `parseAsBoolean`, `createBase64Parser`). No client-side state for any of this.
- Don't build query param schemas in the endpoint config — the parser config is the source of truth.
