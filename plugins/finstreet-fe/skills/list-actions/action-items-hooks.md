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
import { useExtracted } from 'next-intl';

export function use{ListName}SortByItems() {
  const t = useExtracted();

  return [
    { value: '', label: t('Keine Sortierung') },
    { value: {ListName}SortByEnum.CREATED_AT_ASC, label: t('Erstelldatum aufsteigend') },
    { value: {ListName}SortByEnum.CREATED_AT_DESC, label: t('Erstelldatum absteigend') },
    { value: {ListName}SortByEnum.STATUS_ASC, label: t('Status aufsteigend') },
    { value: {ListName}SortByEnum.STATUS_DESC, label: t('Status absteigend') },
    // all other enum values
  ];
}
```

## 2. useGroupByItems

File: `{featurePath}/use{ListName}GroupByItems.ts`

Import the `GroupByEnum` from the SearchParams file. Always include an empty string entry first (no grouping).

```typescript
import { {ListName}GroupByEnum } from './{listName}SearchParams';
import { useExtracted } from 'next-intl';

export function use{ListName}GroupByItems() {
  const t = useExtracted();

  return [
    { value: '', label: t('Keine Gruppierung') },
    { value: {ListName}GroupByEnum.STATUS, label: t('Status') },
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
import { useExtracted } from 'next-intl';

export function use{ListName}RenderActions() {
  const sortByItems = use{ListName}SortByItems();
  const groupByItems = use{ListName}GroupByItems();
  const t = useExtracted();

  return useRenderActions({
    searchParams: {listName}SearchParams,
    groupByItems,
    sortByItems,
    translations: {
      label: t('Aktionen'),
      reset: t('Zurücksetzen'),
      search: {
        label: t('Suche'),
        placeholder: t('{German search placeholder}'),
      },
      groupBy: {
        label: t('Gruppieren nach'),
      },
      sortBy: {
        label: t('Sortieren nach'),
      },
    },
  });
}
```
