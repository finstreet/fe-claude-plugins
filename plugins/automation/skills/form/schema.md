# Schema Reference

The schema lives in `{formName}Schema.ts` and is the foundation of every form. It defines validation rules and generates the types used across all other form files.

## Custom Zod Implementation

ALWAYS import zod from the project's custom implementation:

```typescript
import * as z from "@/lib/zod";
```

This provides extra utilities like `trimmedString()`.

## Basic Schema

```typescript
import * as z from "@/lib/zod";

export const legalRepresentativeFormSchema = z.object({
  firstName: z.trimmedString().min(1).max(50),
  lastName: z.trimmedString().min(1).max(50),
  birthDate: BirthDateValidationSchema,
  street: StreetValidationSchema,
  houseNumber: z.trimmedString().min(1).max(6),
  postalCode: PostalCodeValidationSchema,
  city: CityValidationSchema,
  financingCaseId: z.trimmedString().min(1),
});
```

## Dependent Field Validations

When fields should only be validated based on another field's value, use `superRefine`. The key pattern is to **group the trigger field and its dependent fields into a separate named sub-schema**, then compose that sub-schema as a nested property in the main schema. This nesting is important because it scopes the superRefine validation to only the related fields and creates the nested type structure that useFormFields, defaultValues, and FormFields all depend on.

1. Create a **separate sub-schema** containing the trigger field and all its dependent fields
2. Make dependent fields `.optional()` in the sub-schema's base object
3. Use `.superRefine()` on the sub-schema to apply real validation when the condition is met
4. Compose the sub-schema into the main schema as a **nested property**

**Example — conditional number field based on Yes/No trigger:**

```typescript
// 1. Group trigger + dependent fields in a named sub-schema
const MaintenanceArrearsInfoSchema = z
  .object({
    maintenanceFeesArrears: YesNoValidationSchema,           // trigger field
    maintenanceFeesArrearsUnitCount: z.coerce.number().optional(), // dependent, optional in base
  })
  .superRefine((data, ctx) => {
    // 3. Apply real validation when trigger condition is met
    if (data.maintenanceFeesArrears) {
      const result = z.coerce.number().min(1).safeParse(data.maintenanceFeesArrearsUnitCount);
      if (!result.success && result.error.issues[0]) {
        ctx.addIssue({
          ...result.error.issues[0],
          message: undefined,
          path: ["maintenanceFeesArrearsUnitCount"],
        });
      }
    }
  });

// 4. Compose into the main schema as a nested property
export const additionalInformationSchema = z.object({
  propertyManagementExistingLiabilityInsurance: YesNoValidationSchema,
  maintenanceFeesArrearsInfo: MaintenanceArrearsInfoSchema, // nested!
  buildingInsurance: YesNoValidationSchema,
  financingCaseId: z.string(),
});
```

This nesting cascades through the rest of the form:
- **useFormFields**: dependent fields are nested under the sub-schema key (e.g., `maintenanceFeesArrearsInfo: { maintenanceFeesArrears: {...}, maintenanceFeesArrearsUnitCount: {...} }`)
- **defaultValues**: defaults mirror the nested structure
- **FormFields**: uses nested fieldNames (e.g., `fieldNames.maintenanceFeesArrearsInfo.maintenanceFeesArrears`)

**Larger example with multiple dependent fields:**

```typescript
const accountSchema = z
  .object({
    accountType: z.string().array().min(1),
    investmentAmount: z.coerce.number().optional(),
    investmentDurations: z.string().optional(),
    debitDate: DateValidationSchema.optional(),
    automaticProlongation: YesNoValidationSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasFixedDeposit = data.accountType.includes(
      AccountKindOptions.HOA_FIXED_DEPOSIT,
    );

    if (hasFixedDeposit) {
      const investmentAmountResult = z.coerce
        .number()
        .min(1000)
        .max(1000000000)
        .safeParse(data.investmentAmount);

      if (
        !investmentAmountResult.success &&
        investmentAmountResult.error.issues[0]
      ) {
        ctx.addIssue({
          ...investmentAmountResult.error.issues[0],
          message: undefined,
          path: ["investmentAmount"],
        });
      }
      // Repeat for other dependent fields...
    }
  });

// Compose into final schema as a nested property
const hoaAccountDetailsSchema = z.object({
  account: accountSchema,
  statementViaEmail: YesNoValidationSchema,
});
```

## Cross-Field Peer Validation

Unlike dependent validation (where one field controls whether another is required), cross-field peer validation is when two sibling fields validate **against each other** with a mutual constraint (e.g., their combined value must meet a minimum). The mechanics are the same — group fields in a named sub-schema with `superRefine` — but the `superRefine` adds issues to **both** field paths.

**Example — two number fields whose sum must be ≥ 4:**

