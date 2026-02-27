# File Templates

Complete templates for each file in the form creation order.

## 0. Combobox Search Hook

File: `hooks/use{HookName}Search.ts`

Create one hook per combobox field. Each hook returns `{ onSelect, onClear, getItems }`.

### Required information to create a combobox hook

To create a combobox search hook, you need:

1. **API function** - The client-side fetch function to call for suggestions (e.g., `getPropertyManagement` from a secure-fetch client module)
2. **Response data type** - The TypeScript type of each item in the API response
3. **Field mapping** - Which API response fields map to which form fields on select (e.g., `data.name` → `setValue("name", ...)`)
4. **Fields to clear** - Which form fields to reset when the user clears the combobox
5. **"Not found" item** (optional) - Whether to include a fallback item when the search finds no match, and what it should do (typically calls `onClear`)
6. **Custom item rendering** (optional) - Whether items need a `renderItem` function for display

### Basic template

```typescript
import { ComboboxItem } from "@finstreet/ui/components/base/Combobox";
import { UseFormSetValue } from "react-hook-form";
import {
  get{ResourceName} as get{ResourceName}Suggestions,
  {ResourceName}ResponseDataType,
  {ResourceName}ResponseType,
} from "@/shared/backend/models/{resource}/client";

type {ResourceName}SuggestionItem = ComboboxItem<{ResourceName}ResponseDataType>;
type {ResourceName}SuggestionItems = {ResourceName}SuggestionItem[];

export function use{ResourceName}Search() {
  const onSelect = (
    { data }: ComboboxItem,
    setValue: UseFormSetValue<any>,
  ) => {
    if (data) {
      setValue("fieldA", data.fieldA, { shouldValidate: true });
      setValue("fieldB", data.fieldB, { shouldValidate: true });
      // ... map all relevant fields
    }
  };

  const onClear = (setValue: UseFormSetValue<any>) => {
    setValue("{comboboxFieldName}", undefined);
    setValue("fieldA", "");
    setValue("fieldB", "");
    // ... reset all fields that onSelect populates
  };

  const getItems = async (
    searchQuery: string,
  ): Promise<{ResourceName}SuggestionItems> => {
    const response = await get{ResourceName}Suggestions({
      pathVariables: { input: searchQuery },
    });

    return mapSearchItems(response);
  };

  return {
    onSelect,
    onClear,
    getItems,
  };
}

function mapSearchItems(data: {ResourceName}ResponseType): {ResourceName}SuggestionItems {
  if (!data) return [];

  return data.map((item) => ({
    label: item.name,
    value: item.name,
    data: item,
  }));
}
```

### With "not found" item

When the search should offer a fallback "not found" option that clears related fields:

```typescript
import { useTranslations } from "next-intl";

export const MANUAL_ENTRY_VALUE = "notFound";

export function use{ResourceName}Search() {
  const t = useTranslations("{translationNamespace}.search");

  const onSelect = (
    { data, value }: ComboboxItem,
    setValue: UseFormSetValue<any>,
  ) => {
    if (value === MANUAL_ENTRY_VALUE) {
      onClear(setValue);
    } else if (data) {
      setValue("name", data.name, { shouldValidate: true });
      setValue("street", data.street, { shouldValidate: true });
      // ... map all relevant fields
    }
  };

  const onClear = (setValue: UseFormSetValue<any>) => {
    setValue("{comboboxFieldName}", undefined);
    setValue("name", "");
    setValue("street", "");
    // ... reset all fields
  };

  const getItems = async (
    searchQuery: string,
  ): Promise<{ResourceName}SuggestionItems> => {
    const response = await get{ResourceName}Suggestions({
      pathVariables: { input: searchQuery },
    });

    const notFoundItem: {ResourceName}SuggestionItem = {
      label: t("notFoundLabel"),
      value: MANUAL_ENTRY_VALUE,
      data: {
        // ... empty/default values for all data fields
      },
    };

    return [notFoundItem, ...mapSearchItems(response)];
  };

  return {
    onSelect,
    onClear,
    getItems,
  };
}
```

### Per-combobox fields state hook

