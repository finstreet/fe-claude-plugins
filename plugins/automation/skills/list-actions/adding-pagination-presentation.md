# Adding Pagination to the Presentation Component

File: `{featurePath}/{ListName}PresentationList.tsx`

Update the existing presentation component — remove dummy data/types, add real types, add pagination.

## Step 1 — Update Types

Check `{requestPath}/schema.ts` for the item type and array type (singular and plural). Update the component props:

```typescript
import { ListItems } from '@/shared/types/InteractiveListTypes';
import { {ListName}Type, {ListName}sType } from '@/shared/backend/models/{model}/schema';

type {ListName}PresentationListProps = {
  data: ListItems<{ListName}sType>;    // ← always the plural (array) type wrapped in ListItems
};
```

The `renderItem` / `renderSmallScreenItem` callbacks use the singular item type:

```typescript
const renderItem = (item: {ListName}Type) => ( /* ... */ );
```

## Step 2 — Add Pagination (all cases)

```typescript
import { usePagination } from '@/shared/hooks/usePagination';
import { {listName}SearchParams } from './{listName}SearchParams';

// inside the component:
const paginated{ListName}s = usePagination({
  parserBuilder: {listName}SearchParams.pagination,
  listItems: data,
});

return (
  <InteractiveList<{ListName}Type>
    data={paginated{ListName}s}
    renderItem={renderItem}
    renderNoItems={renderNoItems}
    itemKey={'id'}
    // other existing props...
  />
);
```

## Step 3 — Add Search (Case 2)

```typescript
import { useRenderSearchAction } from '@/shared/hooks/useRenderSearchAction';
import { {listName}SearchParams } from './{listName}SearchParams';

// inside the component:
const renderActions = useRenderSearchAction({
  searchParams: {listName}SearchParams,
  translations: {
    label: tActions('label'),
    reset: tActions('reset'),
    search: {
      label: tActions('search.label'),
      placeholder: tActions('search.placeholder'),
    },
  },
});

return (
  <InteractiveList<{ListName}Type>
    data={paginated{ListName}s}
    renderActions={renderActions}
    // other props...
  />
);
```

## Step 4 — Add Sort + Group (Case 3)

```typescript
import { use{ListName}RenderActions } from './use{ListName}RenderActions';

// inside the component:
const renderActions = use{ListName}RenderActions();

return (
  <InteractiveList<{ListName}Type>
    data={paginated{ListName}s}
    renderActions={renderActions}
    // other props...
  />
);
```

## Rules

- For any TypeScript errors from changed types, use values that fit the new type and context — cleanup happens separately
- Always use the plural schema type for `ListItems<>` and the singular type for item callbacks
- `usePagination` is always required regardless of case
