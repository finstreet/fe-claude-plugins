# Multi-List Shared Search

When two or more lists on the same page share a single search input with independent pagination. Each list has its own request function, container, and presentation — but they all read from the same SearchParams.

## When to Use

- A page displays 2+ `InteractiveList` components
- The lists share a search input (typing filters all lists)
- Each list paginates independently

## Shared vs. Independent Params

| Param | Scope | Why |
|-------|-------|-----|
| `search` | Shared — one key, applied to all lists | Single search input filters all lists |
| `pagination` | Multi-key — one key per list | Each list paginates independently |
| `sortBy` / `groupBy` | Per-list (if needed) | Sorting/grouping is list-specific |

## Directory Structure

```
{featurePath}/
  ├── {listName}SearchParams.ts           ← single file, shared by all lists
  ├── {ListName}SearchAction.tsx          ← standalone search component
  ├── {ListNameA}/
  │   └── {ListNameA}Presentation.tsx     ← presentation (client component)
  ├── {ListNameB}/
  │   └── {ListNameB}Presentation.tsx     ← presentation (client component)

{requestPath}/
  ├── get{ListNameA}.ts                   ← request for list A
  └── get{ListNameB}.ts                   ← request for list B

No per-list `index.tsx` server containers — see § 5 (Page Composition) below.
```

## Step-by-Step

### 1. SearchParams

Define a typed union for pagination keys. One key per list.

```typescript
import { createBase64Parser } from '@/shared/utils/paramsBase64Parser';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';

type {ListName}Type = '{listKeyA}' | '{listKeyB}';

export const {listName}SearchParams = {
    search: parseAsString.withDefault(''),
    pagination: createBase64Parser<Record<{ListName}Type, string>>().withDefault({
        {listKeyA}: '1',
        {listKeyB}: '1',
    }),
};

export const {listName}SearchParamsCache = createSearchParamsCache({listName}SearchParams);

export type Parsed{ListName}SearchParams = Awaited<
    ReturnType<typeof {listName}SearchParamsCache.parse>
>;
```

### 2. Request Functions (one per list)

Each function reads its own pagination key. Both receive the full `searchParams` (which includes the shared `search`).

**List A — `get{ListNameA}.ts`:**

```typescript
import { Parsed{ListName}SearchParams } from '@/features/.../{listName}SearchParams';
import { buildApiUrl } from '@/shared/backend/models/common/buildApiUrl';
import { collectPaginatedData } from '@/shared/backend/models/common/collectPaginatedData';
import { get{ListNameA} } from '@/shared/backend/models/{model}/server';
import { Constants } from '@/shared/utils/constants';
import { getExtracted } from 'next-intl/server';

export async function get{ListNameA}(
    searchParams: Parsed{ListName}SearchParams,
) {
    const { pagination } = searchParams;
    const t = await getExtracted();
    const currentPage = pagination['{listKeyA}'] || '1';

    const apiUrl = buildApiUrl({
        baseUrl: '/path/to/resource-a',
        searchParams,
        additionalParams: {
            page: currentPage,
            limit: Constants.defaultPageSize,
        },
    });

    return collectPaginatedData({
        apiUrl,
        title: t('{German section title A}'),
        groupKey: '{listKeyA}',
        apiCall: () => get{ListNameA}(apiUrl)({}),
    });
}
```

**List B — `get{ListNameB}.ts`:** Same structure, but uses `pagination['{listKeyB}']` and `groupKey: '{listKeyB}'`.

### 3. SearchAction Component

A standalone client component — NOT a hook. It manages both `search` and `pagination` via `useQueryState`. Setting `pagination` to `null` resets ALL lists to page 1.

```typescript
'use client';

import { Box, HStack } from '@/styled-system/jsx';
import { Input } from '@finstreet/ui/components/base/Form/Input';
import { Typography } from '@finstreet/ui/components/base/Typography';
import { {listName}SearchParams } from './{listName}SearchParams';
import { useQueryState } from 'nuqs';
import { useExtracted } from 'next-intl';
import { ChangeEvent } from 'react';

export const {ListName}SearchAction = () => {
    const t = useExtracted();
    const [search, setSearch] = useQueryState(
        'search',
        {listName}SearchParams.search.withOptions({
            shallow: false,
            throttleMs: 800,
        }),
    );

    const [_pagination, setPagination] = useQueryState(
        'pagination',
        {listName}SearchParams.pagination.withOptions({
            shallow: false,
            throttleMs: 500,
        }),
    );

    return (
        <HStack gap={8}>
            <Box paddingLeft={4}>
                <Typography>{t('{search label key}')}</Typography>
            </Box>
            <Box flexGrow={1}>
                <Input
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setSearch(e.target.value || null);
                        setPagination(null);
                    }}
                    value={search || ''}
                    placeholder={t('{search placeholder key}')}
                    onClear={() => {
                        setSearch('');
                        setPagination(null);
                    }}
                />
            </Box>
        </HStack>
    );
};
```