File: `hooks/use{Name}FieldsState.ts` (next to `use{Name}Search.ts`)

Create one hook per combobox that has a "not found" item. It controls the visibility and disabled state of the fields that the combobox populates.

```typescript
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { MANUAL_ENTRY_VALUE } from "./use{Name}Search";

export function use{Name}FieldsState(comboboxFieldName: string) {
  const selectedValue = useWatch({ name: comboboxFieldName });

  const { showDataInputs, fieldsetDisabled } = useMemo(() => {
    if (selectedValue === undefined) {
      return { showDataInputs: false, fieldsetDisabled: false };
    } else if (selectedValue === MANUAL_ENTRY_VALUE) {
      return { showDataInputs: true, fieldsetDisabled: false };
    } else {
      return { showDataInputs: true, fieldsetDisabled: true };
    }
  }, [selectedValue]);

  return { showDataInputs, fieldsetDisabled };
}
```

| `selectedValue`          | `showDataInputs` | `fieldsetDisabled` |
|--------------------------|-------------------|--------------------|
| `undefined`              | `false`           | `false`            |
| `=== MANUAL_ENTRY_VALUE` | `true`            | `false`            |
| anything else            | `true`            | `true`             |

### Usage of fields state hook in FormFields

See the [full FormFields example with fields state hook](#with-combobox-fields-state-hook) in the FormFields Component section below.

### Parameterized hook (reusable across forms)

When the same search logic is used across multiple forms with different field names:

```typescript
type Use{ResourceName}SearchOptions = {
  fieldNameA: string;
  fieldNameB: string;
};

export function use{ResourceName}Search({
  fieldNameA,
  fieldNameB,
}: Use{ResourceName}SearchOptions) {
  const onSelect = (
    { data }: ComboboxItem,
    setValue: UseFormSetValue<FieldValues>,
  ) => {
    if (data) {
      setValue(fieldNameA, data.valueA, { shouldValidate: true });
      setValue(fieldNameB, data.valueB, { shouldValidate: true });
    }
  };

  const onClear = (setValue: UseFormSetValue<FieldValues>) => {
    setValue(fieldNameA, "", { shouldValidate: true });
    setValue(fieldNameB, "", { shouldValidate: true });
  };

  const getItems = async (searchQuery: string) => {
    const response = await get{ResourceName}(searchQuery);
    return mapSearchItems(response);
  };

  return { onSelect, onClear, getItems };
}
```

Import `FieldValues` from `react-hook-form` when using parameterized field names.

### Usage in useFormFields

```typescript
import { use{ResourceName}Search } from "./hooks/use{ResourceName}Search";

export function use{FormName}FormFields(): FormFieldsType<{FormName}Type> {
  const t = useTranslations("{translationNamespace}");
  const { onSelect, onClear, getItems } = use{ResourceName}Search();

  return {
    {comboboxFieldName}: {
      type: "combobox",
      label: t("fields.{comboboxFieldName}.label"),
      onSelect,
      onClear,
      getItems,
    },
    // ... other fields populated by onSelect
  };
}
```

## 1. useFormFields Hook

File: `use{FormName}FormFields.ts`

```typescript
import { FormFieldsType } from "@finstreet/forms";
import { useTranslations } from "next-intl";
import { {FormName}Type } from "./{formName}Schema";
// Import options hooks if needed
// import { use{OptionName}Options } from "./options/use{OptionName}Options";

export function use{FormName}FormFields(): FormFieldsType<{FormName}Type> {
  const t = useTranslations("{translationNamespace}");
  // const someOptions = useSomeOptions();

  return {
    someId: {
      type: "hidden",
    },
    fieldName: {
      type: "input",
      label: t("fields.fieldName.label"),
    },
    // ... more fields
  };
}
```

ALWAYS use `renderCondition` for fields that depend on other field values:

```typescript
return {
  interimFinancingRequested: {
    type: "yes-no-radio-group",
    label: t("fields.interimFinancingRequested.label"),
  },
  interimFinancingAmount: {
    type: "number",
    label: t("fields.interimFinancingAmount.label"),
    renderCondition: (formValues) => {
      return formValues.interimFinancingRequested === YesNoOptions.YES;
    },
  },
};
```

## 2. Form Action

File: `{formName}FormAction.ts`

### Shell action (no backend request yet)

```typescript
"use server";

import {
  {FormName}FormState,
  {FormName}OutputType,
} from "./{formName}Schema";
import { redirect } from "next/navigation";

export async function {formName}FormAction(
  state: {FormName}FormState,
  formData: {FormName}OutputType,
): Promise<{FormName}FormState> {
  console.log({ state, formData });
  redirect("/target/path");
}
```

### With backend request

```typescript
"use server";

import { putSomeResource } from "@/shared/backend/models/someResource/server";
import {
  {FormName}FormState,
  {FormName}OutputType,
} from "./{formName}Schema";
import { handleFormRequestError } from "@/shared/backend/handleFormRequestError";

export async function {formName}FormAction(
  state: {FormName}FormState,
  formData: {FormName}OutputType,
): Promise<{FormName}FormState> {
  const { someId } = formData;

  const result = await putSomeResource({
    pathVariables: { someId },
    payload: {
      field1: formData.field1,
      field2: formData.field2,
    },
  });

  if (result.success) {
    return {
      error: null,
      message: "Erfolgreich gespeichert.",
    };
  } else {
    return handleFormRequestError(result.error);
  }
}
```

ALWAYS return `handleFormRequestError(result.error)` in the error case. Check the backend function config to determine if `pathVariables` and/or `payload` are required.

### With `revalidatePath`

Use `revalidatePath` from `next/cache` to invalidate cached data after mutations. Two common patterns:

**Pattern 1: revalidatePath + redirect** (page forms that navigate after success)

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function {formName}FormAction(
  state: {FormName}FormState,
  formData: {FormName}OutputType,
): Promise<{FormName}FormState> {
  const result = await putSomeResource({ ... });

  if (result.success) {
    const url = "/target/path";
    revalidatePath(url);
    redirect(url);
  } else {
    return handleFormRequestError(result.error);
  }
}
```

**Pattern 2: revalidatePath + return** (modal forms that stay on the same page)

```typescript
if (result.success) {
  revalidatePath(routes.operations.loans.index);
  return { error: null, message: null };
} else {
  return handleFormRequestError(result.error);
}
```

You can revalidate multiple paths if needed:

```typescript
revalidatePath(routes.operations.loans.index);
revalidatePath(routes.operations.loans.details(formData.financingCaseId));
```

### Extra context parameters via closure

When a form action needs additional context (e.g., `portal`, `product`), pass them via a closure in the formConfig. The action signature gets extra parameters:

```typescript
// In formConfig:
const { portal } = usePortal();

serverAction: (state, formData) =>
  {formName}FormAction(state, formData, portal),

// In formAction:
import { Portal } from "@/shared/types/Portal";

export async function {formName}FormAction(
  state: {FormName}FormState,
  formData: {FormName}OutputType,
  portal: Portal,
): Promise<{FormName}FormState> {
  // Use portal for conditional routing:
  const url = portal === "propertyManager"
    ? routes.propertyManager.loans.details(formData.id)
    : routes.operations.loans.details(formData.id);

  revalidatePath(url);
  redirect(url);
}
```

Some actions take multiple extra params:

```typescript
serverAction: (state, formData) =>
  {formName}FormAction(state, formData, portal, product),
```

### No redirect, no backend

```typescript
return {
  error: null,
  message: null,
};
```

### Create / Update actions in one file

```typescript
"use server";

export async function create{FormName}FormAction(
  state: {FormName}FormState,
  formData: {FormName}OutputType,
): Promise<{FormName}FormState> {
  // create logic
}

export async function update{FormName}FormAction(
  state: Update{FormName}FormState,
  formData: Update{FormName}OutputType,
): Promise<Update{FormName}FormState> {
  // update logic - formData will include the id
}
```

## 3. Default Values

File: `get{FormName}DefaultValues.ts`

### Simple (no backend prefill)

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

### With backend prefill

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

Default values by field type:
- `input` fields: `""`
- All other fields: `undefined`

## 4. useFormConfig Hook

File: `use{FormName}FormConfig.tsx`

```tsx
import { FormConfig } from "@finstreet/forms";
import { createFormFieldNames } from "@finstreet/forms/lib";
import { useTranslations } from "next-intl";
import { Button } from "@finstreet/ui/components/base/Button";
import { HStack } from "@styled-system/jsx";
import { FaArrowRight } from "react-icons/fa6";
import { {formName}FormAction } from "./{formName}FormAction";
import {
  {formName}Schema,
  {FormName}FormState,
  {FormName}OutputType,
  {FormName}Type,
  {FormName}DefaultValues,
} from "./{formName}Schema";
import { use{FormName}FormFields } from "./use{FormName}FormFields";

export function use{FormName}FormConfig(
  defaultValues: {FormName}DefaultValues,
): FormConfig<{FormName}FormState, {FormName}Type, {FormName}OutputType> {
  const t = useTranslations("buttons");
  const fields = use{FormName}FormFields();

  return {
    fields,
    defaultValues,
    schema: {formName}Schema,
    fieldNames: createFormFieldNames(fields),
    serverAction: {formName}FormAction,
    useErrorAction: () => {
      return (formState: {FormName}FormState) => {
        console.error(formState?.error);
      };
    },
    renderFormActions: (isPending: boolean) => {
      return (
        <HStack mt={12} justifyContent={"space-between"}>
          <Button loading={isPending} type="submit" icon={<FaArrowRight />}>
            {t("next")}
          </Button>
        </HStack>
      );
    },
  };
}
```

### Without default values parameter

If the form is never prefilled, omit `defaultValues` from the function signature and define them inline:

```tsx
export function use{FormName}FormConfig(): FormConfig<
  {FormName}FormState,
  {FormName}Type,
  {FormName}OutputType
> {
  const t = useTranslations("buttons");
  const fields = use{FormName}FormFields();

  return {
    fields,
    defaultValues: {
      name: "",
      amount: undefined,
    },
    schema: {formName}Schema,
    fieldNames: createFormFieldNames(fields),
    serverAction: {formName}FormAction,
    useErrorAction: () => {
      return (formState: {FormName}FormState) => {
        console.error(formState?.error);
      };
    },
    renderFormActions: (isPending: boolean) => {
      return (
        <HStack mt={12} justifyContent={"space-between"}>
          <Button loading={isPending} type="submit" icon={<FaArrowRight />}>
            {t("submit")}
          </Button>
        </HStack>
      );
    },
  };
}
```

### Modal form config

For forms rendered inside modals, the config needs:
- `usePortal()` for portal-aware server actions
- `useSuccessAction` to close the modal on success
- Cancel button calling `setIsOpen(false)`
- Server action closure passing `portal`

```tsx
import { usePortal } from "@/shared/context/portal/portalContext";

export function use{FormName}FormConfig(
  defaultValues: {FormName}DefaultValues,
  setIsOpen: (open: boolean) => void,
): FormConfig<{FormName}FormState, {FormName}Type, {FormName}OutputType> {
  const t = useTranslations("buttons");
  const { portal } = usePortal();
  const fields = use{FormName}FormFields();

  return {
    fields,
    defaultValues,
    schema: {formName}Schema,
    fieldNames: createFormFieldNames(fields),
    serverAction: (state, formData) =>
      {formName}FormAction(state, formData, portal),
    useSuccessAction: () => {
      return (formState: {FormName}FormState) => {
        setIsOpen(false);
      };
    },
    useErrorAction: () => {
      return (formState: {FormName}FormState) => {
        console.error(formState?.error);
      };
    },
    renderFormActions: (isPending: boolean) => {
      return (
        <HStack mt={12} justifyContent={"space-between"}>
          <Button
            type="button"
            variant="text"
            onClick={() => { setIsOpen(false); }}
          >
            {t("cancel")}
          </Button>
          <Button loading={isPending} type="submit" icon={<FaArrowRight />}>
            {t("submit")}
          </Button>
        </HStack>
      );
    },
  };
}
```

### With back button using `useRouter`

For forms that need a back/cancel button navigating to the previous page:

```tsx
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

const router = useRouter();

renderFormActions: (isPending: boolean) => {
  return (
    <HStack mt={12} justifyContent={"space-between"}>
      <Button
        type="button"
        variant="text"
        icon={<FaArrowLeft />}
        onClick={() => router.back()}
      >
        {t("back")}
      </Button>
      <Button loading={isPending} type="submit" icon={<FaArrowRight />}>
        {t("next")}
      </Button>
    </HStack>
  );
},
```

## 5. FormFields Component

File: `{FormName}FormFields.tsx`

Skip this file if ALL fields in the form are hidden.

```tsx
import { {FormName}Type } from "./{formName}Schema";
import { FieldNamesType, FormFieldsType } from "@finstreet/forms";
import { DynamicFormField } from "@/shared/components/form/DynamicFormField";
import { Fields } from "@finstreet/ui/components/pageLayout/Fields";

type {FormName}FormFieldsProps = {
  fieldNames: FieldNamesType<FormFieldsType<{FormName}Type>>;
};

export const {FormName}FormFields = ({
  fieldNames,
}: {FormName}FormFieldsProps) => {
  return (
    <Fields>
      <DynamicFormField fieldName={fieldNames.fieldName1} />
      <DynamicFormField fieldName={fieldNames.fieldName2} />
      <DynamicFormField fieldName={fieldNames.nested.childField} />
    </Fields>
  );
};
```

NEVER render hidden fields in this component.

### Side-by-Side Fields with `FieldsHStack`

Use `FieldsHStack` and `FieldsHStackItem` for responsive side-by-side field layouts. The `span` prop controls width out of 12 columns.

```tsx
import {
  Fields,
  FieldsHStack,
  FieldsHStackItem,
} from "@finstreet/ui/components/pageLayout/Fields";

<Fields>
  <FieldsHStack>
    <FieldsHStackItem span={8}>
      <DynamicFormField fieldName={fieldNames.street} />
    </FieldsHStackItem>
    <FieldsHStackItem span={4}>
      <DynamicFormField fieldName={fieldNames.houseNumber} />
    </FieldsHStackItem>
  </FieldsHStack>
  <DynamicFormField fieldName={fieldNames.postalCode} />
</Fields>
```

Common span combinations: `8/4` (street/number), `6/6` (equal halves), `3/3/3/3` (quarters).

### Grouped Fields with `Fieldset` / `FieldsetLegend`

Use `Fieldset` to group related fields with an optional legend and disabled state:

```tsx
import {
  Fieldset,
  FieldsetLegend,
} from "@finstreet/ui/components/base/Form/Fieldset";

<Fieldset disabled={!editable}>
  <Fields>
    <FieldsetLegend>{t("fieldSets.person.title")}</FieldsetLegend>
    <DynamicFormField fieldName={fieldNames.firstName} />
    <DynamicFormField fieldName={fieldNames.lastName} />
  </Fields>
</Fieldset>
```

Multiple `Fieldset` blocks can be stacked with `VStack`:

```tsx
<VStack gap={8} alignItems="stretch">
  <Fieldset>
    <Fields>
      <FieldsetLegend>{t("fieldSets.address.title")}</FieldsetLegend>
      <DynamicFormField fieldName={fieldNames.street} />
      <DynamicFormField fieldName={fieldNames.city} />
    </Fields>
  </Fieldset>
  <Fieldset>
    <Fields>
      <FieldsetLegend>{t("fieldSets.contact.title")}</FieldsetLegend>
      <DynamicFormField fieldName={fieldNames.email} />
      <DynamicFormField fieldName={fieldNames.phone} />
    </Fields>
  </Fieldset>
</VStack>
```

### With Combobox Fields State Hook

When a combobox has a "not found" item, use the [per-combobox fields state hook](file-templates.md#per-combobox-fields-state-hook) to conditionally show and disable the fields that the combobox populates. The combobox field itself is always visible; the populated fields appear inside a `<Fieldset>` that is disabled when a real suggestion is selected and editable when the user picks the manual-entry option.

```tsx
import { {FormName}Type } from "./{formName}Schema";
import { FieldNamesType, FormFieldsType } from "@finstreet/forms";
import { DynamicFormField } from "@/shared/components/form/DynamicFormField";
import {
  Fields,
  FieldsHStack,
  FieldsHStackItem,
} from "@finstreet/ui/components/pageLayout/Fields";
import { Fieldset } from "@finstreet/ui/components/base/Form/Fieldset";
import { use{Name}FieldsState } from "./hooks/use{Name}FieldsState";

type {FormName}FormFieldsProps = {
  fieldNames: FieldNamesType<FormFieldsType<{FormName}Type>>;
};

export const {FormName}FormFields = ({
  fieldNames,
}: {FormName}FormFieldsProps) => {
  const { showDataInputs, fieldsetDisabled } = use{Name}FieldsState(
    fieldNames.{comboboxFieldName},
  );

  return (
    <Fields>
      <DynamicFormField fieldName={fieldNames.{comboboxFieldName}} />
      {showDataInputs ? (
        <Fieldset disabled={fieldsetDisabled}>
          <Fields>
            <DynamicFormField fieldName={fieldNames.name} />
            <FieldsHStack>
              <FieldsHStackItem span={4}>
                <DynamicFormField fieldName={fieldNames.postalCode} />
              </FieldsHStackItem>
              <FieldsHStackItem span={8}>
                <DynamicFormField fieldName={fieldNames.city} />
              </FieldsHStackItem>
            </FieldsHStack>
          </Fields>
        </Fieldset>
      ) : null}
    </Fields>
  );
};
```

The hook receives the combobox field name from `fieldNames` so it can watch the selected value. The `<Fieldset disabled>` makes all nested inputs read-only when the user picked a real suggestion (data comes from the API). When the user picks the "not found" sentinel, the fieldset is enabled so they can type manually.

### Conditional JSX with `useWatch`

When you need to conditionally render custom JSX (not just show/hide a DynamicFormField — use `renderCondition` for that), use `useWatch` from `react-hook-form`:

```tsx
import { useWatch } from "react-hook-form";

export const {FormName}FormFields = ({ fieldNames }: {FormName}FormFieldsProps) => {
  const accountType = useWatch({ name: fieldNames.accountType });

  return (
    <Fields>
      <DynamicFormField fieldName={fieldNames.accountType} />
      {accountType === "fixedDeposit" && (
        <SomeCustomComponent />
      )}
    </Fields>
  );
};
```

Import `useWatch` from `react-hook-form` (not from `@finstreet/forms/rhf`).

### With Array Fields

For array fields, create an internal component using `useFieldArray` from `@finstreet/forms/rhf`:

```tsx
import { useFieldArray } from "@finstreet/forms/rhf";
import { InputFieldConfig } from "@finstreet/forms/DynamicFormField";
import { DynamicFormField } from "@/shared/components/form/DynamicFormField";
import { Button } from "@finstreet/ui/components/base/Button";
import { IconButton } from "@finstreet/ui/components/base/IconButton";
import { VStack, HStack, Box } from "@styled-system/jsx";
import { Fields } from "@finstreet/ui/components/pageLayout/Fields";
import { FaPlus, FaTimes } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { FieldNamesType, FormFieldsType } from "@finstreet/forms";
import { {FormName}Type } from "./{formName}Schema";

type IdentifiersFieldProps = {
  fieldNames: FieldNamesType<FormFieldsType<{FormName}Type>>;
  fields: FormFieldsType<{FormName}Type>;
};

const IdentifiersField = ({ fieldNames, fields }: IdentifiersFieldProps) => {
  const t = useTranslations("{namespace}.fields.identifiers");

  const {
    fields: fieldsArray,
    append,
    remove,
    update,
  } = useFieldArray({
    name: fieldNames.identifiers.fieldName,
  });

  useEffect(() => {
    if (fieldsArray.length === 0) {
      append({ identifier: "" });
    }
  }, [fieldsArray, append]);

  const handleRemove = (index: number) => {
    if (fieldsArray.length === 1) {
      update(index, { identifier: "" });
      return;
    }
    remove(index);
  };

  return (
    <Fields>
      <VStack gap={8} alignItems="stretch">
        {fieldsArray.map((field, index) => (
          <HStack key={field.id} gap={4} justifyContent="stretch" alignItems="flex-start">
            <Box flexGrow={1}>
              <DynamicFormField
                fieldName={`${fieldNames.identifiers.fieldName}.${index}.${fieldNames.identifiers.fields.identifier}`}
                fieldConfig={{
                  ...fields.identifiers.identifier,
                  label: t("label", { number: index + 1 }),
                } as InputFieldConfig<any, any>}
              />
            </Box>
            <Box mt={9}>
              <IconButton
                onClick={() => handleRemove(index)}
                Icon={FaTimes}
                variant="onlyIcon"
                size="l"
              />
            </Box>
          </HStack>
        ))}
      </VStack>
      <HStack>
        <Button
          onClick={() => append({ identifier: "" })}
          variant="secondary"
          type="button"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              append({ identifier: "" });
            }
          }}
        >
          <FaPlus />
          {t("add")}
        </Button>
      </HStack>
    </Fields>
  );
};
```

The array field name pattern is: `${parentFieldName}.${index}.${childFieldName}`

When using array fields, the FormFields component needs both `fieldNames` AND `fields` props:

```tsx
type {FormName}FormFieldsProps = {
  fieldNames: FieldNamesType<FormFieldsType<{FormName}Type>>;
  fields: FormFieldsType<{FormName}Type>;
};
```

## 6. Form Component

File: `{FormName}Form.tsx`

```tsx
"use client";

