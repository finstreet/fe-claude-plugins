# Actions Reference

Each action is a self-contained module. To add an action to a list:

1. Add its **parser** to `{listName}SearchParams.ts`.
2. Add any **items hook** it needs (Sort/Group only).
3. Add **group config** if it's the Group action.
4. Make sure your **request** wires through any field it needs.
5. Render its **slot** inside `use{ListName}RenderActions.tsx`.

Pick the actions your list needs and follow each section below. To author an action that doesn't yet exist, see [building-a-new-action.md](building-a-new-action.md).

## The composition hook

All five built-in actions are wired through one file: `{featurePath}/use{ListName}RenderActions.tsx`. It returns the `renderActions` function the presentation passes to `<InteractiveList />`.

The hand-written JSX (`children`) decides which slots render and how they're laid out. There is no fixed combination — pick what your list needs.

```tsx
import { useExtracted } from "next-intl";
import { VStack } from "@styled-system/jsx";
import { useListActions } from "@/shared/hooks/useListActions";
import { SearchAction } from "@/shared/components/RenderActions/SearchAction";
import { GroupByAction } from "@/shared/components/RenderActions/GroupByAction";
import { SortByAction } from "@/shared/components/RenderActions/SortByAction";
import { ArchivedAction } from "@/shared/components/RenderActions/ArchivedAction";
import { ResetAction } from "@/shared/components/RenderActions/ResetAction";
import { ActionRow } from "@/shared/components/RenderActions/ActionRow";
import { use{ListName}SortByItems } from "./use{ListName}SortByItems";
import { use{ListName}GroupByItems } from "./use{ListName}GroupByItems";
import { {listName}SearchParams } from "./{listName}SearchParams";

export function use{ListName}RenderActions() {
  const sortByItems = use{ListName}SortByItems();
  const groupByItems = use{ListName}GroupByItems();
  const t = useExtracted();

  return useListActions({
    searchParams: {listName}SearchParams,
    translations: { label: t("Filter") },
    children: (
      <VStack gap={4} alignItems={"stretch"} width={"full"}>
        <SearchAction translations={{ label: t("Suche"), placeholder: t("Suchbegriff") }} />
        <ActionRow>
          <GroupByAction items={groupByItems} label={t("Gruppieren nach")} />
          <SortByAction items={sortByItems} label={t("Sortieren nach")} />
          <ArchivedAction translations={{ active: t("Aktiv"), archived: t("Archiviert") }} />
          <ResetAction translations={{ label: t("Zurücksetzen") }} />
        </ActionRow>
      </VStack>
    ),
  });
}
```

This hook is the only file that imports slot components. Each action section below tells you exactly what to add to it.

### Layout primitives

- `<ActionRow>` — responsive `HStack` (column on mobile, row from `lg` and up). Group slots that should sit side-by-side on desktop.
- `<VStack>` from `@styled-system/jsx` — stack rows vertically (e.g. search above group/sort).
- The mobile collapsible "Filter" panel is handled automatically by `useListActions`. `translations.label` is the panel's toggle title.

### Drop the hook entirely

If a list has no actions (pure pagination), don't write this hook. The presentation just calls `usePagination` and renders `<InteractiveList />` with no `renderActions` prop.

---

## Search

Free-text search input bound to the `search` URL param. Used on almost every list.

**Parser** — `{listName}SearchParams.ts`:

```ts
import { parseAsString } from "nuqs/server";

export const {listName}SearchParams = {
  search: parseAsString.withDefault(""),
  // ...other parsers
};
```

**Request** — already handled. `buildApiUrl` reads `searchParams.search` automatically when you pass the destructured `searchParams` (or a partial including `search`) into it.

**Slot:**

```tsx
<SearchAction translations={{ label: t("Suche"), placeholder: t("Suchbegriff") }} />
```

**Notes:**
- For two+ lists sharing one search input, do not use this slot — see [multi-list-shared-search.md](multi-list-shared-search.md).
- The throttle is fixed at 500ms inside the slot. Override only by editing `SearchAction.tsx` (see [building-a-new-action.md](building-a-new-action.md), section B.2).

---

## Sort

Single-select dropdown bound to the `sortBy` URL param. Values are an enum of `"{column} asc"` / `"{column} desc"` strings, taken from the Swagger `sort` enum.

**Parser** — `{listName}SearchParams.ts`:

```ts
import { parseAsStringEnum } from "nuqs/server";

export enum {ListName}SortByEnum {
  CREATED_AT_ASC = "created_at asc",
  CREATED_AT_DESC = "created_at desc",
  STATUS_ASC = "status asc",
  STATUS_DESC = "status desc",
  // all other values from Swagger
}

export const {listName}SearchParams = {
  sortBy: parseAsStringEnum<{ListName}SortByEnum>(Object.values({ListName}SortByEnum)),
  // ...other parsers
};
```

**Items hook** — `{featurePath}/use{ListName}SortByItems.ts`:

