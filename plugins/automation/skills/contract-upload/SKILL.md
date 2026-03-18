---
name: contract-upload
description: "Complete guide to building a contract upload page (signature process start). The page lets users upload contract documents, view scan/preparation status, delete documents, edit signature fields, and proceed to signature assignment. Use when building, modifying, or debugging any contract upload page, signaturprozess page, or contract file upload feature in the finstreet context."
---

# Contract Upload — Complete Guide

A contract upload page is the first step of the signature process. Users upload contract PDFs, the system scans them and detects signature fields, and users can edit those fields before proceeding to signature assignment. The page displays contract groups with their documents, a file upload area per group, and action buttons at the bottom.

## Architecture

```
Page (server) → SubPageHeader + PageContent wrapper
                                    ↓
                              ContractsPageContent (client)
                                    ↓
                              Contract Group × N
                              ├── Group title + description
                              ├── ContractDocument × N per group (from @finstreet/ui)
                              ├── ContractFileUpload (file input per group)
                              └── ContractActionButtons (at bottom, once)
```

### Data Flow

```
Page (server)
  ├── fetches contracts via getContracts(product)
  ├── fetches signingHeader via getSigningHeader(product)
  └── fetches editorStatus via getEditorStatus(product)
        ↓
ContractsPageContent (client)
  ├── useContracts hook (polls for scan updates every 5s)
  ├── renders ContractDocument per document
  ├── renders ContractFileUpload per contract group
  └── renders ContractActionButtons (uses useEditorStatus hook)
```

## Directory Structure

The feature components live under `src/features/contracts/`. The backend layer (schema, server/client fetch functions) is assumed to already exist or be created with the `secure-fetch` skill — this skill only covers the server actions, the polling hook, and the UI components.

```
src/features/contracts/
  └── components/
      ├── ContractsPageContent.tsx       ← main content component
      ├── ContractFileUpload.tsx         ← file upload per contract group
      ├── ContractActionButtons.tsx      ← back/continue buttons + warning banner
      └── ContractsLoading.tsx           ← skeleton loading state

src/shared/backend/models/contracts/
  ├── uploadContractAction.ts            ← server action: checksum → direct upload → Google Cloud
  ├── deleteContractAction.ts            ← server action: delete contract
  └── hooks/
      └── useContracts.ts                ← React Query hook with auto-polling
```

**Assumed to already exist** (created via `secure-fetch` skill or manually):
- `schema.ts` — Zod schemas and types
- `server.ts` — server-side fetch functions (product-parameterized)
- `client.ts` — client-side fetch function for polling

## File Creation Order

1. **Server actions** — `uploadContractAction.ts`, `deleteContractAction.ts`
2. **Hook** — `useContracts.ts`
3. **Components** — ContractFileUpload → ContractActionButtons → ContractsPageContent
4. **Loading** — `ContractsLoading.tsx`
5. **Page** — the route `page.tsx` + `loading.tsx`

## Step-by-Step Reference

- For the **3 page content components** (ContractsPageContent, ContractFileUpload, ContractActionButtons), see [components.md](components.md)
- For the **server actions and polling hook**, see [backend.md](backend.md)

## Product Parameterization

All backend functions take a `product: Product` parameter. The product determines the API path segment via `productPath[product]`. The page components themselves are product-agnostic — they get `product` from the `useProduct()` context hook.

The continue button behavior in `ContractActionButtons` may vary by product. Some products may start signing directly (bypassing signature assignment), while others navigate to a signature assignment page. Adapt the `handleClick` logic to the product's requirements.

## Rules

1. `ContractsPageContent` is `"use client"` — it uses hooks (useContracts, useProduct, useQueryClient, useTranslations, useRouter)
2. `ContractFileUpload` does NOT have `"use client"` directive — it's already rendered inside a client component boundary
3. `ContractActionButtons` is `"use client"` — it's imported by ContractsPageContent which is also client, but has its own directive
4. The page is a server component that fetches 3 things: contracts, signing header, editor status
5. The page wraps `ContractsPageContent` inside `<PageContent>` from `@finstreet/ui`
6. After upload or delete, invalidate both `["contracts", financingCaseId]` and `["editorStatus", financingCaseId]` query keys
7. After upload or delete, also call `documentExchangeRefetchAction(financingCaseId)` to sync document exchange
8. Translation namespace is `signatureProcess.startSignatureProcess` for all components
9. Use `useTranslations` from `next-intl` (not `useExtracted`)
10. Use arrow function exports (`export const`) for components
11. The `useContracts` hook auto-polls every 5 seconds while any document is still scanning or signature fields aren't editable — stops when all documents are clean
12. The loading skeleton re-exports from the feature directory into the route's `loading.tsx`
