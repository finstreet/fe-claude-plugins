---
name: form-skill
description: "Complete guide to implementing forms using the @finstreet/forms library. Covers the full file creation order: options, schema, useFormFields, formAction, getDefaultValues, useFormConfig, FormFields component, and Form component. Use when building, modifying, or debugging any form in the finstreet context."
---

# @finstreet/forms - Complete Form Guide

This project uses `@finstreet/forms`, a type-safe form library built on react-hook-form, Zod, and custom UI components. Every form follows a strict file structure and creation order.

## Architecture

```
Form Component ("use client")
  └── uses <Form> wrapper from @/shared/components/form/Form
       ├── react-hook-form (FormProvider) for field state + validation
       ├── Zod schema for validation (via zodResolver)
       ├── useActionState for server action integration
       ├── DynamicFormField for rendering fields by type
       └── FormConfig drives everything: schema, fields, actions, UI
```

## Directory Structure

### Standard Form

```
parentDirectory/
  ├── options/                          # Optional - only if select/radio/selectable-cards fields exist
  │   └── use{OptionName}Options.ts
  ├── hooks/                            # Optional - only if combobox fields exist
  │   └── use{HookName}Search.ts
  ├── {formName}Schema.ts
  ├── use{FormName}FormFields.ts
  ├── {formName}FormAction.ts
  ├── get{FormName}DefaultValues.ts
  ├── use{FormName}FormConfig.tsx
  ├── {FormName}FormFields.tsx          # Skip if ALL fields are hidden
  └── {FormName}Form.tsx
```

### Create / Update Form

When a form is used for both creating and updating a model:

```
parentDirectory/
  ├── create/
  │   ├── Create{FormName}Form.tsx
  │   └── useCreate{FormName}FormConfig.tsx
  ├── update/
  │   ├── Update{FormName}Form.tsx
  │   └── useUpdate{FormName}FormConfig.tsx
  ├── {formName}FormAction.ts           # Shared - exports create + update actions
  ├── {FormName}FormFields.tsx          # Shared
  ├── {formName}Schema.ts               # Shared - base schema + extended schema with ID
  └── use{FormName}FormFields.ts        # Shared
```

## File Creation Order

ALWAYS create files in this exact sequence:

1. **Options** - `options/use{OptionName}Options.ts` (only for select, radio-group, selectable-cards fields)
2. **Combobox Hooks** - `hooks/use{HookName}Search.ts` (only for combobox fields)
3. **Schema** - `{formName}Schema.ts`
4. **useFormFields** - `use{FormName}FormFields.ts`
5. **FormAction** - `{formName}FormAction.ts`
6. **DefaultValues** - `get{FormName}DefaultValues.ts`
7. **useFormConfig** - `use{FormName}FormConfig.tsx`
8. **FormFields** - `{FormName}FormFields.tsx` (skip if only hidden fields)
9. **Form** - `{FormName}Form.tsx`

## Key Imports

```typescript
// Types and core
import { FormConfig, FormState, FormFieldsType, FieldNamesType } from "@finstreet/forms";
import { createFormFieldNames } from "@finstreet/forms/lib";
import { createDynamicFormField } from "@finstreet/forms";

// Custom validations - ALWAYS import from @finstreet/forms/customValidations
import { YesNoValidationSchema, YesNoOptions, trimmedString } from "@finstreet/forms/customValidations";

// Zod - ALWAYS use the project's custom implementation
import * as z from "@/lib/zod";

// DynamicFormField - ALWAYS use the project's shared component
import { DynamicFormField } from "@/shared/components/form/DynamicFormField";

// Form component
import { Form } from "@/shared/components/form/Form";

// react-hook-form - ALWAYS import from @finstreet/forms/rhf
import { DeepPartial, useFieldArray } from "@finstreet/forms/rhf";

// UI components
import { Button } from "@finstreet/ui/components/base/Button";
import { HStack, VStack, Box } from "@styled-system/jsx";
import { Fields, FieldsHStack, FieldsHStackItem } from "@finstreet/ui/components/pageLayout/Fields";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { Fieldset, FieldsetLegend } from "@finstreet/ui/components/base/Form/Fieldset";

// Translations
import { useTranslations } from "next-intl";

// Date parsing for datepicker constraints (minDate/maxDate)
import { parseDate } from "@ark-ui/react";

// Boolean to YesNo mapping for default values
import { transformBooleanToYesNoOption } from "@/shared/components/form/YesNoRadioGroup/options";

// Cache revalidation in form actions
import { revalidatePath } from "next/cache";

// Portal and product context (for modal forms and portal-aware actions)
import { usePortal } from "@/shared/context/portal/portalContext";
import { useProduct } from "@/shared/context/product/productContext";
import { Portal, Product } from "@/shared/types/Portal";

// Router for back navigation in formConfig
import { useRouter } from "next/navigation";

// Conditional rendering in FormFields beyond renderCondition
import { useWatch } from "react-hook-form";

// Combobox types (for search hooks)
import { ComboboxItem } from "@finstreet/ui/components/base/Combobox";
import { UseFormSetValue } from "react-hook-form";
```

## Step-by-Step Reference

Each step has detailed documentation in a supporting file:

- For **Options** patterns, see [options.md](options.md)
- For **Combobox hooks** (search hooks for combobox fields), see [field-types.md](field-types.md#combobox) and [file-templates.md](file-templates.md#combobox-search-hook)
- For **Schema** patterns (basic, dependent, array, custom validations), see [schema.md](schema.md)
- For **Field types** reference (all available types and their configs), see [field-types.md](field-types.md)
- For **File templates** (action, config, fields component, form, default values), see [file-templates.md](file-templates.md)
- For **Editing existing forms** (adding/removing fields, changing types, adding prefill, etc.), see [editing.md](editing.md)

## Hidden Fields and IDs

When a form action needs IDs (e.g., `financingCaseId`), they MUST be:
1. Added to the schema as `z.string().min(1)` or `z.trimmedString().min(1)`
2. Declared as `type: "hidden"` in useFormFields
3. Extracted from `formData` in the form action
4. NEVER rendered in the FormFields component

## Default Values by Field Type

| Field Type | Default Value |
|------------|--------------|
| `input` | `""` |
| `combobox` | `undefined` |
| All others | `undefined` |

When backend returns booleans for `yes-no-radio-group` fields, map them using `transformBooleanToYesNoOption`:

```typescript
import { transformBooleanToYesNoOption } from "@/shared/components/form/YesNoRadioGroup/options";

return {
  ...defaultValues,
  isSubCommunity: transformBooleanToYesNoOption(backendValues.isSubCommunity),
};
```

This converts `boolean | null | undefined` → `YesNoOptions.YES | YesNoOptions.NO | undefined`.

## FormState Type

Always the same across all forms:

```typescript
type FormState = {
  error: string | null;
  message: string | null;
} | null;
```

## Types to Export from Schema

Every schema file MUST export these types:

```typescript
import { FormConfig, FormState } from "@finstreet/forms";
import { DeepPartial } from "@finstreet/forms/rhf";

export type {FormName}Type = z.input<typeof {formName}Schema>;
export type {FormName}OutputType = z.output<typeof {formName}Schema>;
export type {FormName}FormState = FormState;
export type {FormName}FormConfig = FormConfig<{FormName}FormState, {FormName}Type, {FormName}OutputType>;
export type {FormName}DefaultValues = DeepPartial<{FormName}Type>;
```
