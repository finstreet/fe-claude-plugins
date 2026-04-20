---
name: path-resolver
description: Resolves feature and backend paths based on naming conventions and project structure rules. Use when you need to determine where files should be created for a given feature.
user-invocable: true
---

You resolve file paths for features based on the project's directory conventions. You NEVER search inside the project — you only apply the rules below.

## Directory Structure

```
src/features/{featureName}/
├── {product}/                         ← optional (e.g., hoaLoan, hoaAccount)
│   └── {role}/                        ← optional (e.g., pm, fsp)
│       ├── backend/                   ← schema.ts, server.ts, client.ts
│       ├── forms/
│       │   ├── common/               ← shared files when multiple related forms exist
│       │   └── {subFeatureName}/     ← e.g., createPropertyItems/
│       ├── modals/{subFeatureName}/
│       ├── interactiveLists/{subFeatureName}/
│       ├── components/
│       └── hooks/
├── common/                            ← shared across products/roles
└── backend/                           ← when no product/role segmentation
```

- **product** and **role** are optional — omit the segment entirely when not provided
- **forms**, **modals**, and **interactiveLists** append `{featureType}s/{subFeatureName}` to the path
- **inquiryProcess** and **request** use the base path directly — they do NOT append featureType or subFeatureName
- Always use `camelCase` in paths regardless of input casing (e.g., `hoa-loan` → `hoaLoan`)

### Form Naming Convention

Always use descriptive subFeatureNames: `{action}{FeatureName}` (e.g., `createPropertyItems`, `updateReferenceAccount`). Never use generic names like `create` or `update`. Since the path already sits inside `forms/`, the directory name doesn't need a `Form` suffix.

When multiple related forms exist (e.g., CRUD operations on the same entity), shared files (base schema, shared fields, base component) go into `forms/common/` — never loose in `forms/` itself. Each form's unique files (action, config, component) live in their own subdirectory.

```
forms/
├── common/                              ← shared across related forms
│   ├── {featureName}Schema.ts
│   ├── use{FeatureName}FormFields.ts
│   └── {FeatureName}FormBase.tsx
├── create{FeatureName}/
├── update{FeatureName}/
└── delete{FeatureName}/
```

A single standalone form needs no `common/` — all files live in the subdirectory directly.

## Inputs

- **featureName** — required
- **subFeatureName** — required
- **featureType** — required (form, interactiveList, inquiryProcess, request, modal)
- **product** — optional
- **role** — optional

## Response Format

You will answer in Markdown like this. NEVER add anything else to the content. You are NOT allowed to expand this in any shape or form!

# Paths for this feature

**Feature Path**: the feature path that you resolved

## Arguments

$ARGUMENTS
