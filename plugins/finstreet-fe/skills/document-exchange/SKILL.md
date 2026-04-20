---
name: document-exchange
description: "Complete guide to building document exchange pages. A document exchange page lets users upload, download, and manage documents organized into collapsible request groups. Use when building, modifying, or debugging any document exchange page, document upload/download feature, or dokumente page in the finstreet context."
---

# Document Exchange — Complete Guide

A document exchange page lets users manage documents organized into collapsible request groups. Each group contains document request cards that support upload, download, and delete. The feature is split by portal (FSP vs PM), but shares common actions, a sorting hook, a zustand store, and backend models.

## Architecture

```
Page (server) → Header (client) + PageContent (client)
                                        ↓
                                  RequestGroup (client) × N
                                        ↓
                                  RequestDisplay (client) × N per group
                                        ↓
                                  DocumentRequest (from @finstreet/ui)
```

## Directory Structure

Shared files live in `common/` and at the feature root. Portal-specific components live in `fsp/` or `pm/`.

```
src/features/documentExchange/
  ├── store.ts                              ← zustand toggle for "hide completed"
  ├── useSortRequestsByRequestGroup.ts      ← sorts requests into 4 groups
  ├── common/
  │   ├── actions/
  │   │   ├── documentExchangeUploadAction.ts
  │   │   ├── documentExchangeDownloadDocumentAction.ts
  │   │   ├── documentExchangeDeleteDocumentAction.ts
  │   │   └── documentExchangeRefetchAction.ts
  │   └── components/
  │       └── DocumentExchangeLoading.tsx
  └── {portal}/                             ← fsp or pm
      └── components/
          ├── DocumentExchangePageContent.tsx
          ├── DocumentExchangeRequestGroup.tsx
          └── DocumentExchangeRequestDisplay.tsx
```

## File Creation Order

When creating a document exchange for a new product/portal:

1. **Backend** (schema + server) — if a new endpoint is needed
2. **Common actions** — adjust revalidation paths for the new product route
3. **Store** — already shared, no changes needed
4. **Sorting hook** — already shared, no changes needed unless request groups differ
5. **Components** — DocumentExchangeRequestDisplay → RequestGroup → PageContent
6. **Page** — the route page.tsx
7. **Loading** — the loading.tsx skeleton

## Portal Differences

| Feature | FSP | PM |
|---------|-----|-----|
| Message modal | Yes (DocumentRelatedMessageModal) | No |
| DocumentTags | Yes | No |
| sendMessage callback | Yes | No |
| Progress text color | `text.dark` | `text.light` |
| Header wraps | FspFinancingCaseOverviewSubPageHeader | PropertyManagementCaseDetailsPageSubHeader |

Both portals share: common actions, store, sorting hook, loading component, and backend.

## Step-by-Step Reference

- For the **3 core components** (PageContent, RequestGroup, RequestDisplay), see [components.md](components.md)
- For the **common actions** (upload, download, delete, refetch), see [actions.md](actions.md)
- For **shared utilities** (store, sorting hook, loading, backend), see [shared.md](shared.md)

## Rules

1. All 3 components are `"use client"` — they use hooks (state, translations, zustand store)
2. The `DocumentRequest` component from `@finstreet/ui` handles the actual upload/download UI
3. Actions are shared in `common/actions/` — only adjust `revalidatePath` routes for new products
4. The store, sorting hook, and loading component are fully shared — do not duplicate
5. The page is a server component that fetches data via `getRequestsWithDocuments`
6. Translation namespace is `documentExchange` for all components
7. Use `useTranslations` from `next-intl` (not `useExtracted`)
8. Use arrow function exports (`export const`) for components