```typescript
import { CustomErrorType } from "@/shared/backend/customErrors";

const unitCountSchema = z
  .object({
    residential: z.coerce.number().min(0),
    commercial: z.coerce.number().min(0),
  })
  .superRefine((data, ctx) => {
    const total = (data.residential ?? 0) + (data.commercial ?? 0);
    if (total < 4) {
      // Add issue to BOTH paths so both fields show the error
      ctx.addIssue({
        code: "custom",
        path: ["residential"],
        params: { errorType: CustomErrorType.COMBINED_UNIT_COUNT_TOO_LOW },
      });
      ctx.addIssue({
        code: "custom",
        path: ["commercial"],
        params: { errorType: CustomErrorType.COMBINED_UNIT_COUNT_TOO_LOW },
      });
    }
  });

// Compose into the main schema as a nested property
export const buildingDetailsSchema = z.object({
  unitCount: unitCountSchema, // nested!
  buildingYear: z.coerce.number().min(1800).max(2100),
  financingCaseId: z.string(),
});
```

This nesting cascades through the rest of the form the same way as dependent validation:
- **useFormFields**: fields are nested under the sub-schema key (e.g., `unitCount: { residential: {...}, commercial: {...} }`)
- **defaultValues**: defaults mirror the nested structure
- **FormFields**: uses nested fieldNames (e.g., `fieldNames.unitCount.residential`)

> **Important:** A sub-schema `superRefine` only re-runs for the field currently being edited. If the user changes `residential`, the `commercial` field's error state won't update until the user interacts with it. To make both fields validate simultaneously, you need a **cross-validation trigger hook** — see [file-templates.md](file-templates.md#cross-field-validation-trigger-hook).

## Array Fields

For forms needing multiple entries of the same type:

```typescript
const additionalDetailsSchema = z.object({
  institutionalIdentifiers: z.array(
    z.object({
      identifier: InstitutionalIdentifierValidationSchema,
    }),
  ),
});
```

## Custom Validations

Import from `@/shared/validations/` or `@finstreet/forms/customValidations`:

| Validation | Use For |
|------------|---------|
| `YesNoValidationSchema` | `yes-no-radio-group` fields |
| `RequiredCheckboxValidation` | Required `checkbox` fields |
| `DateValidationSchema` | `datepicker` fields |
| `PostalCodeValidation` | Postal code inputs |
| `PhoneNumberValidation` | Phone number inputs |

```typescript
import { YesNoValidationSchema } from "@/shared/validations/YesNoValidationSchema";
```

## Required Type Exports

Every schema file MUST end with these exports:

```typescript
import { FormConfig, FormState } from "@finstreet/forms";
import { DeepPartial } from "@finstreet/forms/rhf";

export type {FormName}Type = z.input<typeof {formName}Schema>;
export type {FormName}OutputType = z.output<typeof {formName}Schema>;
export type {FormName}FormState = FormState;
export type {FormName}FormConfig = FormConfig<{FormName}FormState, {FormName}Type, {FormName}OutputType>;
export type {FormName}DefaultValues = DeepPartial<{FormName}Type>;
```

## Dynamic Schema Functions

When schema validation depends on runtime data (e.g., date ranges from an API response), create a function that returns the schema:

```typescript
import * as z from "@/lib/zod";
import dayjs from "dayjs";

export function use{FormName}Schema(minDate: string, maxDate: string) {
  return z
    .object({
      debitDate: z.trimmedString().min(1),
      // ... other fields
    })
    .superRefine((data, ctx) => {
      const parsed = dayjs(data.debitDate, "YYYY-MM-DD");
      if (parsed.isBefore(dayjs(minDate))) {
        ctx.addIssue({
          code: "custom",
          path: ["debitDate"],
          params: { errorType: CustomErrorType.DATE_TOO_EARLY, date: minDate },
        });
      }
      if (parsed.isAfter(dayjs(maxDate))) {
        ctx.addIssue({
          code: "custom",
          path: ["debitDate"],
          params: { errorType: CustomErrorType.DATE_TOO_LATE, date: maxDate },
        });
      }
    });
}
```

In the formConfig, call the function with values from the API:

```typescript
schema: use{FormName}Schema(options.minDate, options.maxDate),
```

Type exports for dynamic schemas use `ReturnType`:

```typescript
export type {FormName}Type = z.input<ReturnType<typeof use{FormName}Schema>>;
export type {FormName}OutputType = z.output<ReturnType<typeof use{FormName}Schema>>;
```

## Conditional Schema with `.omit()`

When certain fields should only be validated based on a condition (e.g., a permission flag), use `.omit()` in the formConfig:

```typescript
// In useFormConfig:
schema: fieldRequired
  ? {formName}Schema
  : {formName}Schema.omit({ conditionalField: true }),
```

Real example — omitting a field when not required by permissions:

```typescript
schema: propertyManagementTaxIdRequired
  ? additionalInformationSchema
  : additionalInformationSchema.omit({ propertyManagementTaxId: true }),
```

This is preferred over making the field `.optional()` when the field's visibility is determined by external conditions (not form values).

## Create / Update Schema Pattern

For forms with both create and update, export a base schema and an extended one:

```typescript
export const {formName}Schema = z.object({
  name: z.trimmedString().min(1),
  email: z.trimmedString().email(),
});

export const update{FormName}Schema = {formName}Schema.extend({
  id: z.trimmedString().min(1),
});
```
