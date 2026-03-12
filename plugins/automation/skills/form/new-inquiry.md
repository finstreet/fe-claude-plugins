# New Inquiry Entry Point

Inquiry process pages are publicly accessible, so users cannot start an inquiry by simply navigating to a URL — they must fill out a form first. The "new" page pattern handles this: the user fills out the first step of the inquiry (inquiry details), and on submit the form action creates the inquiry on the backend, updates it with the form data, and redirects into the inquiry flow with the newly generated ID.

## When to Use

Use this pattern when an inquiry process needs a public entry point (`/neu` or `/new` route). The "new" variant shares 95% of its code with the regular inquiry details step — only the form action, form config, and form component differ.

## Directory Structure

The `new/` directory lives inside the inquiry details form directory:

```
forms/inquiryDetails/
  ├── new/
  │   ├── New{FormName}Form.tsx
  │   ├── new{FormName}FormAction.ts
  │   └── useNew{FormName}FormConfig.tsx
  ├── options/                          # Shared with regular step
  ├── {formName}Schema.ts              # Shared
  ├── use{FormName}FormFields.ts       # Shared
  ├── {FormName}FormFields.tsx         # Shared
  ├── {formName}FormAction.ts          # Regular update-only action
  ├── use{FormName}FormConfig.tsx       # Regular config (has back button)
  ├── {FormName}Form.tsx               # Regular form component
  ├── get{FormName}DefaultValues.ts    # Shared
  └── map{FormName}ToPayload.ts        # Shared payload mapper (optional)
```

The `new/` directory contains only the three files that differ from the regular step. Everything else is shared.

## Shared vs New-Specific Files