```ts
import { useExtracted } from "next-intl";
import { {ListName}SortByEnum } from "./{listName}SearchParams";

export function use{ListName}SortByItems() {
  const t = useExtracted();

  return [
    { value: "", label: t("Keine Sortierung") },
    { value: {ListName}SortByEnum.CREATED_AT_ASC, label: t("Erstelldatum aufsteigend") },
    { value: {ListName}SortByEnum.CREATED_AT_DESC, label: t("Erstelldatum absteigend") },
    // ...all enum values
  ];
}
```

The first entry is always an empty-value "no sorting" option.

**Request** — already handled. `buildApiUrl` reads `searchParams.sortBy` automatically when present.

**Slot:**

```tsx
<SortByAction items={sortByItems} label={t("Sortieren nach")} />
```

---

## Group

Single-select dropdown bound to the `groupBy` URL param. Switches the request from a flat paginated list to multiple grouped sub-lists.

Group is the most involved action because grouping changes both the items hook AND the request file.

**Parser** — `{listName}SearchParams.ts`:

Always declare a `NONE = "none"` value as the first enum entry — it's the "no grouping" marker. The `<GroupByAction />` dropdown uses it as the default option, and the request file's `if-else` skips the grouped branch when `groupBy` is `NONE` (since `NONE` is excluded from the group config). Then declare one sub-enum per group dimension that has discrete values (e.g. status, boolean flags). Use Swagger filter params (excluding `sort` and `search_term`).

```ts
import { parseAsStringEnum } from "nuqs/server";

export enum {ListName}GroupByEnum {
  NONE = "none",
  STATUS = "status",
  PROCESS_LANE = "process_lane",
}

export enum {ListName}GroupByStatusEnum {
  UNMAPPED = "unmapped",
  INCOMPLETE = "incomplete",
  ACTIVE_CONTRACT = "active_contract",
  ARCHIVED = "archived",
}

export const {listName}SearchParams = {
  groupBy: parseAsStringEnum<{ListName}GroupByEnum>(Object.values({ListName}GroupByEnum)),
  // ...other parsers
};
```

For boolean group dimensions, define a sub-enum with `'true'` / `'false'` string values.

**Items hook** — `{featurePath}/use{ListName}GroupByItems.ts`:

The first entry uses `GroupByEnum.NONE` (not the empty string) — this matches the canonical pattern in this codebase and lets the request file's `groupBy in CONFIG` check naturally fall through to the paginated branch when no grouping is selected.

```ts
import { useExtracted } from "next-intl";
import { {ListName}GroupByEnum } from "./{listName}SearchParams";

export function use{ListName}GroupByItems() {
  const t = useExtracted();

  return [
    { value: {ListName}GroupByEnum.NONE, label: t("Keine Gruppierung") },
    { value: {ListName}GroupByEnum.STATUS, label: t("Status") },
    // ...other enum values
  ];
}
```

**Group config** — `{featurePath}/{listName}GroupConfigs.ts`:

The group config maps each non-NONE `groupBy` enum value to its API query param and the set of allowed values. The Record is keyed on `Exclude<…, NONE>` so the type system enforces that every real grouping has a config entry. The translated headings (shown as section titles in the grouped UI) are NOT part of the group config — they're built as a separate `titles` map in the request file (next step).

```ts
import { GroupConfig } from "@/shared/types/GroupConfig";
import {
  {ListName}GroupByEnum,
  {ListName}GroupByStatusEnum,
} from "./{listName}SearchParams";

export const {LIST_NAME}_GROUP_CONFIG: Record<
  Exclude<{ListName}GroupByEnum, {ListName}GroupByEnum.NONE>,
  GroupConfig
> = {
  [{ListName}GroupByEnum.STATUS]: {
    queryParam: "q[status_eq]",                       // ← from Swagger
    values: Object.values({ListName}GroupByStatusEnum),
  },
  // ...one entry per non-NONE GroupByEnum value
};
```

Rules: every non-NONE `GroupByEnum` value must have an entry. `queryParam` comes from Swagger or context. `values` always comes from `Object.values()` of the matching sub-enum.

**Request** — `get{ListName}List.ts` switches between paginated and grouped fetches:

When the grouped branch fires, build a `titles: Record<string, string>` map inline using `getExtracted()` translations. Each entry maps a sub-enum value (a possible group key) to the translated heading the UI should show above that group. If your list supports multiple group dimensions, build one map per dimension and pick the right one based on `groupBy`.

