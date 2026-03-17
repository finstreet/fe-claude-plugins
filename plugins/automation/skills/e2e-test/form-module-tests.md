# Form Module Tests

## When to Use

Use `FormModule<T>` when a feature has a **standalone form** that:
- Validates input and shows field errors on invalid submission
- Submits valid data
- Navigates back to an overview page after successful submission
- Optionally shows a confirmation modal before navigation

## Step-by-Step Guide

### 1. Add dataTestIds

Add a navigation button test ID to `e2e/data/dataTestIds.ts`:

```typescript
export const dataTestIds = {
  // ...
  {product}: {
    financingCase: {
      pm: {
        // ...
        goTo{Feature}Action: "{product}-financingCase-pm-goTo{Feature}Action",
      },
    },
  },
};
```

### 2. Create Test Data

**File:** `e2e/data/{product}/{feature}TestData.ts`

```typescript
import { {Feature}FormType } from "@/features/{feature}/forms/{feature}Form/{feature}FormSchema";

export const {feature}TestData = {
  valid: {
    // All fields with values that pass validation
    field1: "valid value",
    field2: "valid value",
  } satisfies {Feature}FormType,

  invalid: {
    // Fields with values that trigger the errors you will assert on
    field1: "",
    field2: "INVALID_VALUE",
  },
};
```

**Rules:**
- Import the schema type from `@/features/...`
- Use `satisfies` on `valid` for type safety
- `invalid` should trigger validation errors for the fields you'll assert on
- Import option enums from source (e.g. `UsagePurposes`, `YesNoOptions`)

### 3. Create FormModule Subclass

**File:** `e2e/modules/{product}/{Feature}Module.ts`

```typescript
import { Page, test } from "@playwright/test";
import { FormModule } from "../FormModule";
import { BaseField } from "@finstreet/forms";
import { {Feature}FormType } from "@/features/{feature}/forms/{feature}Form/{feature}FormSchema";
import { dataTestIds } from "e2e/data/dataTestIds";
import { routes } from "@/routes";
import { {feature}TestData } from "e2e/data/{product}/{feature}TestData";

export class {Feature}Module extends FormModule<{Feature}FormType> {
  constructor(page: Page) {
    super(page);
  }

  async navigate(caseId: string): Promise<void> {
    await this.navigation.navigateToSection(
      dataTestIds.{product}.financingCase.pm.goTo{Feature}Action,
      routes.pm.{product}.financingCase.{feature}(caseId),
    );
  }

  async setupWithValidation(financingCaseId: string): Promise<void> {
    await test.step("{Feature} validation and submission", async () => {
      await this.navigate(financingCaseId);

      await this.executeValidationAndSubmit({
        validData: {feature}TestData.valid,
        invalidData: {feature}TestData.invalid,
        expectedErrorFields: ["field1", "field2"],
        expectedUrl: routes.pm.{product}.financingCase.overview(financingCaseId),
        testName: "{Feature} Validation and Submission",
        // withConfirmation: true,  // if the form shows a confirmation modal
      });
    });
  }

  async fillAndSubmitForm(formData: {Feature}FormType): Promise<void> {
    await this.form.fillField({
      fieldName: "field1",
      fieldType: BaseField.INPUT,
      value: formData.field1,
    });

    await this.form.fillField({
      fieldName: "field2",
      fieldType: BaseField.INPUT,
      value: formData.field2,
    });

    await this.form.submit();
  }
}
```

### 4. Register on Parent Page

Add the module as a `readonly` property on the overview page:

```typescript
// e2e/pages/{product}/PM{Product}FinancingCaseOverviewPage.ts
import { {Feature}Module } from "e2e/modules/{product}/{Feature}Module";

export class PM{Product}FinancingCaseOverviewPage extends BasePage {
  readonly {feature}: {Feature}Module;
  // ... other modules

  constructor(page: Page) {
    super(page);
    this.{feature} = new {Feature}Module(page);
    // ...
  }
}
```

### 5. Call from Spec or Happy Path

```typescript
// In a happy path spec:
await pm{Product}FinancingCaseOverviewPage.{feature}.setupWithValidation(financingCaseId);

// Or wrapped in test.step:
await test.step("Fill in and confirm {feature}", async () => {
  await pm{Product}FinancingCaseOverviewPage.{feature}.setupWithValidation(financingCaseId);
});
```

## ValidationSubmitOptions Explained

| Option | Type | Description |
|---|---|---|
| `validData` | `TFormData` | Data that passes validation and submits successfully |
| `invalidData` | `TFormData` | Data that fails validation, triggering error messages |
| `expectedErrorFields` | `string[]` | Field names expected to show `${fieldName}-error` test IDs |
| `expectedUrl` | `string` | URL the page navigates to after successful submission |
| `testName` | `string` | Label for `test.step` in the HTML report |
| `afterReloadCallback` | `() => Promise<void>` | Optional: runs after page reload (e.g., re-open modal) |
| `withConfirmation` | `boolean` | When `true`, clicks confirmation modal submit button before waiting for URL |

## The Validation-Submit Cycle

`executeValidationAndSubmit` runs these steps automatically:

1. **Submit invalid data** — calls `fillAndSubmitForm(invalidData)`, then asserts that each field in `expectedErrorFields` has a visible error message
2. **Reload and submit valid data** — reloads page (clears dirty state), optionally runs `afterReloadCallback`, then calls `fillAndSubmitForm(validData)`
3. **Confirmation (optional)** — if `withConfirmation: true`, clicks `dataTestIds.confirmationModalConfirm.submitButton`
4. **Wait for navigation** — waits for the browser to navigate to `expectedUrl`, then waits 5s for page load

## Confirmation Modal Variant

When a form shows a confirmation modal before navigating, set `withConfirmation: true`:

```typescript
await this.executeValidationAndSubmit({
  validData: {feature}TestData.valid,
  invalidData: {feature}TestData.invalid,
  expectedErrorFields: ["field1", "field2"],
  expectedUrl: routes.pm.{product}.financingCase.overview(financingCaseId),
  testName: "{Feature} Validation and Submission",
  withConfirmation: true,
});
```

## Field Types Reference

Use the appropriate `BaseField` type for each form field in `fillAndSubmitForm`:

| Field type | `BaseField` value |
|---|---|
| Text input | `BaseField.INPUT` |
| Number input | `BaseField.NUMBER` |
| Textarea | `BaseField.TEXTAREA` |
| Datepicker | `BaseField.DATEPICKER` |
| Yes/No radio group | `BaseField.YES_NO_RADIO_GROUP` |
| Selectable cards | `BaseField.SELECTABLE_CARDS` |

Conditional fields (e.g. only shown when another field has a specific value) should be guarded with an `if` check before calling `fillField`.