### 4. Presentation Components

Both presentation components handle pagination manually with `useQueryState`. Only the **first** list renders `renderActions`.

**First list (renders search action):**

```typescript
'use client';

import { useQueryState } from 'nuqs';
import { {listName}SearchParams } from '../{listName}SearchParams';
import { {ListName}SearchAction } from '../{ListName}SearchAction';
// ... other imports

export const {ListNameA}Presentation = ({ data }: {ListNameA}PresentationProps) => {
    const [pagination, setPagination] = useQueryState(
        'pagination',
        {listName}SearchParams.pagination.withOptions({
            shallow: false,
            throttleMs: 500,
        }),
    );

    const onPageChange = (groupKey: string, pageNumber: number) => {
        setPagination({ ...pagination, [groupKey]: pageNumber.toString() });
    };

    const paginatedData = data.map((element) => ({
        title: element.title,
        items: element.items,
        pagination: {
            ...element.pagination,
            onPageChange: (page: number) => onPageChange(element.groupKey, page),
        },
    }));

    return (
        <InteractiveList<{ListNameA}Type>
            data={paginatedData}
            renderActions={{ListName}SearchAction}    // ← only on FIRST list
            renderItem={renderItem}
            renderNoItems={renderNoItems}
            itemKey={'id'}
            pageSize={parseInt(Constants.defaultPageSize)}
        />
    );
};
```

**Second list (NO `renderActions`):**

Same pagination setup, but omit the `renderActions` prop. The shared URL state means the search input on the first list already filters this list too.

```typescript
return (
    <InteractiveList<{ListNameB}Type>
        data={paginatedData}
        // NO renderActions — search is handled by the first list's SearchAction
        renderItem={renderItem}
        renderNoItems={renderNoItems}
        itemKey={'id'}
        pageSize={parseInt(Constants.defaultPageSize)}
    />
);
```

### 5. Page Composition

Parse SearchParams once. Run all request functions in parallel via `Promise.all`. Pass the resulting data straight to each Presentation component. **No per-list server containers, no `<Suspense>` wrappers** — the page does the fetches itself.

```typescript
import { {listName}SearchParamsCache } from '@/features/.../{listName}SearchParams';
import { {ListNameA}Presentation } from '@/features/.../{ListNameA}/{ListNameA}Presentation';
import { {ListNameB}Presentation } from '@/features/.../{ListNameB}/{ListNameB}Presentation';
import { get{ListNameA} } from '@/features/.../backend/get{ListNameA}';
import { get{ListNameB} } from '@/features/.../backend/get{ListNameB}';
import { SearchParams } from 'nuqs';

type {PageName}Props = {
    searchParams: Promise<SearchParams>;
};

export default async function {PageName}({ searchParams }: {PageName}Props) {
    const resolvedSearchParams = await searchParams;
    const { pagination, search } = {listName}SearchParamsCache.parse(resolvedSearchParams);

    const [dataA, dataB] = await Promise.all([
        get{ListNameA}({ pagination, search }),
        get{ListNameB}({ pagination, search }),
    ]);

    return (
        <>
            <{ListNameA}Presentation data={dataA} />
            <{ListNameB}Presentation data={dataB} />
        </>
    );
}
```

The `Promise.all` runs both fetches concurrently — equivalent to the parallelism a `<Suspense>` boundary would give, but without the streaming wrapper. Why this shape: per-list server containers add ceremony without changing the user-visible behavior on multi-list pages, and `<Suspense>` boundaries here add streaming where it isn't useful (both lists land at the same time anyway).

## Rules

1. One SearchParams file per feature — never per list
2. Use a typed union for pagination keys — not `Record<string, string>`
3. `setPagination(null)` to reset all lists on search change — never reset individual keys
4. Only the first list renders `renderActions` — additional lists omit it
5. No per-list server containers and no `<Suspense>` wrappers — the page parses, fetches via `Promise.all`, and renders Presentations directly
5. Each list gets its own container, request function, and presentation component
