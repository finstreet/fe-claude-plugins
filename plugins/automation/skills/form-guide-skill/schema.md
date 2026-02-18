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

When fields should only be validated based on another field's value, use `superRefine`:

1. Make dependent fields `.optional()` in the base object
2. Use `.superRefine()` to apply real validation when the condition is met

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

// Compose into final schema
const hoaAccountDetailsSchema = z.object({
  account: accountSchema,
  statementViaEmail: YesNoValidationSchema,
});
```

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
