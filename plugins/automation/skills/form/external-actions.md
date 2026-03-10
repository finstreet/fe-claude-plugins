# External Form Actions (Buttons Outside the Form)

## When to Use

Use this pattern when the `<Form>` component cannot wrap everything on the page — typically because another component with its own form needs to render as a sibling or between the form fields and the action buttons. HTML does not allow nested `<form>` elements; doing so causes a hydration error:

> In HTML, `<form>` cannot be a descendant of `<form>`.

## How It Works

The HTML `form` attribute on a `<button type="submit">` lets a button submit a form it is not a DOM descendant of, by referencing the form's `id`. Combined with `formConfig.formId` (which sets the `<form id>` attribute) and `formConfig.onPendingChange` (which exposes the internal `isPending` state), you can render fully functional form actions anywhere on the page.

## Architecture

```
┌─────────────────────────────────────────┐
│ Form Component ("use client")           │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ <Form formConfig={config}>       │   │   ← has id="my-form"
│  │   <FormFields ... />             │   │
│  │ </Form>                          │   │
│  └──────────────────────────────────┘   │
│                                         │
│  <OtherComponent />  ← may contain      │   ← outside the <form>, no nesting
│                        its own form      │
│                                         │
│  <Button type="submit"                  │   ← form="my-form" links it
│    form="my-form"                       │
│    loading={isPending} />               │   ← isPending from zustand store
│                                         │
└─────────────────────────────────────────┘
         │                    ▲
         │  onPendingChange   │  isPending
         ▼                    │
   ┌─────────────────────────────┐
   │  Zustand Store              │
   │  { isPending, setIsPending }│
   └─────────────────────────────┘
```

## Additional File

This pattern adds one file to the standard form directory:

```
parentDirectory/
  ├── store.ts                          # Zustand store for isPending state
  ├── {formName}Schema.ts
  ├── ... (all other standard files)
```

## Step-by-Step

### 1. Create the Zustand Store

File: `store.ts`

```typescript
import { create } from "zustand";

interface {FormName}FormStore {
  isPending: boolean;
  setIsPending: (isPending: boolean) => void;
}

export const use{FormName}FormStore = create<{FormName}FormStore>((set) => ({
  isPending: false,
  setIsPending: (isPending) => set({ isPending }),
}));
```

### 2. Update useFormConfig

Three changes to the config:

1. **Add `formId`** — a unique string constant, exported for use by external buttons
2. **Add `onPendingChange`** — writes `isPending` to the zustand store
3. **Set `renderFormActions` to return `null`** — no actions rendered inside the form

```tsx
import { use{FormName}FormStore } from "./store";

export const {FORM_NAME}_FORM_ID = "{form-name}-form";

export function use{FormName}FormConfig(
  defaultValues: {FormName}DefaultValues,
): FormConfig<{FormName}FormState, {FormName}Type, {FormName}OutputType> {
  const fields = use{FormName}FormFields();
  const { setIsPending } = use{FormName}FormStore();

  return {
    formId: {FORM_NAME}_FORM_ID,
    fields,
    defaultValues,
    schema: {formName}Schema,
    fieldNames: createFormFieldNames(fields),
    serverAction: {formName}FormAction,
    onPendingChange: (isPending: boolean) => {
      setIsPending(isPending);
    },
    useErrorAction: () => {
      return (formState: {FormName}FormState) => {
        console.error(formState?.error);
      };
    },
    renderFormActions: () => {
      return null;
    },
  };
}
```

### 3. Update the Form Component

The Form component renders:
- `<Form>` wrapping only the form fields
- Any sibling components (including other forms) outside `<Form>`
- Action buttons outside `<Form>`, with `form={FORM_ID}` on the submit button

```tsx
"use client";

import { Form } from "@/shared/components/form/Form";
import {
  use{FormName}FormConfig,
  {FORM_NAME}_FORM_ID,
} from "./use{FormName}FormConfig";
import { {FormName}FormFields } from "./{FormName}FormFields";
import { {FormName}DefaultValues } from "./{formName}Schema";
import { use{FormName}FormStore } from "./store";
import { HStack, VStack } from "@styled-system/jsx";
import { Button } from "@finstreet/ui/components/base/Button";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { useExtracted } from "next-intl";
import { useRouter } from "next/navigation";

type {FormName}FormProps = {
  defaultValues: {FormName}DefaultValues;
};

export const {FormName}Form = ({ defaultValues }: {FormName}FormProps) => {
  const config = use{FormName}FormConfig(defaultValues);
  const { isPending } = use{FormName}FormStore();
  const t = useExtracted();
  const router = useRouter();

  return (
    <VStack gap={12} alignItems="stretch">
      <Form formConfig={config}>
        <{FormName}FormFields fieldNames={config.fieldNames} />
      </Form>

      {/* Other components (may contain their own forms) */}
      <SomeOtherComponent />

      {/* Form actions — outside the <Form> */}
      <HStack justifyContent="space-between">
        <Button
          type="button"
          variant="text"
          onClick={() => router.back()}
          icon={<FaArrowLeft />}
        >
          {t("back")}
        </Button>
        <Button
          loading={isPending}
          type="submit"
          form={{FORM_NAME}_FORM_ID}
          icon={<FaArrowRight />}
          css={{ flexShrink: 0 }}
        >
          {t("submit")}
        </Button>
      </HStack>
    </VStack>
  );
};
```

## Rules

- The `formId` constant is exported from `useFormConfig` so external buttons can reference it
- `renderFormActions` returns `null` — not omitted — since the `FormConfig` type requires the property
- The submit button needs both `type="submit"` and `form={FORM_ID}` to link to the correct form
- Non-submit buttons (back, cancel) use `type="button"` and do not need the `form` attribute
- `onPendingChange` is the only way to get `isPending` outside the `<Form>` component — the zustand store is the bridge
