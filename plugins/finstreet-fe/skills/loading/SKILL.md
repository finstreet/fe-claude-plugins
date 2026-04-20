---
name: loading
description: "Guide to building Next.js loading.tsx skeleton pages that mirror page content structure. Use this skill whenever creating loading states, skeleton pages, or loading.tsx files for any page type — list pages, form sub-pages, detail overviews, cards grids, description lists, or custom content pages. Must be triggered when the user mentions loading page, skeleton, loading state, or loading.tsx."
---

# Loading Page Guide

Loading pages are Next.js files (`loading.tsx`) that show skeleton placeholders while the real page loads. They mirror the structure of their corresponding page — same layout components, same spacing, same hierarchy — but replace dynamic content with skeleton components.

## Workflow

1. Read the corresponding `page.tsx` to understand its structure
2. Identify the page type using the decision tree
3. Generate the loading file(s) using the matching pattern from [loading-patterns.md](./references/loading-patterns.md)

## Decision Tree

Analyze what the page imports and renders:

1. **List page?** (imports a list component, uses `Suspense`, has `force-dynamic`) → **List Loading**
2. **Form sub-page?** (imports a Form component or uses `FormLayout`) → **Form Sub-Page Loading**
3. **Detail overview?** (imports `TaskGroup` / `TaskPanel`, shows grouped tasks) → **Detail Overview Loading**
4. **Description list page?** (imports `DescriptionsList`) → **Description List Loading**
5. **Cards grid page?** (imports `CardsGridLayout` or renders card panels) → **Cards Grid Loading**
6. **Custom content page?** (documents, contracts, timeline, etc.) → **Custom Content Loading**

## File Structure

Loading pages follow a **two-file pattern**:

### 1. Page-level `loading.tsx` (in `src/app/...`)

Thin wrapper that imports and renders the feature-level loading component.

```tsx
import { FeatureLoading } from "@/features/{feature}/components/FeatureLoading";

export default function PageNameLoading() {
  return <FeatureLoading />;
}
```

### 2. Feature-level loading component (in `src/features/...`)

Contains the actual skeleton layout. Lives alongside the feature's other components.

**Exception — List pages**: Only need the page-level `loading.tsx` since they delegate directly to the shared `ListLoading` component. No feature-level component needed.

## Available Skeleton Components

| Component | Import | Purpose |
|-----------|--------|---------|
| `BoxSkeleton` | `@finstreet/ui/components/base/Skeletons/BoxSkeleton` | Rectangular placeholder for content blocks |
| `TextSkeleton` | `@finstreet/ui/components/base/Skeletons/TextSkeleton` | Animated text lines (`lines`, `fontSize` props) |
| `AvatarSkeleton` | `@finstreet/ui/components/base/Skeletons/AvatarSkeleton` | Circular placeholder (`size` prop) |

## Shared Loading Components

| Component | Import | Use for |
|-----------|--------|---------|
| `ListLoading` | `@/shared/components/ListLoading` | List pages — accepts `title` prop |
| `FormSkeleton` | `@/shared/components/FormSkeleton` | Form pages — renders form field placeholders, no props |
| `SubPageHeaderSkeleton` | `@/shared/components/SubPageHeaderSkeleton` | Sub-pages — accepts `title` prop, renders back button + title + text skeleton |

## Server vs Client Components

- **Server (async)**: Use `getTranslations()` from `next-intl/server`. Export as `async function`.
- **Client**: Add `"use client"` directive. Use `useTranslations()` from `next-intl`.

Choose based on what the component needs:
- Only needs translations → prefer async server component with `getTranslations()`
- Needs hooks (`useParams`, etc.) → client component with `useTranslations()`

## Patterns

See [loading-patterns.md](./references/loading-patterns.md) for detailed code templates and examples of each loading type.

## Rules

1. The loading page must mirror the structure of its corresponding page — same layout hierarchy, same spacing
2. Use shared components (`ListLoading`, `FormSkeleton`, `SubPageHeaderSkeleton`) whenever the pattern matches — do not reinvent them
3. Translation namespaces must match the actual page's translation namespace
4. Page-level `loading.tsx` function name: `{RouteSegments}Loading` (PascalCase from route path)
5. Feature-level component name: `{FeatureName}Loading`
6. Do NOT import or call data-fetching functions — loading pages have no data
7. Do NOT search the project for existing loading pages or dependencies
8. Match gap sizes, grid column counts, and layout areas from the actual page
9. Skeleton dimensions should approximate the content they replace (e.g., a card that's ~200px tall → `BoxSkeleton height="200"`)
10. When the page has a description `Typography` with a translation key, the loading page should render that same translated text — descriptions are static and known at load time
