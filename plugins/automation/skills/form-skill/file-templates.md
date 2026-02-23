# File Templates

Complete templates for each file in the form creation order.

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

### With cancel button (e.g., in a modal)

```tsx
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