| File | Shared? | Why it differs |
|------|---------|----------------|
| Schema | Shared | Same fields for new and existing inquiries |
| useFormFields | Shared | Same field definitions |
| FormFields component | Shared | Same field rendering |
| Options | Shared | Same options |
| DefaultValues | Shared | Both need the same structure (new page passes empty defaults from the page component) |
| Payload mapper | Shared | Same API contract |
| **Form Action** | **Different** | New calls `startInquiry` first, then `updateDetails` |
| **Form Config** | **Different** | New has no back button (it's the entry point) |
| **Form Component** | **Different** | New uses the new-specific config |

## New Form Action

The key difference: the new form action makes two sequential API calls — first creating the inquiry, then updating it with the form data.

File: `new/{formName}FormAction.ts`

```typescript
"use server";

import {
  {FormName}FormState,
  {FormName}OutputType,
} from "../{formName}Schema";
import { handleFormRequestError } from "@/shared/backend/handleFormRequestError";
import {
  start{Product}Inquiry,
  update{Product}InquiryDetails,
} from "@/shared/backend/models/inquiry/{product}/server";
import { redirect } from "next/navigation";
import { map{FormName}ToPayload } from "../map{FormName}ToPayload";
import { Portal } from "@/shared/types/Portal";
import { routes } from "@/routes";

export async function new{FormName}FormAction(
  state: {FormName}FormState,
  formData: {FormName}OutputType,
  portal: Portal,
): Promise<{FormName}FormState> {
  // Step 1: Create the inquiry
  const startResult = await start{Product}Inquiry({
    payload: {},
  });

  if (!startResult.success) {
    return handleFormRequestError(startResult.error);
  }

  // Step 2: Update with form data using the new ID
  const inquiryId = startResult.data.id;
  const result = await update{Product}InquiryDetails({
    pathVariables: { id: inquiryId },
    payload: map{FormName}ToPayload(formData),
  });

  if (result.success) {
    redirect(
      portal === "propertyManager"
        ? routes.pm.{product}.inquiry.nextStep(inquiryId)
        : routes.fsp.{product}.inquiry.nextStep(inquiryId),
    );
  } else {
    return handleFormRequestError(result.error);
  }
}
```

The regular form action only calls `updateDetails` because the inquiry already exists:

```typescript
// Regular action (for comparison)
export async function {formName}FormAction(
  state: {FormName}FormState,
  formData: {FormName}OutputType,
  portal: Portal,
): Promise<{FormName}FormState> {
  const result = await update{Product}InquiryDetails({
    pathVariables: { id: formData.inquiryId },
    payload: map{FormName}ToPayload(formData),
  });

  if (result.success) {
    redirect(/* next step route */);
  } else {
    return handleFormRequestError(result.error);
  }
}
```

## New Form Config

The new config has no back button (the new page is the entry point) and uses `flex-end` to right-align the submit button.

File: `new/useNew{FormName}FormConfig.tsx`

```tsx
import { FormConfig } from "@finstreet/forms";
import { createFormFieldNames } from "@finstreet/forms/lib";
import { useExtracted } from "next-intl";
import { Button } from "@finstreet/ui/components/base/Button";
import { HStack } from "@styled-system/jsx";
import { FaArrowRight } from "react-icons/fa6";
import { new{FormName}FormAction } from "./new{FormName}FormAction";
import {
  {formName}Schema,  // or useSchema if dynamic
  {FormName}FormState,
  {FormName}OutputType,
  {FormName}Type,
  {FormName}DefaultValues,
} from "../{formName}Schema";
import { use{FormName}FormFields } from "../use{FormName}FormFields";
import { usePortal } from "@/shared/context/portal/portalContext";

export function useNew{FormName}FormConfig({
  defaultValues,
  options,       // Pass through if useFormFields or schema needs runtime data
}: {
  defaultValues: {FormName}DefaultValues;
  options: OptionsResponseType;
}): FormConfig<{FormName}FormState, {FormName}Type, {FormName}OutputType> {
  const t = useExtracted();
  const fields = use{FormName}FormFields(options);
  const { portal } = usePortal();

  return {
    fields,
    defaultValues,
    schema: {formName}Schema,  // or dynamic schema from options
    fieldNames: createFormFieldNames(fields),
    serverAction: (state, formData) =>
      new{FormName}FormAction(state, formData, portal),
    useErrorAction: () => {
      return (formState: {FormName}FormState) => {
        console.error(formState?.error);
      };
    },
    renderFormActions: (isPending: boolean) => {
      return (
        <HStack mt={12} justifyContent="flex-end">
          <Button
            loading={isPending}
            type="submit"
            icon={<FaArrowRight />}
          >
            {t("Weiter")}
          </Button>
        </HStack>
      );
    },
  };
}
```

Compare with the regular config which has a back button:

```tsx
// Regular config uses space-between and has a back button
renderFormActions: (isPending: boolean) => {
  return (
    <HStack mt={12} justifyContent="space-between">
      <Button
        type="button"
        variant="text"
        icon={<FaArrowLeft />}
        onClick={() => router.back()}
      >
        {t("Zurück")}
      </Button>
      <Button loading={isPending} type="submit" icon={<FaArrowRight />}>
        {t("Weiter")}
      </Button>
    </HStack>
  );
},
```

## New Form Component

The new form component is a thin wrapper that uses the new-specific config but renders the shared FormFields component.

File: `new/New{FormName}Form.tsx`

```tsx
"use client";

import { {FormName}DefaultValues } from "../{formName}Schema";
import { useNew{FormName}FormConfig } from "./useNew{FormName}FormConfig";
import { Form } from "@/shared/components/form/Form";
import { {FormName}FormFields } from "../{FormName}FormFields";

type New{FormName}FormProps = {
  defaultValues: {FormName}DefaultValues;
  options: OptionsResponseType;
};

export const New{FormName}Form = ({
  defaultValues,
  options,
}: New{FormName}FormProps) => {
  const config = useNew{FormName}FormConfig({ defaultValues, options });

  return (
    <Form formConfig={config}>
      <{FormName}FormFields
        fieldNames={config.fieldNames}
        options={options}
      />
    </Form>
  );
};
```

## New Page Setup

The "new" page is a server component under the app directory (e.g., `/verwalter/anfragen/{product}/neu/page.tsx`). It:

1. Sets `export const dynamic = "force-dynamic"` to prevent caching
2. Fetches options (but NOT existing inquiry data — there is none yet)
3. Provides empty default values with `inquiryId: "new"` as a marker
4. Renders the `New{FormName}Form` component

```tsx
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetScrollPosition } from "@finstreet/ui/components/base/ResetScrollPosition";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { VStack } from "@styled-system/jsx";
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
import { get{Product}InquiryOptions } from "@/shared/backend/models/inquiry/{product}/server";
import { {FormName}DefaultValues } from "@/features/inquiryProcess/{product}InquiryProcess/forms/inquiryDetails/{formName}Schema";
import { New{FormName}Form } from "@/features/inquiryProcess/{product}InquiryProcess/forms/inquiryDetails/new/New{FormName}Form";
import { Constants } from "@/shared/utils/constants";

export const metadata: Metadata = {
  title: `Ihre Anfrage | ${Constants.companyName}`,
};

export const dynamic = "force-dynamic";

export default async function New{Product}InquiryPage() {
  const t = await getTranslations("{product}InquiryProcess.inquiryDetails");
  const options = await fetchWithErrorHandling(() =>
    get{Product}InquiryOptions({}),
  );

  const defaultValues: {FormName}DefaultValues = {
    inquiryId: "new",
    // All form fields initialized to empty/undefined
    fieldA: undefined,
    fieldB: undefined,
  };

  return (
    <>
      <ResetScrollPosition />
      <VStack gap={2} mb={8} alignItems="flex-start">
        <Headline as="h1">{t("title")}</Headline>
        <Typography>{t("description")}</Typography>
      </VStack>
      <New{FormName}Form
        defaultValues={defaultValues}
        options={options}
      />
    </>
  );
}
```

The regular inquiry step page, by contrast, fetches the existing inquiry data and passes it through `getDefaultValues` to prefill the form.

## Key Differences Summary

| Aspect | New (`/neu`) | Regular (`/[inquiryId]/...`) |
|--------|-------------|------------------------------|
| API calls | `startInquiry` + `updateDetails` | `updateDetails` only |
| inquiryId source | Created by `startInquiry` response | From URL params |
| Default values | Empty, `inquiryId: "new"` | Prefilled from `getInquiry` |
| Back button | None (entry point) | Yes, `router.back()` |
| Button alignment | `flex-end` | `space-between` |
| Data fetching | Options only | Options + existing inquiry |
| `dynamic` export | `"force-dynamic"` | Inherited from layout |