import { Form } from "@/shared/components/form/Form";
import { use{FormName}FormConfig } from "./use{FormName}FormConfig";
import { {FormName}FormFields } from "./{FormName}FormFields";
import { {FormName}DefaultValues } from "./{formName}Schema";

type {FormName}FormProps = {
  defaultValues: {FormName}DefaultValues;
};

export const {FormName}Form = ({ defaultValues }: {FormName}FormProps) => {
  const config = use{FormName}FormConfig(defaultValues);

  return (
    <Form formConfig={config}>
      <{FormName}FormFields fieldNames={config.fieldNames} />
    </Form>
  );
};
```

### Inside an Inquiry Process

Add the `Validity` component:

```tsx
import { Validity } from "@finstreet/forms/ProgressBar";
import { {InquiryName}InquiryProcessSteps } from "@/features/{inquiryName}InquiryProcess/{inquiryName}InquiryProcess.types";

export const {FormName}Form = ({ defaultValues }: {FormName}FormProps) => {
  const config = use{FormName}FormConfig(defaultValues);

  return (
    <Form formConfig={config}>
      <{FormName}FormFields fieldNames={config.fieldNames} />
      <Validity<{InquiryName}InquiryProcessSteps>
        stepId={{InquiryName}InquiryProcessSteps.STEP_NAME}
      />
    </Form>
  );
};
```

Check the parent directory for a `.types` file to find the correct InquiryProcessSteps enum.

### Without default values

```tsx
export const {FormName}Form = () => {
  const config = use{FormName}FormConfig();

  return (
    <Form formConfig={config}>
      <{FormName}FormFields fieldNames={config.fieldNames} />
    </Form>
  );
};
```

### Only hidden fields (no visible FormFields)

```tsx
export const {FormName}Form = ({ defaultValues }: {FormName}FormProps) => {
  const config = use{FormName}FormConfig(defaultValues);

  return (
    <Form formConfig={config}>
      <></>
    </Form>
  );
};
```

### With array fields (pass fields to FormFields)

```tsx
export const {FormName}Form = ({ defaultValues }: {FormName}FormProps) => {
  const config = use{FormName}FormConfig(defaultValues);

  return (
    <Form formConfig={config}>
      <{FormName}FormFields fieldNames={config.fieldNames} fields={config.fields} />
    </Form>
  );
};
```