```ts
import { collectGroupedData } from "@/shared/backend/models/common/collectGroupedData";
import { collectPaginatedData } from "@/shared/backend/models/common/collectPaginatedData";
import { {LIST_NAME}_GROUP_CONFIG } from "./{listName}GroupConfigs";

export async function get{ListName}List(searchParams: Parsed{ListName}SearchParams) {
  const { search, pagination, sortBy, groupBy } = searchParams;
  const currentPage = pagination["default"] || "1";
  const t = await getExtracted();
  let listItems: ListItems<{ListName}ItemType[]> = [];   // ← always initialize before if-else

  if (groupBy && groupBy in {LIST_NAME}_GROUP_CONFIG) {
    const groupConfig =
      {LIST_NAME}_GROUP_CONFIG[
        groupBy as Exclude<{ListName}GroupByEnum, {ListName}GroupByEnum.NONE>
      ];

    const statusTitles: Record<{ListName}GroupByStatusEnum, string> = {
      [{ListName}GroupByStatusEnum.UNMAPPED]: t("Nicht zugeordnet"),
      // ...one entry per sub-enum value
    };

    const titles: Record<string, string> = statusTitles;
    // For multiple group dimensions, switch on groupBy and pick the right map.

    listItems = await collectGroupedData({
      searchParams,
      groupConfig,
      path: "/path/to/resource",
      titles,
      apiCall: (apiUrl) => getPaginated{ListName}(apiUrl)({}),
    });
  } else {
    const apiUrl = buildApiUrl({
      baseUrl: "/path/to/resource",
      searchParams: { search, sortBy },
      additionalParams: { page: currentPage, limit: Constants.defaultPageSize },
    });

    listItems = await collectPaginatedData({
      apiUrl,
      title: t("{German section title}"),
      groupKey: "default",
      apiCall: () => getPaginated{ListName}(apiUrl)({}),
    });
  }

  return listItems;
}
```

Notes on the `if-else`:
- The condition is `groupBy && groupBy in CONFIG` (using the destructured `groupBy`, not `searchParams.groupBy`). When `groupBy` is `NONE` it isn't in the config — so the else-branch fires correctly with no extra check needed.
- The `as Exclude<…, NONE>` cast tells TypeScript that we've already checked `groupBy in CONFIG`, so the indexed access is safe.
- The `if-else` shape and the pre-initialized `listItems` are mandatory — see [creating-the-request.md](creating-the-request.md).

**Slot:**

```tsx
<GroupByAction items={groupByItems} label={t("Gruppieren nach")} />
```

---

## Archived

Two-option toggle (active / archived) bound to the `archived` URL param. Maps to `q[show_archived]=true` on the backend.

**Parser** — `{listName}SearchParams.ts`:

```ts
import { parseAsBoolean } from "nuqs/server";

export const {listName}SearchParams = {
  archived: parseAsBoolean.withDefault(false),
  // ...other parsers
};
```

`archived` is declared as **optional** on `BaseSearchParams` (`src/shared/types/searchParams.ts`), so lists without an archived toggle aren't forced to declare it. If `<ArchivedAction />` is rendered without the parser declared, the slot throws at render time.

**Request** — destructure `archived` from searchParams and pass it through `buildApiUrl`:

```ts
const { search, pagination, sortBy, groupBy, archived } = searchParams;

const apiUrl = buildApiUrl({
  baseUrl: "/path/to/resource",
  searchParams: { search, sortBy, archived },
  additionalParams: { page: currentPage, limit: Constants.defaultPageSize },
});
```

`buildApiUrl` maps `archived: true` → `q[show_archived]=true` generically — no per-list mapping required.

**Slot:**

```tsx
<ArchivedAction translations={{ active: t("Aktiv"), archived: t("Archiviert") }} />
```

**Notes:**
- `ArchivedAction` currently hardcodes a side effect on `groupBy` (forces `NONE` when archived, restores `STATUS` when active) using `FSPFinancingCasesGroupByEnum` directly. This is a known wart. New actions should use the prop-based decoupling pattern instead — see [building-a-new-action.md](building-a-new-action.md), section A.4.
- When pairing Archived with Group, you typically want to disable Group's `STATUS` option while archived is on (grouping archived cases by status is rarely meaningful). Use the per-list pre-processing pattern below.

---

## Reset

A "clear all" text button. Calls `resetQueryState` from context, which clears every registered slot (search, sortBy, groupBy, archived, plus pagination).

**Parser** — none. Reset doesn't touch its own URL param.

**Request** — none.

**Slot:**

```tsx
<ResetAction translations={{ label: t("Zurücksetzen") }} />
```

There is no separate "register me" step in the consumer — every slot self-registers via `useListActionsContext`. Reset just iterates over them.

---

## Per-list pre-processing

When one action's value should affect another action's items (e.g. disable `groupBy.STATUS` while `archived` is on), do the transform inside `use{ListName}RenderActions.tsx` before passing items to the slot. The slot itself stays generic.

```tsx
import { useQueryState } from "nuqs";
import { {listName}SearchParams, {ListName}GroupByEnum } from "./{listName}SearchParams";

const [archived] = useQueryState("archived", {listName}SearchParams.archived);

const processedGroupByItems = groupByItems.map((item) =>
  item.value === {ListName}GroupByEnum.STATUS && archived
    ? { ...item, disabled: true }
    : item,
);

// then: <GroupByAction items={processedGroupByItems} label={...} />
```

This pattern is local to the per-feature hook — the shared slot stays feature-agnostic.

---

## Rules

- The composition hook lives at `{featurePath}/use{ListName}RenderActions.tsx` (always `.tsx`).
- Translations come from `useExtracted()` and pass into each slot via `translations` or `label` props. Don't hardcode strings inside slots.
- Slots are not interchangeable with the deleted hooks (`useSearchAction`, `useSortAction`, `useGroupByAction`, `useRenderActions`). Those no longer exist.
- The order of slots in the JSX matches the visual order — there is no priority/order config.
