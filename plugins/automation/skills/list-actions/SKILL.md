---
name: list-actions
description: "Complete guide to adding pagination, search, sorting, filtering, and grouping to an InteractiveList built with @finstreet/ui. Use when implementing or modifying list actions in the finstreet context."
---

# List Actions — Complete Guide

This skill covers adding pagination and related features (search, sort, filter, group) to an `InteractiveList` component.

## Directory Structure

```
{featurePath}/
  ├── {listName}SearchParams.ts
  ├── {listName}GroupConfigs.ts         ← only for grouping
  ├── {ListName}PresentationList.tsx    ← update existing file
  ├── index.tsx                         ← container component
  ├── use{ListName}RenderActions.tsx    ← only for sort/group
  ├── use{ListName}SortByItems.ts       ← only for sorting
  └── use{ListName}GroupByItems.ts      ← only for grouping

{requestPath}/
  └── get{ListName}List.ts
```

## Which Files to Create

### Case 1 — Pagination only
1. SearchParams → 2. Request → 3. Presentation (add pagination) → 4. Container

### Case 2 — Pagination + Search
1. SearchParams → 2. Request → 3. Presentation (add search + pagination) → 4. Container

### Case 3 — Pagination + Search + Sort + Filter/Group
1. SearchParams → 2. GroupConfigs → 3. Request → 4. SortByItems + GroupByItems + RenderActions → 5. Presentation → 6. Container

## Step-by-Step Reference

- For **SearchParams** setup (pagination, search, sort, group enums), see [search-params.md](search-params.md)
- For **creating the request** (`get{ListName}List.ts`), see [creating-the-request.md](creating-the-request.md)
- For **the container** (`index.tsx`), see [implementing-the-container.md](implementing-the-container.md)
- For **action item hooks** (sortBy, groupBy, renderActions), see [action-items-hooks.md](action-items-hooks.md)
- For **updating the presentation** component, see [adding-pagination-presentation.md](adding-pagination-presentation.md)
- For **group configs**, see [group-config.md](group-config.md)

## Rules

1. Always create a single SearchParams file per feature (not per list) when multiple lists share params
2. Never change the structure of the request file — keep the `if-else` block and pre-initialized `listItems`
3. Never build query param schemas in the endpoint config
4. Always use `nuqs` for URL-based state (no client-side state for pagination/sort/filter)
