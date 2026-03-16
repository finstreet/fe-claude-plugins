# Card CRUD Tests

## When to Use

Use `CardCrudModule<T>` when a feature:
- Creates items via a **modal form**
- Displays items as **cards** with a headline
- Supports **update** and **delete** via a card menu
- Has a **confirm** button to proceed after creating items

Examples: Property items, legal representatives.

## Developer Input Required

Before generating any code, collect the following from the developer:

| Input | Example |
|---|---|
| Feature name (PascalCase) | `Collaterals`, `Guarantors` |
| Feature name (camelCase) | `collaterals`, `guarantors` |
| Feature name (kebab-case) | `collaterals`, `guarantors` |
| Form type import path | `@/features/collaterals/forms/collateralsFormSchema` |
| Form type name | `CreateCollateralsFormType` |
| Test data file path | `e2e/data/{product}/collateralsTestData.ts` |
| Valid test data (all fields) | `{ name: "Main Asset", value: 100000, type: "real-estate" }` |
| Invalid test data | `{ name: "", value: -1, type: "" }` |
| Update overrides (partial) | `{ name: "Updated Asset", value: 200000 }` |
| Fields expected to show errors on invalid submit | `["name", "value", "type"]` |
| Fields to fill (name + BaseField type + value expression) | `{ fieldName: "name", fieldType: BaseField.INPUT, value: formData.name }` |
| Card headline construction | `` `${formData.name}` `` |
| Navigation action test ID | `dataTestIds.{product}.financingCase.pm.goTo{FeatureName}Action` |
| Route function | `routes.pm.{product}.financingCase.{featureName}(caseId)` |
| Expected URL after confirmation | `routes.pm.{product}.financingCase.overview(financingCaseId)` |
| Product/module grouping path | `e2e/modules/{product}/` |
| Is this module reused across multiple products? | yes / no |

If the module is reused across products, also collect per-product navigation configs (action test ID + route + expected URL after submit) for each product.

## Step-by-Step Guide

### 1. Add dataTestIds

Add card, new button, and confirm button test IDs to `e2e/data/dataTestIds.ts`:

```typescript
export const dataTestIds = {
  // ...
  {featureName}: {
    {featureName}Card: "{feature-name}-card",
    new{FeatureName}Button: "{feature-name}-new-button",
    confirm{FeatureName}Button: "{feature-name}-confirm-button",
  },
};
```

### 2. Create Test Data

**File:** `e2e/data/{product}/{feature}TestData.ts`

Include `valid`, `invalid`, and the fields needed for `updateData`. The `invalid` data must trigger errors on exactly the fields listed in `expectedErrorFields`.

```typescript
import { {FormType} } from "{formTypeImportPath}";

export const {featureName}TestData = {
  valid: {
    // All fields required by the form type, with valid values
    {field1}: {value1},
    {field2}: {value2},
    // ...
  } satisfies {FormType},

  invalid: {
    // Same shape as valid, but with values that trigger validation errors
    // on the fields listed in expectedErrorFields
    {field1}: {value1},
    {field2}: {invalidValue2}, // e.g., negative number, wrong format
    // ...
  },
};
```

### 3. Create CardCrudModule Subclass

**File:** `e2e/modules/{product}/{FeatureName}Module.ts`

```typescript
import { Page, test } from "@playwright/test";
import { CardCrudModule } from "../CardCrudModule";
import { BaseField } from "@finstreet/forms";
import { {FormType} } from "{formTypeImportPath}";
import { dataTestIds } from "e2e/data/dataTestIds";
import { routes } from "@/routes";
import { {featureName}TestData } from "e2e/data/{product}/{featureName}TestData";

export class {FeatureName}Module extends CardCrudModule<{FormType}> {
  constructor(page: Page) {
    super(page, dataTestIds.{featureName}.{featureName}Card);
  }

  async navigate(caseId: string): Promise<void> {
    await this.navigation.navigateToSection(
      {navigationActionTestId},
      {routeFunction}(caseId),
    );
  }

  async setupWithValidation(financingCaseId: string): Promise<void> {
    await test.step("{FeatureName} CRUD Operations", async () => {
      await this.navigate(financingCaseId);

      await this.executeCrudCycle({
        validData: {featureName}TestData.valid,
        invalidData: {featureName}TestData.invalid,
        updateData: {
          ...{featureName}TestData.valid,
          // Override a field or two to verify the update was applied
          {updateField1}: {updateValue1},
        },
        expectedErrorFields: [{errorFields}],
        expectedUrl: {expectedUrlFunction}(financingCaseId),
        openModalTestId: dataTestIds.{featureName}.new{FeatureName}Button,
        confirmTestId: dataTestIds.{featureName}.confirm{FeatureName}Button,
        testName: "{FeatureName} CRUD Operations",
        confirmModalTestId: dataTestIds.confirmationModalConfirm.submitButton,
      });
    });
  }

  async fillAndSubmitForm(formData: {FormType}): Promise<void> {
    // Fill each form field using this.form.fillField().
    // Use the field names, BaseField types, and value expressions
    // provided by the developer.
    await this.form.fillField({
      fieldName: "{field1}",
      fieldType: BaseField.{FIELD_TYPE},
      value: formData.{field1},
    });
    await this.form.fillField({
      fieldName: "{field2}",
      fieldType: BaseField.{FIELD_TYPE},
      value: formData.{field2},
    });
    // ... repeat for all fields

    // CHECKBOX NOTE: Only call fillField for a checkbox when the desired value is true.
    // checkCheckbox/uncheckCheckbox both call click() unconditionally — they do not read
    // current state. Passing value: false still clicks and toggles the checkbox.
    // When false is desired, skip the fillField call entirely and rely on the default unchecked state.
    if (formData.{checkboxField}) {
      await this.form.fillField({ fieldName: "{checkboxField}", fieldType: BaseField.CHECKBOX, value: true });
    }

    await this.form.submit();
  }

  async verifyCardExists(
    formData: {FormType},
    cardIndex: number = 0,
  ): Promise<void> {
    // Build the expected headline using the fields the developer specified.
    const expectedHeadline = {headlineExpression};
    await this.cardHelper.verifyCardHeadline(cardIndex, expectedHeadline);
  }
}
```

