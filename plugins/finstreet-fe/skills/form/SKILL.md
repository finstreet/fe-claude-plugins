---
name: form
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

## Path Resolution

Before creating any files, invoke the `finstreet-fe:path-resolver` skill with your input parameters (featureName, subFeatureName, featureType, product, role) to resolve the correct paths. Use the returned **Feature Path** as `parentDirectory` below. The `backend/` directory sits as a sibling at the feature/product/role level.

## Directory Structure

### Standard Form

```
parentDirectory/
  ├── options/                          # Optional - only if select/radio/selectable-cards fields exist
  │   └── use{OptionName}Options.ts
  ├── hooks/                            # Optional - for combobox or cross-field validation hooks
  │   ├── use{HookName}Search.ts        # Only if combobox fields exist
  │   ├── use{HookName}FieldsState.ts   # Only if search hook has a "not found" item
  │   └── use{Name}CrossValidation.ts   # Only if cross-field peer validation exists
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

### Inquiry Details with New Variant

When an inquiry process step also serves as the entry point for creating new inquiries (the "new" page pattern), add a `new/` subdirectory. The `new/` variant reuses the shared schema, fields, options, and FormFields component but has its own form action (which calls `startInquiry` + `updateDetails`), form config (no back button), and form component.

```
parentDirectory/forms/inquiryDetails/
  ├── new/                                        # New inquiry entry point
  │   ├── New{FormName}Form.tsx                   # Uses shared FormFields, own config
  │   ├── new{FormName}FormAction.ts              # Calls startInquiry + updateDetails
  │   └── useNew{FormName}FormConfig.tsx           # No back button, portal-aware
  ├── options/                                    # Shared
  │   └── use{OptionName}Options.ts
  ├── {formName}Schema.ts                         # Shared
  ├── use{FormName}FormFields.ts                  # Shared
  ├── {formName}FormAction.ts                     # Regular update-only action
  ├── get{FormName}DefaultValues.ts               # Shared
  ├── use{FormName}FormConfig.tsx                  # Regular config with back button
  ├── {FormName}FormFields.tsx                    # Shared
  ├── {FormName}Form.tsx                          # Regular form component
  └── mapToPayload.ts                             # Shared payload mapper (optional)
```

For full details on the new inquiry pattern (form action, config, page setup, default values), see [new-inquiry.md](new-inquiry.md).

## File Creation Order

Plan files in this logical sequence to ensure consistent types and imports:

1. **Options** - `options/use{OptionName}Options.ts` (only for select, radio-group, selectable-cards fields)
2. **Hooks** - `hooks/use{HookName}Search.ts` (combobox fields), `hooks/use{HookName}FieldsState.ts` (if search hook has a "not found" item), `hooks/use{Name}CrossValidation.ts` (cross-field peer validation)
3. **Schema** - `{formName}Schema.ts`
4. **useFormFields** - `use{FormName}FormFields.ts`
5. **FormAction** - `{formName}FormAction.ts`
6. **DefaultValues** - `get{FormName}DefaultValues.ts`
7. **useFormConfig** - `use{FormName}FormConfig.tsx`
8. **FormFields** - `{FormName}FormFields.tsx` (skip if only hidden fields)
9. **Form** - `{FormName}Form.tsx`

### Parallel Execution

All file names, types, and imports are deterministic from the `featureName`. After planning the content of all files, write them in parallel:

- **Batch 1**: Options + Combobox Hooks + Schema
- **Batch 2**: All remaining files (useFormFields, FormAction, DefaultValues, useFormConfig, FormFields, Form)

Issue multiple Write tool calls in a single message for each batch. Do NOT create files one at a time.

### Diagnostics

Do NOT run or check diagnostics until ALL files have been written. Files import from each other, so diagnostics will show false errors until the full set exists.

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
import { useExtracted } from "next-intl";

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
- For **Combobox hooks** (search hooks and fields state hooks for combobox fields), see [field-types.md](field-types.md#combobox) and [file-templates.md](file-templates.md#combobox-search-hook)
- For **Schema** patterns (basic, dependent, cross-field peer, array, custom validations), see [schema.md](schema.md)
- For **Field types** reference (all available types and their configs), see [field-types.md](field-types.md)
- For **Default values** (field-type defaults, backend prefill, transformation patterns, nested objects), see [default-values.md](default-values.md)
- For **File templates** (action, config, fields component, form), see [file-templates.md](file-templates.md)
- For **Editing existing forms** (adding/removing fields, changing types, adding prefill, etc.), see [editing.md](editing.md)
- For **External form actions** (buttons outside the form using `formId`, zustand store, and `onPendingChange`), see [external-actions.md](external-actions.md)
- For **Confirmation modal** (form with a confirmation dialog before submission, using `ValidatedSubmitButton` and `ConfirmationModal`), see [confirmation-modal.md](confirmation-modal.md)
- For **New inquiry entry point** (the "new" page that creates an inquiry before updating details), see [new-inquiry.md](new-inquiry.md)

## Hidden Fields and IDs

When a form action needs IDs (e.g., `financingCaseId`), they MUST be:
1. Added to the schema as `z.string().min(1)` or `z.trimmedString().min(1)`
2. Declared as `type: "hidden"` in useFormFields
3. Extracted from `formData` in the form action
4. NEVER rendered in the FormFields component

## Default Values

For field-type defaults, templates, transformation patterns, and nested objects, see [default-values.md](default-values.md).

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
