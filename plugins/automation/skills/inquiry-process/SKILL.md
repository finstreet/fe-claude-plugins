---
name: inquiry-process
description: "Complete guide to implementing an Inquiry Process (multi-step form wizard) using @finstreet/forms and @finstreet/ui. Use when building, modifying, or debugging any inquiry process in the finstreet context."
---

# Inquiry Process - Complete Guide

An Inquiry Process is a multi-step form wizard that collects information from the user. It uses the `ProgressBar` from `@finstreet/forms/ProgressBar` and layout components from `@finstreet/ui`.

## Architecture

```
InquiryProcess
  └── layout.tsx (ProgressBarProvider wraps all steps)
       ├── {Purpose}ProgressBar — shows step progress
       └── {children} — each step is a Next.js page with a Form
```

## Directory Structure

```
features/{purpose}InquiryProcess/
  ├── components/
  │   └── {Purpose}ProgressBar.tsx
  ├── forms/
  │   └── (added per step, not part of this skill)
  ├── utils/
  │   └── get{Purpose}InitialProgressState.ts
  └── {Purpose}InquiryProcess.types.ts

app/{role}/{purpose}-inquiry/[inquiryId]/
  └── layout.tsx               ← NOT inside the feature dir
```

## File Creation Order

ALWAYS create files in this exact sequence:

1. **Types** — `{Purpose}InquiryProcess.types.ts`
2. **InitialProgressState** — `utils/get{Purpose}InitialProgressState.ts`
3. **ProgressBar** — `components/{Purpose}ProgressBar.tsx`
4. **Layout** — `layout.tsx` (path provided from context/routes)

## Key Imports

```typescript
// ProgressBar state + provider
import { ProgressBarProvider, ProgressBarState } from '@finstreet/forms/ProgressBar'

// ProgressBar hook (inside hook functions)
import { useProgressBar, ProgressBarSteps } from '@finstreet/forms/ProgressBar'

// Validity (used inside each step's Form component)
import { Validity } from "@finstreet/forms/ProgressBar";

// UI components
import {
  ProgressBar,
  ProgressBarGroup,
} from "@finstreet/ui/components/patterns/ProgressBar";
import { ProgressStep } from "@/shared/components/ProgressStep";
import {
  FormLayout,
  FormLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/FormLayout";
import { Panel } from "@finstreet/ui/components/base/Panel";
import { Box } from "@styled-system/jsx";

// Navigation
import { usePathname, useParams } from 'next/navigation'

// Portal context
import { usePortal } from "@/shared/context/portal/portalContext";

// Routes
import { routes } from "@/routes";

// Translations
import { useTranslations } from 'next-intl'

// Backend (only when layout fetches data)
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
```

## Step-by-Step Reference

- For the **types file** (defining the steps enum), see [types.md](types.md)
- For the **initial progress state** setup, see [initial-progress-state.md](initial-progress-state.md)
- For the **ProgressBar component**, see [progress-bar.md](progress-bar.md)
- For the **layout file**, see [layout.md](layout.md)

## Rules

1. Always follow the file creation order — each file depends on the previous
2. The steps enum drives everything: progress bar, initial state, layout, and form validity
3. The layout file lives at the route path, NOT inside the feature directory
5. Use `usePortal()` inside the progress bar hook to resolve route paths
6. If the layout needs backend data (e.g., to prefill progress state), use `fetchWithErrorHandling`
