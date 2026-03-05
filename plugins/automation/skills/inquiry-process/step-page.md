# Step Page

Each step in an inquiry process needs a page that fetches existing inquiry data from the backend, transforms it into form default values, and renders the form.

Always extract the page into a **feature page component**. This keeps the Next.js `page.tsx` as a thin wrapper (metadata + params) and makes the step immediately reusable across multiple inquiry processes. Even for single-use steps, the separation is lightweight and keeps the structure consistent.

## Directory Structure

```
features/{purpose}InquiryProcess/
  ├── components/
  │   └── {StepName}Page.tsx            ← Feature page component
  └── forms/
      └── {stepName}/
          └── get{StepName}DefaultValues.ts  ← Default values (see form-skill)
```

## Next.js page.tsx (Thin Wrapper)

The `page.tsx` only handles Next.js concerns: metadata and param extraction. All domain logic lives in the feature page component.

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { {StepName}Page } from "@/features/{purpose}InquiryProcess/components/{StepName}Page";

export const metadata: Metadata = {
  title: `{Step Title} | ${Constants.companyName}`,
};

type {StepName}PageProps = {
  params: Promise<{ inquiryId: string }>;
};

export default async function FSP{StepName}Page({
  params,
}: {StepName}PageProps) {
  const { inquiryId } = await params;

  return <{StepName}Page inquiryId={inquiryId} />;
}
```

## Feature Page Component

The feature page component is a server component that owns all domain logic: data fetching, default values transformation, and layout. It receives only the `inquiryId` and is self-contained.

```tsx
import { getTranslations } from "next-intl/server";
import { get{StepName}DefaultValues } from "@/features/{purpose}InquiryProcess/forms/{stepName}/get{StepName}DefaultValues";
import { {StepName}Form } from "@/features/{purpose}InquiryProcess/forms/{stepName}/{StepName}Form";
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
import { get{Purpose}Inquiry } from "@/shared/backend/models/inquiry/{purpose}/server";
import { InquiryHeader } from "@finstreet/ui/components/pageLayout/InquiryHeader";
import { InquiryContent } from "@finstreet/ui/components/pageLayout/InquiryContent";

type {StepName}PageProps = {
  inquiryId: string;
};

export const {StepName}Page = async ({
  inquiryId,
}: {StepName}PageProps) => {
  const t = await getTranslations("{translationKey}");

  const inquiryValues = await fetchWithErrorHandling(() =>
    get{Purpose}Inquiry({
      pathVariables: {
        id: inquiryId,
      },
    }),
  );

  const defaultValues = get{StepName}DefaultValues(
    inquiryId,
    inquiryValues.details.{stepName},
  );

  return (
    <>
      <InquiryHeader title={t("title")} description={t("description")} />
      <InquiryContent>
        <{StepName}Form defaultValues={defaultValues} />
      </InquiryContent>
    </>
  );
};
```

### With options (e.g., dropdown values from the backend)

When the step also needs options data, fetch both in the feature page:

```tsx
export const {StepName}Page = async ({
  inquiryId,
}: {StepName}PageProps) => {
  const t = await getTranslations("{translationKey}");

  const options = await fetchWithErrorHandling(() =>
    get{Purpose}InquiryOptions({}),
  );

  const inquiryValues = await fetchWithErrorHandling(() =>
    get{Purpose}Inquiry({
      pathVariables: {
        id: inquiryId,
      },
    }),
  );

  const defaultValues = get{StepName}DefaultValues(
    inquiryId,
    inquiryValues.details.{stepName},
  );

  return (
    <>
      <InquiryHeader title={t("title")} description={t("description")} />
      <InquiryContent>
        <{StepName}Form defaultValues={defaultValues} options={options} />
      </InquiryContent>
    </>
  );
};
```

## getDefaultValues

The `get{StepName}DefaultValues` function transforms backend response data into the shape the form expects. It lives alongside the form files (`forms/{stepName}/get{StepName}DefaultValues.ts`).

For implementation patterns (base defaults, backend prefill, transformation patterns, nested objects), see the form-skill's [default-values.md](../form-skill/default-values.md).

## Data Flow

```
Next.js page.tsx
  │  await params → inquiryId
  ▼
Feature Page Component (server)
  │  fetchWithErrorHandling → inquiryValues
  │  get{StepName}DefaultValues(inquiryId, inquiryValues.details.{stepName})
  │  InquiryHeader + InquiryContent layout
  ▼
Form Component (client, 'use client')
  │  useFormConfig(defaultValues, ...) → FormConfig
  ▼
Form renders with prefilled values
  │  User submits
  ▼
Form Action (server action)
  │  map{StepName}ToPayload(formData) → API payload
  ▼
Backend request
```

## Rules

1. Always extract into a feature page component — even for single-use steps
2. The `page.tsx` is a thin wrapper: metadata + param extraction only
3. The feature page component fetches its own data via `fetchWithErrorHandling`
4. Use `get{StepName}DefaultValues` to transform backend data into form defaults (see [form-skill default-values.md](../form-skill/default-values.md))
5. Each step page uses `InquiryHeader` and `InquiryContent` from `@finstreet/ui` for consistent layout
