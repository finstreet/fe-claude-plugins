# Creating the Request

File: `{requestPath}/get{ListName}List.ts`

Look into `{requestPath}/server.ts` to find the correct paginated fetch function to use.

## Pagination only

```typescript
import { Parsed{ListName}SearchParams } from '@/features/.../{ listName}SearchParams';
import { buildApiUrl } from '@/shared/backend/models/common/buildApiUrl';
import { collectPaginatedData } from '@/shared/backend/models/common/collectPaginatedData';
import { get{ListName} } from '@/shared/backend/models/{model}/server';
import { Constants } from '@/shared/utils/constants';
import { getTranslations } from 'next-intl/server';

export async function get{ListName}List(
  searchParams: Parsed{ListName}SearchParams,
) {
  const { pagination } = searchParams;
  const t = await getTranslations('{listName}.list');
  const currentPage = pagination['{groupKey}'] || '1';

  const apiUrl = buildApiUrl({
    baseUrl: '/path/to/resource',
    searchParams: {},
    additionalParams: {
      page: currentPage,
      limit: Constants.defaultPageSize,
    },
  });

  return collectPaginatedData({
    apiUrl,
    title: t('sectionTitle'),
    groupKey: '{groupKey}',
    apiCall: () => get{ListName}(apiUrl)({}),
  });
}
```

## Pagination + Search

```typescript
export async function get{ListName}List(
  searchParams: Parsed{ListName}SearchParams,
) {
  const { pagination } = searchParams;
  const currentPage = pagination['default'] || '1';
  const t = await getTranslations('{listName}.list');

  const apiUrl = buildApiUrl({
    baseUrl: '/path/to/resource',
    searchParams,                          // ← pass full searchParams (includes search)
    additionalParams: {
      page: currentPage,
      limit: Constants.defaultPageSize,
    },
  });

  return collectPaginatedData({
    apiUrl,
    title: t('title'),
    groupKey: 'default',
    apiCall: () => get{ListName}(apiUrl)({}),
  });
}
```

## Pagination + Search + Sort + Group

NEVER change the structure below. Always initialize `listItems` before the `if-else`.

```typescript
import {
  Parsed{ListName}SearchParams,
  {ListName}GroupByEnum,
} from '@/features/.../{listName}SearchParams';
import { buildApiUrl } from '@/shared/backend/models/common/buildApiUrl';
import { collectGroupedData } from '@/shared/backend/models/common/collectGroupedData';
import { collectPaginatedData } from '@/shared/backend/models/common/collectPaginatedData';
import { {LIST_NAME}_GROUP_CONFIG } from './{listName}GroupConfigs';
import { {ListName}ItemType } from '@/shared/backend/models/{model}/schema';
import { getPaginated{ListName} } from '@/shared/backend/models/{model}/server';
import { ListItems } from '@/shared/types/InteractiveListTypes';
import { Constants } from '@/shared/utils/constants';

export async function get{ListName}List(
  searchParams: Parsed{ListName}SearchParams,
) {
  const { search, pagination, sortBy, groupBy } = searchParams;
  const currentPage = pagination['default'] || '1';
  let listItems: ListItems<{ListName}ItemType> = [];   // ← always initialize before if-else

  if (searchParams.groupBy && searchParams.groupBy in {LIST_NAME}_GROUP_CONFIG) {
    const groupConfig = {LIST_NAME}_GROUP_CONFIG[groupBy as {ListName}GroupByEnum];

    listItems = await collectGroupedData({
      searchParams,
      groupConfig,
      path: '/path/to/resource',
      translationKey: '{listName}.groups',
      apiCall: (apiUrl) => getPaginated{ListName}(apiUrl)({}),
    });
  } else {
    const apiUrl = buildApiUrl({
      baseUrl: '/path/to/resource',
      searchParams: { search, pagination, sortBy, groupBy },
      additionalParams: {
        page: currentPage,
        limit: Constants.defaultPageSize,
      },
    });

    listItems = await collectPaginatedData({
      apiUrl,
      title: '',
      groupKey: 'default',
      apiCall: () => getPaginated{ListName}(apiUrl)({}),
    });
  }

  return listItems;
}
```
