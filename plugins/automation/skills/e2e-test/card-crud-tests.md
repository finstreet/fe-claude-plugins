# Card CRUD Tests

## When to Use

Use `CardCrudModule<T>` when a feature:
- Creates items via a **modal form**
- Displays items as **cards** with a headline
- Supports **update** and **delete** via a card menu
- Has a **confirm** button to proceed after creating items

Examples: Property items, legal representatives.

## Step-by-Step Guide

### 1. Add dataTestIds

Add card, new button, and confirm button test IDs to `e2e/data/dataTestIds.ts`:

```typescript
export const dataTestIds = {
  // ...
  propertyItems: {
    propertyItemCard: "property-items-card",
    newPropertyItemButton: "property-items-new-button",
    confirmPropertyItemsButton: "property-items-confirm-button",
  },
};
```

### 2. Create Test Data

**File:** `e2e/data/{product}/{feature}TestData.ts`

Include `valid`, `invalid`, and optionally a base for `update` data:

```typescript
import { CreatePropertyItemsFormType } from "@/features/propertyItems/forms/propertyItemsFormSchema";

export const propertyItemsTestData = {
  valid: {
    street: "Hauptstraße",
    houseNumber: "123",
    postalCode: "10115",
    city: "Berlin",
    residentialArea: 250.5,
    commercialArea: 50.0,
    plotArea: 500.0,
    constructionYear: 2010,
    residentialUnitCount: 10,
    residentialOwnershipShares: 1000,
    commercialUnitCount: 2,
    commercialOwnershipShares: 200,
    financingCaseId: "FC123456",
  } satisfies CreatePropertyItemsFormType,

  invalid: {
    street: "Hauptstraße",
    houseNumber: "123",
    postalCode: "123",
    city: "Berlin",
    residentialArea: -10,
    commercialArea: 50.0,
    plotArea: 0,
    constructionYear: 2027,
    residentialUnitCount: 10,
    residentialOwnershipShares: 1000,
    commercialUnitCount: 2,
    commercialOwnershipShares: 200,
    financingCaseId: "FC123456",
  },
};
```

### 3. Create CardCrudModule Subclass

**File:** `e2e/modules/{product}/{Feature}Module.ts`

```typescript
import { Page, test } from "@playwright/test";
import { CardCrudModule } from "../CardCrudModule";
import { BaseField } from "@finstreet/forms";
import { CreatePropertyItemsFormType } from "@/features/propertyItems/forms/propertyItemsFormSchema";
import { dataTestIds } from "e2e/data/dataTestIds";
import { routes } from "@/routes";
import { propertyItemsTestData } from "e2e/data/hoaLoan/propertyItemsTestData";

export class PropertyItemsModule extends CardCrudModule<CreatePropertyItemsFormType> {
  constructor(page: Page) {
    super(page, dataTestIds.propertyItems.propertyItemCard);
  }

  async navigate(caseId: string): Promise<void> {
    await this.navigation.navigateToSection(
      dataTestIds.hoaLoan.financingCase.pm.goToPropertyItemsAction,
      routes.pm.hoaLoan.financingCase.propertyItems(caseId),
    );
  }

  async setupWithValidation(financingCaseId: string): Promise<void> {
    await test.step("Fill in and confirm property items", async () => {
      await this.navigate(financingCaseId);

      await this.executeCrudCycle({
        validData: propertyItemsTestData.valid,
        invalidData: propertyItemsTestData.invalid,
        updateData: {
          ...propertyItemsTestData.valid,
          street: "New Street",
          houseNumber: "456",
        },
        expectedErrorFields: ["residentialArea", "plotArea"],
        expectedUrl: routes.pm.hoaLoan.financingCase.overview(financingCaseId),
        openModalTestId: dataTestIds.propertyItems.newPropertyItemButton,
        confirmTestId: dataTestIds.propertyItems.confirmPropertyItemsButton,
        testName: "Property Items CRUD Operations",
        confirmModalTestId: dataTestIds.confirmationModalConfirm.submitButton,
      });
    });
  }

  async fillAndSubmitForm(formData: CreatePropertyItemsFormType): Promise<void> {
    await this.form.fillField({
      fieldName: "street",
      fieldType: BaseField.INPUT,
      value: formData.street,
    });
    // ... more fields
    await this.form.submit();
  }

  async verifyCardExists(
    formData: CreatePropertyItemsFormType,
    cardIndex: number = 0,
  ): Promise<void> {
    const expectedHeadline = `${formData.street} ${formData.houseNumber}`;
    await this.cardHelper.verifyCardHeadline(cardIndex, expectedHeadline);
  }
}
```

### Key Differences from FormModule

1. **Constructor** passes `cardTestId` to `super()`:
   ```typescript
   super(page, dataTestIds.propertyItems.propertyItemCard);
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

## Reusable Module Pattern: LegalRepresentativesModule

When a card CRUD module is shared across multiple products, make it configurable:

```typescript
export class LegalRepresentativesModule extends CardCrudModule<CreateLegalRepresentativeType> {
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
    super(page, dataTestIds.legalRepresentatives.legalRepresentativeCard);
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
    await test.step("PM add legal representatives", async () => {
      await this.navigate(financingCaseId);

      await this.executeCrudCycle({
        validData: legalRepresentativesTestData.valid,
        invalidData: legalRepresentativesTestData.invalid,
        updateData: {
          ...legalRepresentativesTestData.valid,
          firstName: "Jane",
          lastName: "Doe",
        },
        expectedErrorFields: ["firstName", "phoneNumber", "email"],
        expectedUrl: this.expectedUrlAfterSubmit(financingCaseId),
        openModalTestId: dataTestIds.legalRepresentatives.newLegalRepresentativeButton,
        confirmTestId: dataTestIds.legalRepresentatives.confirmLegalRepresentativesButton,
        testName: "Legal Representatives CRUD Operations",
        confirmModalTestId: dataTestIds.confirmationModalConfirm.submitButton,
      });
    });
  }

  // ... fillAndSubmitForm and verifyCardExists
}
```

Then register with product-specific config:

```typescript
// In PMHoaLoanFinancingCaseOverviewPage
this.legalRepresentatives = new LegalRepresentativesModule(
  page,
  {
    actionTestId: dataTestIds.hoaLoan.financingCase.pm.goToLegalRepresentativesAction,
    route: routes.pm.hoaLoan.financingCase.legalRepresentatives,
  },
  routes.pm.hoaLoan.financingCase.overview,
);

// In PMHoaAccountFinancingCaseOverviewPage
this.legalRepresentatives = new LegalRepresentativesModule(
  page,
  {
    actionTestId: dataTestIds.hoaAccount.financingCase.pm.goToLegalRepresentativesAction,
    route: routes.pm.hoaAccount.financingCase.legalRepresentatives,
  },
  routes.pm.hoaAccount.financingCase.overview,
);
```
