---
name: list-actions
description: "Complete guide to list actions on an InteractiveList built with @finstreet/ui — how to wire any combination of pagination, search, sort, group, archived, and reset onto a list, and how to author or modify the slot components themselves. Use when implementing or modifying list actions, when adding search/sort/group/archived/reset to a list, or when building a new kind of filter/toggle slot for the shared RenderActions system."
---

# List Actions — Complete Guide

This skill covers two distinct workflows:

- **Path 1 — Add actions to a list.** Set up the list scaffold and wire any combination of the existing actions (`Search`, `Sort`, `Group`, `Archived`, `Reset`) onto it. Most tasks land here.
- **Path 2 — Build or modify an action.** Author a brand-new slot for the shared `useListActions` system, or change the behavior of an existing slot.

## Which Path?

| Signal | Path |
|--------|------|
| Task names an existing action: search, sort, group, archived, reset, pagination | Path 1 |
| Task introduces a new dimension (date range, status filter, multi-select tag, etc.) with no existing slot | Path 2 (section A) |
| Task changes the props or behavior of `SearchAction` / `GroupByAction` / `SortByAction` / `ArchivedAction` / `ResetAction` itself | Path 2 (section B) |

When in doubt, start at Path 1. If it turns out the slot you need doesn't exist, switch to Path 2.

## Path Resolution

Before creating any files for **Path 1**, invoke the `finstreet-fe:path-resolver` skill with your input parameters (featureName, subFeatureName, featureType=interactiveList, product, role) to resolve the correct paths. Use the returned **Feature Path** as `{featurePath}`. For `{requestPath}`, take the base feature path (without the `interactiveLists` segment) and append `/backend`.

Path 2 work happens in `src/shared/components/RenderActions/` and `src/shared/types/searchParams.ts` — no path resolver needed.

---

## Path 1 — Add Actions to a List

Two pieces: a **scaffold** that every list has, plus the **actions** the list needs. Build the scaffold once, then add each action by following its section in [actions.md](actions.md).

### Scaffold (always)

Every list has these files. Build them first, even if the list has no actions beyond pagination.

| File | Purpose | Reference |
|------|---------|-----------|
| `{featurePath}/{listName}SearchParams.ts` | URL state — pagination + each action's parser | [search-params.md](search-params.md) |
| `{requestPath}/get{ListName}List.ts` | Server fetch | [creating-the-request.md](creating-the-request.md) |
| `{featurePath}/index.tsx` | Server container | [implementing-the-container.md](implementing-the-container.md) |
| `{featurePath}/{ListName}PresentationList.tsx` | Client presentation, `usePagination`, `<InteractiveList />` | [adding-pagination-presentation.md](adding-pagination-presentation.md) |

### Actions (pick what the list needs)

Each action has a self-contained recipe (parser, items hook if any, group config if any, request handling if any, slot JSX). Read each action's section as needed:

| Action | What it does | Extra files | See |
|--------|--------------|-------------|-----|
| Search | Free-text input filtering the list | — | [actions.md § Search](actions.md#search) |
| Sort | Single-select dropdown of `column asc/desc` | `use{ListName}SortByItems.ts` | [actions.md § Sort](actions.md#sort) |
| Group | Single-select dropdown that pivots the list into grouped sub-lists | `use{ListName}GroupByItems.ts`, `{listName}GroupConfigs.ts` | [actions.md § Group](actions.md#group) |
| Archived | Active/Archived toggle, maps to `q[show_archived]` | — | [actions.md § Archived](actions.md#archived) |
| Reset | "Clear all" text button | — | [actions.md § Reset](actions.md#reset) |

When the list has any actions beyond pagination, also create `{featurePath}/use{ListName}RenderActions.tsx` — the composition hook that pulls the slots together. The full template lives in [actions.md § The composition hook](actions.md#the-composition-hook).

### Multi-list shared search

When two or more lists on one page share a single search input, the file layout itself differs: per-list directories with just a Presentation (no per-list server container, no `<Suspense>`), a standalone `{ListName}SearchAction.tsx` component, and the page does the parallel fetches via `Promise.all` and renders Presentations directly. The `useListActions` hook isn't used in this pattern. See [multi-list-shared-search.md](multi-list-shared-search.md) for the full walkthrough.

---

## Path 2 — Build or Modify an Action

When no existing slot fits, or when an existing slot needs a new prop or behavior change.

- **Authoring a new action** — declare the parser, decide on the API mapping, implement the slot following the six-step contract, handle cross-action effects via callback props.
- **Modifying an existing action** — adding a prop, changing throttle/debounce behavior, lifting feature-specific coupling out into a callback prop.

See [building-a-new-action.md](building-a-new-action.md).

---

## Rules (apply to both paths)

1. One SearchParams file per feature, even when multiple lists share it.
2. Don't change the structure of the request file's `if-else` block (with grouping) — keep the pre-initialized `listItems` and the two branches.
3. Don't build query param schemas in the endpoint config — everything flows through `buildApiUrl`.
4. Always use `nuqs` for URL-based state. No client-side state for pagination, search, sort, group, or archived.
5. Inside an action slot, always go through `useListActionsContext` for the parser, pagination, and reset registration. Don't reinvent these.
6. Always reset pagination on filter change (`setPagination(null)` inside the slot's change handler).
7. Don't import a feature-specific enum into a shared action component — pass cross-action effects in as callback props (see [building-a-new-action.md § A.4](building-a-new-action.md)).
