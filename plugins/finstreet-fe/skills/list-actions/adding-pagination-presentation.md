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

## Step 2 — Add Pagination

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

## Step 3 — Add Actions

When the list has any actions beyond pagination, create a `use{ListName}RenderActions` hook (see [actions.md](actions.md)) and pass its result as `renderActions`.

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

The wiring is the same regardless of which actions the list uses — search only, search + sort + group, with or without archived. Which slots are rendered lives entirely inside `use{ListName}RenderActions`, not here.

## Step 3b — Multi-List Search Action

When two+ lists share a search input, do NOT use `useListActions`. Instead, create a standalone `{ListName}SearchAction` component that uses `useQueryState` for both `search` and `pagination`, and resets pagination to `null` on search change. Only the **first** list passes `renderActions={{ListName}SearchAction}` — additional lists omit the prop entirely, since the search modifies the shared URL state which triggers re-renders for all lists.

See [multi-list-shared-search.md](multi-list-shared-search.md) for the full pattern and templates.

## Rules

- For any TypeScript errors from changed types, use values that fit the new type and context — cleanup happens separately
- Always use the plural schema type for `ListItems<>` and the singular type for item callbacks
- `usePagination` is always required, regardless of which actions (if any) the list uses
