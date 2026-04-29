# Building or Modifying an Action

How to author a brand-new slot component for `useListActions`, or modify an existing one. Slots live at `src/shared/components/RenderActions/`.

This is the path to take when no existing slot (`SearchAction`, `GroupByAction`, `SortByAction`, `ArchivedAction`, `ResetAction`) covers what the list needs — e.g. a date range filter, a multi-select status filter, a flag toggle.

## A. Authoring a new action

### A.1 Declare the parser

A slot needs a parser to read/write URL state. The parser lives on `BaseSearchParams` so every list can opt into it.

1. Add an **optional** field to `BaseSearchParams` (`src/shared/types/searchParams.ts`):

   ```ts
   export type BaseSearchParams<...> = {
     // ...existing fields
     dateRange?: ParserBuilder<{ from: string; to: string } | null>;
   };
   ```

   Optional, because most lists won't need it and shouldn't be forced to declare it.

2. In the per-feature SearchParams file (`{featurePath}/{listName}SearchParams.ts`), add the parser:

   ```ts
   import { parseAsJson } from "nuqs/server";

   export const {listName}SearchParams = {
     // ...existing fields
     dateRange: parseAsJson<{ from: string; to: string } | null>().withDefault(null),
   };
   ```

   Use whichever `parseAs*` matches the value shape (`parseAsBoolean`, `parseAsString`, `parseAsStringEnum`, `parseAsJson`, `createBase64Parser`, etc).

### A.2 Decide on a backend mapping

If the new field maps 1:1 onto a query string key, extend `buildApiUrl` (`src/shared/backend/models/common/buildApiUrl.ts`) with a typed branch — mirror the `archived → q[show_archived]=true` pattern:

```ts
interface SearchParamsWithDateRange {
  dateRange?: { from: string; to: string } | null;
}

// ...inside buildApiUrl:
if ("dateRange" in searchParams && (searchParams as SearchParamsWithDateRange).dateRange) {
  const { from, to } = (searchParams as SearchParamsWithDateRange).dateRange!;
  queryParams["q[created_after]"] = from;
  queryParams["q[created_before]"] = to;
}
```

For one-off mappings used by a single list, prefer `customParamMappers` over modifying `buildApiUrl`.

### A.3 Implement the slot component

File: `src/shared/components/RenderActions/{ActionName}.tsx`. Always `"use client"`.

Every slot follows the same six-step contract. Use `ArchivedAction.tsx` as the worked reference — it's the most complete (consumes a parser from context, throws on missing slot, has cross-action effects, uses `usePersistedFilters` indirectly through the context's `setPagination`).

```tsx
"use client";

import { useEffect } from "react";
import { useQueryState } from "nuqs";
import { Box } from "@styled-system/jsx";
import { useListActionsContext } from "@/shared/components/RenderActions/ListActionsContext";
import { usePersistedFilters } from "@/shared/hooks/usePersistedFilters";

type DateRangeActionProps = {
  translations: { label: string };
};

export function DateRangeAction({ translations }: DateRangeActionProps) {
  // 1. Read context
  const { startTransition, setPagination, searchParams, registerFilter } =
    useListActionsContext();

  // 2. Throw if the parser slot is missing on this list's searchParams
  if (!searchParams.dateRange) {
    throw new Error(
      "<DateRangeAction /> requires `dateRange` to be defined on the list's searchParams.",
    );
  }

  // 3. Bind to URL state
  const [dateRange, setDateRange] = useQueryState(
    "dateRange",
    searchParams.dateRange.withOptions({
      shallow: false,
      startTransition,
      throttleMs: 500,
    }),
  );

  // 4. Register with the global Reset
  useEffect(
    () =>
      registerFilter({
        key: "dateRange",
        reset: () => setDateRange(null),
      }),
    [registerFilter, setDateRange],
  );

  // 5. Persist across session navigation
  usePersistedFilters({
    setters: { dateRange: setDateRange },
    currentValues: { dateRange },
    defaultValues: { dateRange: null },
  });

  // 6. On change: update value and reset pagination
  const handleChange = (next: { from: string; to: string } | null) => {
    startTransition(() => {
      setDateRange(next);
      setPagination(null);
    });
  };

  return (
    <Box flexBasis={"100%"}>
      {/* ...your input UI calling handleChange */}
    </Box>
  );
}
```

The six steps, summarized:

| Step | What | Why |
|------|------|-----|
| 1 | `useListActionsContext()` | Get `startTransition`, `setPagination`, `searchParams`, `registerFilter`. The context is provided by `useListActions`; everything below depends on it. |
| 2 | Throw if `searchParams.<key>` missing | Lists that don't declare the parser shouldn't silently render a broken control — fail loudly at render time. |
| 3 | `useQueryState(<key>, searchParams.<key>.withOptions({ shallow: false, startTransition, throttleMs: 500 }))` | Bind to URL state through the centralized parser so reset and persistence stay in sync. |
| 4 | `useEffect(registerFilter({ key, reset }))` | The global Reset button only clears slots that have registered. Without this, your filter would survive Reset. |
| 5 | `usePersistedFilters` | Survive navigation away and back. Without this, the value is lost on session navigation. |
| 6 | `setPagination(null)` on every change | Filter changes invalidate the current page. Skipping this is a silent bug that only surfaces on page 2+. |

### A.4 Cross-action effects (prop-based)

When toggling one filter must affect another (e.g. `archived` forcing `groupBy` to `NONE`), the **canonical pattern is a callback prop on the new action**, not a hardcoded import of the other feature's enum.