### Key Differences from FormModule

1. **Constructor** passes `cardTestId` to `super()`:
   ```typescript
   super(page, dataTestIds.{featureName}.{featureName}Card);
   ```

2. **Two abstract methods** instead of one:
   - `fillAndSubmitForm(data: T)` — fill fields + submit
   - `verifyCardExists(data: T, cardIndex?: number)` — assert card headline

3. **`executeCrudCycle`** instead of `executeValidationAndSubmit`

4. **`this.cardHelper`** is available (instance of `CardHelper`)

## CrudCycleOptions Explained

| Option | Type | Description |
|---|---|---|
| `validData` | `TFormData` | Data for creating a valid card |
| `invalidData` | `TFormData` | Data that triggers validation errors |
| `updateData` | `TFormData` | Modified data for the update step |
| `expectedErrorFields` | `string[]` | Fields expected to show errors on invalid submission |
| `expectedUrl` | `string` | URL to navigate to after final confirmation |
| `openModalTestId` | `string` | Test ID of the "new item" button that opens the modal |
| `confirmTestId` | `string` | Test ID of the "confirm" button after cards are created |
| `testName` | `string` | Label for `test.step` in the HTML report |
| `confirmModalTestId` | `string` | Test ID of the confirmation modal's submit button |

## The 5-Step CRUD Cycle

`executeCrudCycle` runs these steps automatically:

### Step 1: Validate with Invalid Data
- Click `openModalTestId` to open the modal
- `fillAndSubmitForm(invalidData)`
- Assert each `expectedErrorFields` has an error
- Click cancel button to close modal

### Step 2: Create with Valid Data
- Click `openModalTestId` to open the modal
- `fillAndSubmitForm(validData)`
- `verifyCardExists(validData, 0)` — check the card appeared

### Step 3: Update Item
- `cardHelper.clickUpdateCard()` — opens menu, clicks update
- `fillAndSubmitForm(updateData)`
- `verifyCardExists(updateData, 0)` — check the card updated

### Step 4: Delete Item
- `cardHelper.deleteCard()` — opens menu, clicks delete, confirms
- `cardHelper.verifyCardDoesNotExist()` — card is gone

### Step 5: Recreate for Flow Continuation
- Click `openModalTestId` to open the modal
- `fillAndSubmitForm(validData)` — recreate the card
- `verifyCardExists(validData, 0)` — check it's back
- Click `confirmTestId` — proceed
- Click `confirmModalTestId` — confirm the modal
- `navigation.waitForUrl(expectedUrl)` — navigate to overview

## Edge Cases & Advanced Patterns

### Checkbox Fields in fillAndSubmitForm

`FormInteractor.checkCheckbox` and `uncheckCheckbox` both call `click()` unconditionally — they do not read current state. This means passing `value: false` still clicks the checkbox and toggles it from unchecked to checked.

**Rule:** Only call `fillField` with `BaseField.CHECKBOX` when the desired value is `true`. When false is desired, skip the call entirely and rely on the form's default unchecked state.

```typescript
// Correct
if (formData.someCheckboxField) {
  await this.form.fillField({ fieldName: "someCheckboxField", fieldType: BaseField.CHECKBOX, value: true });
}

// Wrong — passing false still clicks and toggles the checkbox
await this.form.fillField({ fieldName: "someCheckboxField", fieldType: BaseField.CHECKBOX, value: false });
```

### Asserting a Button Is Not Rendered

When a button is conditionally removed from the DOM (not just hidden), do not use `toBeDisabled()` or `not.toBeVisible()`:

- `not.toBeVisible()` — for elements that exist in the DOM but are hidden
- `toBeDisabled()` — for elements that are rendered but inactive
- `toHaveCount(0)` — **correct** when the element is not in the DOM at all

```typescript
// Correct — button is not rendered
await expect(this.getLocatorByTestId(buttonTestId)).toHaveCount(0);

// Wrong — assumes the element exists
await expect(this.getLocatorByTestId(buttonTestId)).not.toBeVisible();
```

