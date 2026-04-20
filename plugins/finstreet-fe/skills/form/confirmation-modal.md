# Confirmation Modal Variant

## When to Use

Use this pattern when a form submission requires explicit user confirmation before executing. The user clicks "Submit", the form validates, and if valid, a confirmation modal appears. The actual form submission only happens when the user clicks the confirm button inside the modal.

This is distinct from:
- **Modal form** (documented in [examples.md](examples.md#example-modal-create-form-legal-representative)): The entire form lives inside a modal.
- **External actions** (documented in [external-actions.md](external-actions.md)): The submit button is outside the `<Form>` tag to avoid nested `<form>` elements.

## How It Works

```
User clicks submit button
        │
        ▼
ValidatedSubmitButton calls trigger() to validate all fields
        │
        ├── Invalid → validation errors shown, modal stays closed
        │
        └── Valid → onValidationSuccess() fires → setIsOpen(true)
                    │
                    ▼
              ConfirmationModal opens
                    │
                    ├── Cancel → setIsOpen(false)
                    │
                    └── Confirm → <button type="submit" form={formId}>
                                  triggers actual form submission
                                         │
                                         ▼
                                  Server action runs
                                         │
                                  ┌──────┴──────┐
                                  │             │
                               Success       Error
                                  │             │
                           close modal    close modal
                           + navigate     + log error
```

The key mechanism: the modal's confirm button uses `type="submit"` with `form={formId}` to submit the form it is not a DOM descendant of (same HTML trick as the external actions pattern).

## Prerequisites

This pattern assumes the consuming project has:
- A `ConfirmationModal` component that accepts either `formId` (form submission) or `action` (callback)
- A `useConfirmationModal` Zustand store with `isOpen`, `isPending`, `setIsOpen`, `setIsPending`
- A `ValidatedSubmitButton` component that validates the form and calls `onValidationSuccess` on success

## What Changes vs. Standard Form

| Concern | Standard Form | Confirmation Modal |
|---------|--------------|-------------------|
| Submit button | `<Button type="submit">` | `<ValidatedSubmitButton onValidationSuccess={() => setIsOpen(true)} />` |
| `formId` in config | Not needed | **Required** — modal's confirm button uses it |
| `onPendingChange` | Not needed | **Required** — forwards `isPending` to modal store |
| `useErrorAction` | Logs error | Logs error **+ closes modal** |
| `useSuccessAction` | Optional | **Required** — closes modal + navigates |
| Form component | Just fields | Fields **+ `<ConfirmationModal formId={...} />`** |

## useFormConfig Template

```tsx
import { useConfirmationModal } from "@/shared/components/ConfirmationModal/store";
import { ValidatedSubmitButton } from "@/shared/components/ValidatedSubmitButton/ValidatedSubmitButton";

export function use{FormName}FormConfig(
  defaultValues: {FormName}DefaultValues,
): {FormName}FormConfig {
  const t = useExtracted();
  const fields = use{FormName}FormFields();
  const router = useRouter();
  const { setIsOpen, setIsPending } = useConfirmationModal();

  return {
    fields,
    defaultValues,
    formId: "{formName}",
    schema: {formName}Schema,
    fieldNames: createFormFieldNames(fields),
    onPendingChange: (isPending: boolean) => {
      setIsPending(isPending);
    },
    serverAction: {formName}FormAction,
    useErrorAction: () => {
      return (formState: {FormName}FormState) => {
        console.log(formState?.error);
        setIsOpen(false);
      };
    },
    useSuccessAction: () => {
      return () => {
        setIsOpen(false);
        router.push("/target/path");
      };
    },
    renderFormActions: (isPending: boolean) => {
      return (
        <HStack mt={12} justifyContent={"space-between"}>
          <Button
            type={"button"}
            variant={"text"}
            icon={<FaArrowLeft />}
            onClick={() => router.back()}
          >
            {t("Zurück")}
          </Button>
          <ValidatedSubmitButton
            label={t("Absenden")}
            loading={isPending}
            onValidationSuccess={() => setIsOpen(true)}
          />
        </HStack>
      );
    },
  };
}
```

### Key differences from standard config

1. **`formId`** — a string constant. The `ConfirmationModal` uses this to target the form via `<button type="submit" form={formId}>`.
2. **`onPendingChange`** — pipes `isPending` into the confirmation modal store so the modal's confirm button shows a loading spinner during submission.
3. **`useErrorAction`** — closes the modal (`setIsOpen(false)`) in addition to logging.
4. **`useSuccessAction`** — closes the modal AND navigates. Both happen here, not in the form action (which just returns `{ error: null, message: null }` + revalidates).
5. **`renderFormActions`** — uses `ValidatedSubmitButton` instead of `<Button type="submit">`. The `ValidatedSubmitButton` validates the form via `trigger()` and only calls `onValidationSuccess` (which opens the modal) if all fields pass.

### With disabled/editable prop

If the form can be read-only, pass `disabled` to the `ValidatedSubmitButton`:

```tsx
<ValidatedSubmitButton
  label={t("Absenden")}
  loading={isPending}
  disabled={!editable}
  onValidationSuccess={() => setIsOpen(true)}
/>
```

## Form Action Template

The form action uses `revalidatePath` + return (no redirect). Navigation is handled by `useSuccessAction` in the config.

```typescript
"use server";

import {
  {FormName}FormState,
  {FormName}OutputType,
} from "./{formName}Schema";
import { handleFormRequestError } from "@/shared/backend/handleFormRequestError";

export async function {formName}FormAction(
  state: {FormName}FormState,
  formData: {FormName}OutputType,
): Promise<{FormName}FormState> {
  const result = await putSomeResource({
    pathVariables: { someId: formData.someId },
    payload: {
      field1: formData.field1,
      field2: formData.field2,
    },
  });

  if (result.success) {
    revalidatePath("/relevant/path");
    return {
      error: null,
      message: null,
    };
  } else {
    return handleFormRequestError(result.error);
  }
}
```

The action does NOT redirect. It returns `{ error: null, message: null }` on success — the `useSuccessAction` in the config handles closing the modal and navigating.

## Form Component Template

```tsx
"use client";

import { Form } from "@/shared/components/form/Form";
import { use{FormName}FormConfig } from "./use{FormName}FormConfig";
import { {FormName}FormFields } from "./{FormName}FormFields";
import { {FormName}DefaultValues } from "./{formName}Schema";
import { ConfirmationModal } from "@/shared/components/ConfirmationModal/modal";

type {FormName}FormProps = {
  defaultValues: {FormName}DefaultValues;
};

export const {FormName}Form = ({ defaultValues }: {FormName}FormProps) => {
  const config = use{FormName}FormConfig(defaultValues);

  return (
    <Form formConfig={config}>
      <{FormName}FormFields fieldNames={config.fieldNames} />
      <ConfirmationModal formId={config.formId!} />
    </Form>
  );
};
```

The `ConfirmationModal` is rendered as a child of `<Form>` but floats as a modal overlay. It receives `formId` (with the `!` non-null assertion since we know the config sets it) so its confirm button can submit the form.

## Rules

- The `formId` in the config must be a unique string — it becomes the HTML `id` attribute on the `<form>` element.
- `ValidatedSubmitButton` is NOT a `type="submit"` button — it's a regular button that calls `trigger()` for client-side validation, then fires the callback. The actual submit happens from inside the modal.
- `useSuccessAction` and `useErrorAction` both close the modal. The difference is that `useSuccessAction` also navigates.
- The form action must NOT use `redirect()` — it should `revalidatePath` + return. Navigation happens client-side in `useSuccessAction` via `router.push`.
- No additional store file is needed in the form directory — the pattern uses the shared `ConfirmationModal/store`.