The shared component stays feature-agnostic:

```tsx
type DateRangeActionProps = {
  translations: { label: string };
  onDateRangeChange?: (next: { from: string; to: string } | null) => void;
};

export function DateRangeAction({ translations, onDateRangeChange }: DateRangeActionProps) {
  // ...steps 1–5 from above

  const handleChange = (next: { from: string; to: string } | null) => {
    startTransition(() => {
      setDateRange(next);
      setPagination(null);
      onDateRangeChange?.(next);
    });
  };

  // ...
}
```

The per-feature `use{ListName}RenderActions.tsx` then wires the side effect. A small helper hook can grab a sibling parser's setter:

```tsx
// inside use{ListName}RenderActions.tsx
const [, setGroupBy] = useQueryState("groupBy", {listName}SearchParams.groupBy);

// and in the JSX:
<DateRangeAction
  translations={{ label: t("Zeitraum") }}
  onDateRangeChange={(range) => {
    if (range) setGroupBy({ListName}GroupByEnum.NONE);
  }}
/>
```

> **Known wart:** `ArchivedAction` currently imports `FSPFinancingCasesGroupByEnum` directly. New actions should not follow that pattern — use the prop-based recipe above. When you next touch `ArchivedAction`, refactor it to take an `onArchivedChange` callback so the FSP-specific behavior moves out to `useFSPFinancingCasesRenderActions.tsx`.

### A.5 Layout

The slot is responsible for its own width.

| Use case | Wrapper |
|----------|---------|
| Stretches to fill the row (text input, select) | `<Box flexBasis={"100%"}>` |
| Compact, full-width on mobile only (toggle, button) | `<Box width={{ base: "full", lg: "auto" }}>` |

Don't add margins or top-level spacing — `useListActions` and the consumer's `VStack`/`ActionRow` handle that.

### A.6 Anti-patterns

- **Don't read URL state directly.** Always go through `searchParams.<key>` from context. If you call `useQueryState` with your own parser literal, you'll desync from the global reset and persistence wiring.
- **Don't skip `registerFilter`.** The action will appear to work — until the user clicks "Zurücksetzen" and your filter doesn't clear.
- **Don't skip `usePersistedFilters`.** The value will vanish when the user navigates away and back, which is jarring on lists where filters are expected to stick.
- **Don't skip `setPagination(null)`.** Hidden bug: page 2 of a filtered list, change the filter, and the URL still says `page=2` even though there are only 0 results on page 2 of the new filter.
- **Don't import a feature-specific enum into a shared action.** Use the prop-based decoupling pattern from A.4.
- **Don't add hardcoded translation strings.** Pass them in via `translations` or label props from the consumer.

## B. Modifying an existing action

Use the same six-step contract as a checklist for what each change touches. Most modifications are localized — don't rewrite the whole component.

### B.1 Adding a prop

Example: a `placeholder` override on `SearchAction`.

- **Touches:** the props type and the rendered JSX.
- **Leaves alone:** steps 1–6. The contract is unchanged; only the UI surface widens.

```tsx
type SearchActionProps = {
  translations: { label: string; placeholder: string };
  variant?: "default" | "compact";
};
```

### B.2 Changing fetch behavior

Example: server-side debounce on `SearchAction`.

- **Touches:** the `withOptions` call in step 3 (`throttleMs`). The slot's render is untouched.
- **Leaves alone:** steps 1, 2, 4, 5, 6. The component contract doesn't change; only the parser options do.

`searchParams.search` already flows through `buildApiUrl` automatically when the request includes it, so debounce is purely a UX concern — no request-side changes needed.

### B.3 Adding a cross-action effect to an existing slot

Example: making `SortByAction` reset `groupBy` to `NONE` when a specific sort is selected.

- **First refactor** the existing slot to take a callback prop, if it doesn't already have one (see A.4).
- **Then wire** the side effect at the call site (`use{ListName}RenderActions.tsx`), not inside the shared component.

For `ArchivedAction` specifically, the current FSP-specific coupling can be lifted out by:
1. Adding `onArchivedChange?: (archived: boolean) => void` to its props.
2. Removing the `FSPFinancingCasesGroupByEnum` import and the `setGroupBy` block.
3. Moving that logic into `useFSPFinancingCasesRenderActions.tsx` as the callback.

Do this when you're already touching the file for another reason — it doesn't need its own PR.

### B.4 What you must not change without thinking

- Any of the six contract steps. Removing any of them silently breaks one of: reset, persistence, pagination consistency, or context coupling.
- The `"use client"` directive. All slots are client components because they call `useQueryState`.
- The URL key. Changing it breaks bookmarks and anyone with an open tab.

## File location summary

| File | What |
|------|------|
| `src/shared/components/RenderActions/{ActionName}.tsx` | The slot itself |
| `src/shared/components/RenderActions/ListActionsContext.tsx` | Context — read only, don't extend without coordinating |
| `src/shared/hooks/useListActions.tsx` | The host hook — touch only when adding a new cross-cutting concern |
| `src/shared/types/searchParams.ts` | `BaseSearchParams` — add new optional fields here |
| `src/shared/backend/models/common/buildApiUrl.ts` | Backend mapping for new query params |
| `{featurePath}/{listName}SearchParams.ts` | Per-list parser declarations |
| `{featurePath}/use{ListName}RenderActions.tsx` | The call site that composes slots and wires cross-action callbacks |