### Bypassing executeCrudCycle for Conditional Multi-Item Scenarios

`executeCrudCycle` handles a single-item CRUD flow only. Bypass it and write `setupWithValidation` manually when:

- Adding a second item is blocked after the first (e.g. a "sole authorized" flag removes the add button)
- A second item is required before confirming
- Different item variants must be tested in sequence

**Manual structure for `setupWithValidation`:**

```typescript
async setupWithValidation(financingCaseId: string): Promise<void> {
  await test.step("{FeatureName} CRUD Operations", async () => {
    await this.navigate(financingCaseId);

    // 1. Test form validation with invalid data
    await this.openModal(dataTestIds.{featureName}.new{FeatureName}Button);
    await this.fillAndSubmitForm({featureName}TestData.invalid);
    await this.form.assertFieldErrors([{errorFields}]);
    await this.form.cancel();

    // 2. Primary CRUD cycle (create → update → delete)
    await this.openModal(dataTestIds.{featureName}.new{FeatureName}Button);
    await this.fillAndSubmitForm({featureName}TestData.valid);
    await this.verifyCardExists({featureName}TestData.valid, 0);
    await this.cardHelper.clickUpdateCard(0);
    await this.fillAndSubmitForm({featureName}TestData.update);
    await this.verifyCardExists({featureName}TestData.update, 0);
    await this.cardHelper.deleteCard(0);
    await this.cardHelper.verifyCardDoesNotExist();

    // 3. Test "blocked" state: create item that hides the add button, assert absence
    await this.openModal(dataTestIds.{featureName}.new{FeatureName}Button);
    await this.fillAndSubmitForm({featureName}TestData.blockedVariant);
    await expect(this.getLocatorByTestId(dataTestIds.{featureName}.new{FeatureName}Button)).toHaveCount(0);
    await this.cardHelper.deleteCard(0);

    // 4. Test "allowed" state: create item that keeps button visible, add second item, verify both cards
    await this.openModal(dataTestIds.{featureName}.new{FeatureName}Button);
    await this.fillAndSubmitForm({featureName}TestData.allowedVariant);
    await expect(this.getLocatorByTestId(dataTestIds.{featureName}.new{FeatureName}Button)).toBeEnabled();
    await this.openModal(dataTestIds.{featureName}.new{FeatureName}Button);
    await this.fillAndSubmitForm({featureName}TestData.valid);
    await this.verifyCardExists({featureName}TestData.allowedVariant, 0);
    await this.verifyCardExists({featureName}TestData.valid, 1);

    // 5. Confirm and navigate
    await this.page.getByTestId(dataTestIds.{featureName}.confirm{FeatureName}Button).click();
    await this.page.getByTestId(dataTestIds.confirmationModalConfirm.submitButton).click();
    await this.navigation.waitForUrl({expectedUrlFunction}(financingCaseId));
  });
}
```

## Reusable Module Pattern

When a card CRUD module is shared across multiple products, accept navigation config as constructor parameters instead of hardcoding routes and test IDs. This lets the same module class be instantiated with different per-product configs.

```typescript
export class {FeatureName}Module extends CardCrudModule<{FormType}> {
  private sectionData: {
    actionTestId: string;
    route: (caseId: string) => string;
  };
  private expectedUrlAfterSubmit: (caseId: string) => string;

  constructor(
    page: Page,
    sectionData: { actionTestId: string; route: (caseId: string) => string },
    expectedUrlAfterSubmit: (caseId: string) => string,
  ) {
    super(page, dataTestIds.{featureName}.{featureName}Card);
    this.sectionData = sectionData;
    this.expectedUrlAfterSubmit = expectedUrlAfterSubmit;
  }

  async navigate(caseId: string): Promise<void> {
    await this.navigation.navigateToSection(
      this.sectionData.actionTestId,
      this.sectionData.route(caseId),
    );
  }

  async setupWithValidation(financingCaseId: string): Promise<void> {
    await test.step("{FeatureName} CRUD Operations", async () => {
      await this.navigate(financingCaseId);

      await this.executeCrudCycle({
        // ... same options as single-product version,
        // but use this.expectedUrlAfterSubmit(financingCaseId) for expectedUrl
        expectedUrl: this.expectedUrlAfterSubmit(financingCaseId),
        // ...
      });
    });
  }

  // fillAndSubmitForm and verifyCardExists — same as single-product version
}
```

Then instantiate with per-product config in each page object:

```typescript
// In {Product1}FinancingCaseOverviewPage
this.{featureName} = new {FeatureName}Module(
  page,
  {
    actionTestId: dataTestIds.{product1}.financingCase.pm.goTo{FeatureName}Action,
    route: routes.pm.{product1}.financingCase.{featureName},
  },
  routes.pm.{product1}.financingCase.overview,
);

// In {Product2}FinancingCaseOverviewPage
this.{featureName} = new {FeatureName}Module(
  page,
  {
    actionTestId: dataTestIds.{product2}.financingCase.pm.goTo{FeatureName}Action,
    route: routes.pm.{product2}.financingCase.{featureName},
  },
  routes.pm.{product2}.financingCase.overview,
);
```
