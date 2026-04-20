---
name: page
description: "Guide to building Next.js page shells — metadata, params, header pattern selection, content wrappers, and structural concerns. Pages are thin shells; content is handled by other skills."
---

# Page — Shell Guide

Pages are thin shells providing metadata, a header, and a content wrapper. They do NOT own what goes inside the wrapper — forms, lists, task groups, and inquiry content are handled by other skills.

## Metadata

Every page exports a static `metadata` object. Title is always a plain German string — never use translations.

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";

export const metadata: Metadata = {
  title: `Seitentitel | ${Constants.companyName}`,
};
```

## Params & SearchParams

### Params (dynamic route segments)

Derive from the file path — every `[segment]` becomes a param. Always `Promise`, always `await` before destructuring.

```tsx
// Path: src/app/operations/weg-konten/[financingCaseId]/verrechnungskonto/page.tsx
type Props = {
  params: Promise<{ financingCaseId: string }>;
};

export default async function SomePage({ params }: Props) {
  const { financingCaseId } = await params;
  // ...
}
```

Multiple params accumulate from all segments in the path:

```tsx
// Path: src/app/operations/anfragen/[inquiryId]/[stepId]/page.tsx
type Props = {
  params: Promise<{ inquiryId: string; stepId: string }>;
};
```

### SearchParams (list pages and auth pages only)

**List pages** — use nuqs `SearchParams` type with a search params cache:

```tsx
import { SearchParams } from "nuqs/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ListPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const { search, pagination } = someSearchParamsCache.parse(resolvedSearchParams);
  // ...
}
```

**Auth pages** — use explicit typed searchParams:

```tsx
type Props = {
  searchParams: Promise<{
    passwordResetSuccess: string;
    redirectTo: string;
  }>;
};

export default async function AuthPage(props: Props) {
  const searchParams = await props.searchParams;
  // ...
}
```

## Header Pattern Decision Tree

Choose the correct header based on page context:

1. **Inquiry step page?** (inside an inquiry process) → **No header in page.tsx**. The page is a thin wrapper that delegates to a feature page component. The feature component renders `InquiryHeader` + `InquiryContent`. See the [inquiry-process step-page guide](../inquiry-process/step-page.md).

2. **Auth page?** (login, password reset, etc.) → **No header**. Use `Panel` + `VStack` as container.

3. **Sub-page under a detail page?** (e.g., `[id]/verrechnungskonto/page.tsx`) → `PageHeader` with `PageHeaderBackButton` + `PageHeaderTitle`. Often uses a shared header component like `FspFinancingCaseOverviewSubPageHeader`.

4. **List page or standard portal page?** → `PageHeader` with `PageHeaderTitle` + optional `PageHeaderActions`.

5. **Detail overview page?** (e.g., `[id]/page.tsx` showing status/tasks) → Custom header component extracted to a feature, built on `PageHeader` primitives.

For reusable header components, when to use them vs composing inline, and where to store new ones, see [headers.md](./headers.md).

## Content Wrappers

- **`PageContent`** — standard portal pages (list, overview, sub-page form). Import from `@finstreet/ui/components/pageLayout/PageContent`.
- **`InquiryContent`** — inquiry process steps. Used inside the feature page component, not in `page.tsx`. Import from `@finstreet/ui/components/pageLayout/InquiryContent`.
- **`Panel`** — auth pages. No `PageContent` needed. Import from `@finstreet/ui/components/base/Panel`.

Content inside these wrappers is provided by other skills.

## Page Shell Templates

### Template 1: Standard Portal Page (most common)

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderTitle,
} from "@finstreet/ui/components/pageLayout/PageHeader";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { getExtracted } from "next-intl/server";

export const metadata: Metadata = {
  title: `Seitentitel | ${Constants.companyName}`,
};

export default async function {PageName}Page() {
  const t = await getExtracted();

  return (
    <>
      <PageHeader>
        <PageHeaderTitle>
          <Headline as="h1">{t("{German title}")}</Headline>
        </PageHeaderTitle>
        <PageHeaderActions>{/* Action buttons */}</PageHeaderActions>
      </PageHeader>
      <PageContent>
        {/* Content from other skills */}
      </PageContent>
      {/* Modals at the bottom */}
    </>
  );
}
```

