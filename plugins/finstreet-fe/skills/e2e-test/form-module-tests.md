# Form Module Tests

## When to Use

Use `FormModule<T>` when a feature has a **standalone form** that:
- Validates input and shows field errors on invalid submission
- Submits valid data
- Navigates back to an overview page after successful submission
- Optionally shows a confirmation modal before navigation

Examples: Financing details, SEPA mandate, reference account, additional information.

## Step-by-Step Guide

### 1. Add dataTestIds

Add navigation button test ID to `e2e/data/dataTestIds.ts`:

```typescript
export const dataTestIds = {
  // ...
  hoaAccount: {
    financingCase: {
      pm: {
        // ...
        goToReferenceAccountAction: "hoaAccount-financingCase-pm-goToReferenceAccountAction",
      },
    },
  },
};
```

### 2. Create Test Data

**File:** `e2e/data/{product}/{feature}TestData.ts`

```typescript
import { UpdateReferenceAccountType } from "@/features/referenceAccount/forms/updateReferenceAccountForm/updateReferenceAccountFormSchema";

export const referenceAccountTestData = {
  valid: {
    financingCaseId: "test-financing-case-123",
    bankAccountOwner: "Max Mustermann",
    iban: "DE89370400440532013000",
  } satisfies UpdateReferenceAccountType,

  invalid: {
    financingCaseId: "test-financing-case-123",
    bankAccountOwner: "",
    iban: "INVALID_IBAN",
  },
};
```

**Rules:**
- Import the schema type from `@/features/...`
- Use `satisfies` on `valid` for type safety
- `invalid` should trigger validation errors for the fields you'll assert on
- Import option enums from source (e.g., `UsagePurposes`, `YesNoOptions`)

### 3. Create FormModule Subclass

**File:** `e2e/modules/{product}/{Feature}Module.ts`

```typescript
import { Page, test } from "@playwright/test";
import { FormModule } from "../FormModule";
import { BaseField } from "@finstreet/forms";
import { UpdateReferenceAccountType } from "@/features/referenceAccount/forms/updateReferenceAccountForm/updateReferenceAccountFormSchema";
import { dataTestIds } from "e2e/data/dataTestIds";
import { routes } from "@/routes";
import { referenceAccountTestData } from "e2e/data/hoaAccount/referenceAccountTestData";

export class ReferenceAccountModule extends FormModule<UpdateReferenceAccountType> {
  constructor(page: Page) {
    super(page);
  }

  async navigate(caseId: string): Promise<void> {
    await this.navigation.navigateToSection(
      dataTestIds.hoaAccount.financingCase.pm.goToReferenceAccountAction,
      routes.pm.hoaAccount.financingCase.sepaMandate(caseId),
    );
  }

  async setupWithValidation(financingCaseId: string): Promise<void> {
    await test.step("Fill in and confirm reference account", async () => {
      await this.navigate(financingCaseId);

      await this.executeValidationAndSubmit({
        validData: referenceAccountTestData.valid,
        invalidData: referenceAccountTestData.invalid,
        expectedErrorFields: ["bankAccountOwner", "iban"],
        expectedUrl: routes.pm.hoaAccount.financingCase.overview(financingCaseId),
        testName: "Reference Account Validation and Submission",
      });
    });
  }

  async fillAndSubmitForm(formData: UpdateReferenceAccountType): Promise<void> {
    await this.form.fillField({
      fieldName: "bankAccountOwner",
      fieldType: BaseField.INPUT,
      value: formData.bankAccountOwner,
    });

    await this.form.fillField({
      fieldName: "iban",
      fieldType: BaseField.INPUT,
      value: formData.iban,
    });

    await this.form.submit();
  }
}
```

### 4. Register on Parent Page

Add the module as a `readonly` property on the overview page:

```typescript
// e2e/pages/{product}/PM{Product}FinancingCaseOverviewPage.ts
import { ReferenceAccountModule } from "e2e/modules/hoaAccount/ReferenceAccountModule";

export class PMHoaAccountFinancingCaseOverviewPage extends BasePage {
  readonly referenceAccount: ReferenceAccountModule;
  // ... other modules

  constructor(page: Page) {
    super(page);
    this.referenceAccount = new ReferenceAccountModule(page);
    // ...
  }
}
```

### 5. Call from Spec or Happy Path

```typescript
// In a happy path spec:
await pmHoaAccountFinancingCaseOverviewPage.referenceAccount.setupWithValidation(
  financingCaseId,
);

// Or wrapped in test.step:
await test.step("Fill in and confirm reference account", async () => {
  await pmHoaAccountFinancingCaseOverviewPage.referenceAccount.setupWithValidation(
    financingCaseId,
  );
});
```

## Complete FormModule Pattern

### Module Structure

Every FormModule subclass follows this pattern:

```typescript
export class MyFeatureModule extends FormModule<MyFormType> {
  constructor(page: Page) {
    super(page);
  }

  // Navigate from overview page to the form page
  async navigate(caseId: string): Promise<void> {
    await this.navigation.navigateToSection(
      dataTestIds.{product}.financingCase.pm.goTo{Feature}Action,
      routes.pm.{product}.financingCase.{feature}(caseId),
    );
  }

  // Public entry point: navigate + validate + submit
  async setupWithValidation(financingCaseId: string): Promise<void> {
    await test.step("{Feature} validation and submission", async () => {
      await this.navigate(financingCaseId);

      await this.executeValidationAndSubmit({
        validData: featureTestData.valid,
        invalidData: featureTestData.invalid,
        expectedErrorFields: ["field1", "field2"],
        expectedUrl: routes.pm.{product}.financingCase.overview(financingCaseId),
        testName: "{Feature} Validation and Submission",
        // withConfirmation: true,  // if form shows confirmation modal
      });
    });
  }

  // Fill all fields and submit
  async fillAndSubmitForm(formData: MyFormType): Promise<void> {
    await this.form.fillField({
      fieldName: "fieldName",
      fieldType: BaseField.INPUT,
      value: formData.fieldName,
    });
    // ... more fields
    await this.form.submit();
  }
}
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

When a form shows a confirmation modal before navigating:

```typescript
await this.executeValidationAndSubmit({
  validData: sepaMandateTestData.valid,
  invalidData: sepaMandateTestData.invalid,
  expectedErrorFields: ["bankAccountOwner", "iban"],
  expectedUrl: routes.pm.hoaLoan.financingCase.overview(financingCaseId),
  testName: "SEPA Mandate Validation and Submission",
  withConfirmation: true,  // <-- adds confirmation modal click step
});
```

## Real Example: FinancingDetailsModule

```typescript
export class FinancingDetailsModule extends FormModule<FinancingDetailsType> {
  constructor(page: Page) {
    super(page);
  }

  async navigate(caseId: string): Promise<void> {
    await this.navigation.navigateToSection(
      dataTestIds.hoaLoan.financingCase.pm.goToFinancingDetailsAction,
      routes.pm.hoaLoan.financingCase.financingDetails(caseId),
    );
  }

  async setupWithValidation(financingCaseId: string): Promise<void> {
    await test.step("Fill in and confirm financing details", async () => {
      await this.navigate(financingCaseId);

      await this.executeValidationAndSubmit({
        validData: hoaLoanFinancingDetailsTestData.valid,
        invalidData: hoaLoanFinancingDetailsTestData.invalid,
        expectedErrorFields: ["ownerCount"],
        expectedUrl: routes.pm.hoaLoan.financingCase.overview(financingCaseId),
        testName: "Financing Details Validation and Submission",
        withConfirmation: true,
      });
    });
  }

  async fillAndSubmitForm(formData: FinancingDetailsType): Promise<void> {
    await this.form.fillField({
      fieldName: "usage.purposes",
      fieldType: BaseField.SELECTABLE_CARDS,
      value: formData.usage.purposes,
    });

    if (formData.usage.financingDescription) {
      await this.form.fillField({
        fieldName: "usage.financingDescription",
        fieldType: BaseField.TEXTAREA,
        value: formData.usage.financingDescription,
      });
    }

    await this.form.fillField({
      fieldName: "investmentAmount",
      fieldType: BaseField.NUMBER,
      value: formData.investmentAmount,
    });

    await this.form.fillField({
      fieldName: "maintenanceReserve",
      fieldType: BaseField.NUMBER,
      value: formData.maintenanceReserve,
    });

    await this.form.fillField({
      fieldName: "plannedSpecialContribution",
      fieldType: BaseField.NUMBER,
      value: formData.plannedSpecialContribution,
    });

    await this.form.fillField({
      fieldName: "creditApprovalResolutionDate",
      fieldType: BaseField.DATEPICKER,
      value: formData.creditApprovalResolutionDate,
    });

    await this.form.fillField({
      fieldName: "ownerCount",
      fieldType: BaseField.NUMBER,
      value: formData.ownerCount,
    });

    await this.form.fillField({
      fieldName: "subCommunity.isSubCommunity",
      fieldType: BaseField.YES_NO_RADIO_GROUP,
      value: formData.subCommunity.isSubCommunity,
    });

    if (
      formData.subCommunity.isSubCommunity === YesNoOptions.YES &&
      formData.subCommunity.subCommunitySelfAuthorized !== undefined
    ) {
      await this.form.fillField({
        fieldName: "subCommunity.subCommunitySelfAuthorized",
        fieldType: BaseField.YES_NO_RADIO_GROUP,
        value: formData.subCommunity.subCommunitySelfAuthorized,
      });
    }

    await this.form.submit();
  }
}
```
