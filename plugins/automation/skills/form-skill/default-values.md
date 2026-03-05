# Default Values

Complete guide to implementing `getDefaultValues` functions for forms.

## When to Use a Separate File vs Inline Defaults

**Separate `get{FormName}DefaultValues.ts` file** — use when the form is prefilled from backend data (e.g., update forms, inquiry process steps). The function defines base defaults, then conditionally merges backend values on top.

**Inline defaults in `useFormConfig`** — use for create-only forms (e.g., modals) where the form always starts empty. Define `defaultValues` directly in the config object:

```typescript
return {
  fields,
  defaultValues: {
    financingCaseId,
    firstName: "",
    lastName: "",
    amount: undefined,
  },
  schema: formNameSchema,
  // ...
};
```

## Field-Type Defaults

| Field Type | Default Value |
|------------|--------------|
| `input` | `""` |
| `combobox` | `undefined` |
| All others | `undefined` |

Text inputs default to `""` because they are controlled inputs. All other field types default to `undefined` to indicate "no selection."

## Simple Pattern (No Backend Prefill)

File: `get{FormName}DefaultValues.ts`

```typescript
import { {FormName}DefaultValues } from "./{formName}Schema";

export function get{FormName}DefaultValues({ inquiryId }: { inquiryId: string }) {
  const defaultValues = {
    inquiryId,
    name: "",           // input fields default to ""
    amount: undefined,  // all other fields default to undefined
  } as const satisfies {FormName}DefaultValues;

  return defaultValues;
}
```

## With Backend Prefill

The standard pattern: define base defaults, early-return if no backend data, then spread-merge backend values on top.

```typescript
import { {FormName}DefaultValues } from "./{formName}Schema";
import { BackendType } from "@/shared/backend/models/...";

export function get{FormName}DefaultValues({
  inquiryId,
  backendValues,
}: {
  inquiryId: string;
  backendValues?: BackendType;
}) {
  const defaultValues = {
    inquiryId,
    name: "",
    amount: undefined,
  } as const satisfies {FormName}DefaultValues;

  if (!backendValues) {
    return defaultValues;
  }

  return {
    ...defaultValues,
    name: backendValues.name,
    amount: backendValues.amount ?? defaultValues.amount,
  };
}
```

Key rules:
1. Always define a **base defaults object** with `as const satisfies {FormName}DefaultValues`
2. Always check `if (!backendValues)` and return base defaults early — backend data is nullable
3. Spread `...defaultValues` first, then override with backend values

## Transformation Patterns

When backend types don't match form types, transform at the boundary inside `getDefaultValues`.

### Boolean to YesNoOption

For `yes-no-radio-group` fields where the backend stores booleans:

```typescript
import { transformBooleanToYesNoOption } from "@/shared/components/form/YesNoRadioGroup/options";

return {
  ...defaultValues,
  isSubCommunity: transformBooleanToYesNoOption(backendData.isSubCommunity),
  statementViaEmail: transformBooleanToYesNoOption(backendData.statementViaMail),
};
```

`transformBooleanToYesNoOption` converts `boolean | null | undefined` → `YesNoOptions.YES | YesNoOptions.NO | undefined`.

### Number to String

When the backend returns a number but the form field is a text input:

```typescript
return {
  ...defaultValues,
  investmentDurations: backendData.investmentDuration?.toString() ?? defaultValues.investmentDurations,
};
```

### Enum Casting

When the backend returns a plain string but the form expects a typed option:

```typescript
return {
  ...defaultValues,
  salutation: backendData.salutation
    ? (backendData.salutation as SalutationOption)
    : defaultValues.salutation,
};
```

### Null-Safe Fallback with `??`

Always fall back to the base default when a backend field is null/undefined:

```typescript
return {
  ...defaultValues,
  phoneNumber: backendData.phoneNumber ?? defaultValues.phoneNumber,
  position: backendData.position ?? defaultValues.position,
};
```

## Nested Objects

When the form schema has nested objects, initialize them in the base defaults and map them individually in the merge:

```typescript
const defaultValues = {
  inquiryId,
  subCommunity: {
    isSubCommunity: undefined,
    subCommunitySelfAuthorized: undefined,
  },
  nested: {
    items: [],
    amount: undefined,
  },
} as const satisfies {FormName}DefaultValues;

if (!backendValues) {
  return defaultValues;
}

return {
  ...defaultValues,
  subCommunity: {
    isSubCommunity: transformBooleanToYesNoOption(backendValues.subCommunity),
    subCommunitySelfAuthorized: backendValues.subCommunitySelfAuthorized ?? defaultValues.subCommunity.subCommunitySelfAuthorized,
  },
  nested: {
    items: backendValues.items,
    amount: backendValues.amount ?? defaultValues.nested.amount,
  },
};
```

Do NOT spread nested objects — always rebuild them explicitly to avoid missing fields.

## DefaultValues Type

Always `DeepPartial<{FormName}Type>`, exported from the schema file:

```typescript
// In {formName}Schema.ts
import { DeepPartial } from "@finstreet/forms/rhf";

export type {FormName}DefaultValues = DeepPartial<{FormName}Type>;
```

The `getDefaultValues` function return type is inferred, but the `as const satisfies {FormName}DefaultValues` constraint ensures type safety on the base defaults object.
