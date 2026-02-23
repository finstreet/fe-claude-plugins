# Action Items Hooks

Only needed for Case 3 (sort + group). Three hooks to implement:

1. `use{ListName}SortByItems.ts`
2. `use{ListName}GroupByItems.ts`
3. `use{ListName}RenderActions.ts`

## 1. useSortByItems

File: `{featurePath}/use{ListName}SortByItems.ts`

Import the `SortByEnum` from the SearchParams file. Always include an empty string entry first (no sorting).

```typescript
import { {ListName}SortByEnum } from './{listName}SearchParams';
import { useTranslations } from 'next-intl';

export function use{ListName}SortByItems() {
  const t = useTranslations('{listName}.actions.sortBy.options');

  return [
    { value: '', label: t('none') },
    { value: {ListName}SortByEnum.CREATED_AT_ASC, label: t('createdAtAsc') },
    { value: {ListName}SortByEnum.CREATED_AT_DESC, label: t('createdAtDesc') },
    { value: {ListName}SortByEnum.STATUS_ASC, label: t('statusAsc') },
    { value: {ListName}SortByEnum.STATUS_DESC, label: t('statusDesc') },
    // all other enum values
  ];
}
```

## 2. useGroupByItems

File: `{featurePath}/use{ListName}GroupByItems.ts`

Import the `GroupByEnum` from the SearchParams file. Always include an empty string entry first (no grouping).

```typescript
import { {ListName}GroupByEnum } from './{listName}SearchParams';
import { useTranslations } from 'next-intl';

export function use{ListName}GroupByItems() {
  const t = useTranslations('{listName}.actions.groupBy.options');

  return [
    { value: '', label: t('none') },
    { value: {ListName}GroupByEnum.STATUS, label: t('status.label') },
    // all other enum values
  ];
}
```

## 3. useRenderActions

File: `{featurePath}/use{ListName}RenderActions.ts`

Stitches together the sort/group hooks using the `useRenderActions` utility. Translation keys come from context.

```typescript
import { useRenderActions } from '@/shared/hooks/useRenderActions';
import { use{ListName}SortByItems } from './use{ListName}SortByItems';
import { use{ListName}GroupByItems } from './use{ListName}GroupByItems';
import { {listName}SearchParams } from './{listName}SearchParams';
import { useTranslations } from 'next-intl';

export function use{ListName}RenderActions() {
  const sortByItems = use{ListName}SortByItems();
  const groupByItems = use{ListName}GroupByItems();
  const t = useTranslations('{listName}');

  return useRenderActions({
    searchParams: {listName}SearchParams,
    groupByItems,
    sortByItems,
    translations: {
      label: t('actions.label'),
      reset: t('actions.reset'),
      search: {
        label: t('actions.search.label'),
        placeholder: t('actions.search.placeholder'),
      },
      groupBy: {
        label: t('actions.groupBy.label'),
      },
      sortBy: {
        label: t('actions.sortBy.label'),
      },
    },
  });
}
```
