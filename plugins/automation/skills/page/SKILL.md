---
name: page
description: "Complete guide to building Next.js page files in finstreet/boilerplate applications. Covers metadata, params, and the two page types: Inquiry Pages and Portal Pages."
---

# Page — Complete Guide

Pages are shells that provide metadata and a layout structure for embedding content. Keep them simple — do not search the project for dependencies. Everything needed comes from context.

## Metadata

Every page exports a `metadata` object with the title. Use the title as-is (no translations here). Translations are only used inside the page component.

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";

export const metadata: Metadata = {
  title: `Page Title | ${Constants.companyName}`,
};
```

## Params

Derive params from the page file path. Any segment in `[brackets]` is a param. In Next.js 15, params are always a `Promise`:

```tsx
// Path: src/app/operations/financing-cases/[financingCaseId]/documents/page.tsx
type Props = {
  params: Promise<{ financingCaseId: string }>;
};

export default async function SomePage({ params }: Props) {
  const { financingCaseId } = await params;
  // ...
}
```

Always include all params visible in the file path.

## Inquiry Pages

Use `InquiryHeader` + `InquiryContent` for pages inside an inquiry process (multi-step wizard):

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { InquiryHeader } from "@finstreet/ui/components/pageLayout/InquiryHeader";
import { InquiryContent } from "@finstreet/ui/components/pageLayout/InquiryContent";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: `Page Title | ${Constants.companyName}`,
};

type Props = {
  params: Promise<{ inquiryId: string }>;
};

export default async function {PageName}Page({ params }: Props) {
  const { inquiryId } = await params;
  const t = await getTranslations("{translationNamespace}");

  return (
    <>
      <InquiryHeader title={t("title")} description={t("description")} />
      <InquiryContent>
        {/* Form or content component goes here */}
      </InquiryContent>
    </>
  );
}
```

## Portal Pages

Use `PageHeader` + `PageContent` for standard portal pages:

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import {
  PageHeader,
  PageHeaderTitle,
} from "@finstreet/ui/components/pageLayout/PageHeader";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: `Page Title | ${Constants.companyName}`,
};

type Props = {
  params: Promise<{ financingCaseId: string }>;
};

export default async function {PageName}Page({ params }: Props) {
  const { financingCaseId } = await params;
  const t = await getTranslations("{translationNamespace}");

  return (
    <>
      <PageHeader>
        <PageHeaderTitle>
          <Headline as="h1">{t("title")}</Headline>
        </PageHeaderTitle>
      </PageHeader>
      <PageContent>
        {/* Content component goes here, or Hello World if unspecified */}
      </PageContent>
    </>
  );
}
```

## Rules

- Always `async` — pages in Next.js App Router are async Server Components
- Always `await params` before destructuring
- Metadata title: plain string, no translations
- Page content: use `getTranslations` for translations
- If the content component is unknown from context, use `Hello World` as placeholder
- Do NOT search the project for existing pages or dependencies