### Template 2: List Page with SearchParams

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ListSkeleton } from "@finstreet/ui/components/base/Skeletons/ListSkeleton";

export const metadata: Metadata = {
  title: `Seitentitel | ${Constants.companyName}`,
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function {PageName}Page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const { search, pagination } = {feature}SearchParamsCache.parse(resolvedSearchParams);

  return (
    <>
      {/* PageHeader with title + optional actions */}
      <PageContent>
        <Suspense fallback={<ListSkeleton />}>
          {/* List component */}
        </Suspense>
      </PageContent>
      {/* Modals at the bottom */}
    </>
  );
}
```

### Template 3: Sub-Page with Back Button

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { FspFinancingCaseOverviewSubPageHeader } from "@/layouts/fsp/FspFinancingCaseOverviewSubPageHeader";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";

export const metadata: Metadata = {
  title: `Seitentitel | ${Constants.companyName}`,
};

type Props = {
  params: Promise<{ financingCaseId: string }>;
};

export default async function {PageName}Page({ params }: Props) {
  const { financingCaseId } = await params;

  return (
    <>
      <FspFinancingCaseOverviewSubPageHeader
        title={t("formTitle")}
        financingCaseId={financingCaseId}
        header={response.header}
      />
      <PageContent>
        {/* Content from other skills */}
      </PageContent>
    </>
  );
}
```

When no shared header component exists, compose directly with `PageHeader` primitives:

```tsx
<PageHeader>
  <PageHeaderBackButton href={backUrl}>{t("back")}</PageHeaderBackButton>
  <PageHeaderTitle>
    <Headline as="h1">{title}</Headline>
  </PageHeaderTitle>
</PageHeader>
```

### Template 4: Inquiry Step Page (thin wrapper)

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { {StepName}Page } from "@/features/{purpose}InquiryProcess/components/{StepName}Page";

export const metadata: Metadata = {
  title: `{Step Title} | ${Constants.companyName}`,
};

type Props = {
  params: Promise<{ inquiryId: string }>;
};

export default async function FSP{StepName}Page({ params }: Props) {
  const { inquiryId } = await params;

  return <{StepName}Page inquiryId={inquiryId} />;
}
```

Header and content wrapper live in the feature page component. See [inquiry-process step-page guide](../inquiry-process/step-page.md).

### Template 5: Auth Page

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { Panel } from "@finstreet/ui/components/base/Panel";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { VStack } from "@styled-system/jsx";
import { getExtracted } from "next-intl/server";

export const metadata: Metadata = {
  title: `Anmelden | ${Constants.companyName}`,
};

export default async function {PageName}Page() {
  const t = await getExtracted();

  return (
    <Panel p={8}>
      <VStack gap={8} alignItems="stretch">
        <Headline as="h1">{t("headline")}</Headline>
        {/* Banners for status messages */}
        {/* Auth form component */}
      </VStack>
    </Panel>
  );
}
```

## Structural Concerns

- **Modals**: always render at page bottom, as siblings to header and content — never inside `PageContent`.
- **`export const dynamic = "force-dynamic"`**: only on list pages that need fresh data on every request.
- **`ResetScrollPosition`**: use on detail overview pages at the top of the JSX, before the header. Import from `@finstreet/ui/components/base/ResetScrollPosition`.
- **Suspense**: wrap list components with `<Suspense fallback={<ListSkeleton />}>` inside `PageContent`.

## Rules

1. Always `async` — pages are Server Components
2. Always `await params` / `await searchParams` before destructuring
3. Metadata title: plain German string, no translations
4. Translations in page content: use `getExtracted()` (server) or `useExtracted()` (client)
5. Modals go at the end of the JSX, outside `PageContent`
6. Do NOT search the project for existing pages or dependencies
7. If the content component is unknown from context, use `Hello World` as placeholder
8. For inquiry steps, always use the thin wrapper pattern — delegate to a feature page component
9. `PageHeaderActions` is omitted entirely when there are no actions — do not render an empty one
