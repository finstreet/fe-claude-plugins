# Inquiry Process Tests

## When to Use

Use `InquiryPage<T>` when adding e2e tests for a **new product's multi-step inquiry wizard**. The standard inquiry flow has 4 steps:

1. **Inquiry Details** — product-specific form (e.g., loan amount, duration)
2. **HOA Details** — product-specific form (e.g., HOA name, postal code)
3. **Property Manager Details** — shared across all products
4. **Property Management Details** — shared across all products

## Step-by-Step Guide

### 1. Create Step Modules

Create one module per product-specific step. Steps 3 and 4 are shared (`PropertyManagerDetailsStepModule`, `PropertyManagementDetailsStepModule`).

**File:** `e2e/modules/{product}/inquiryProcess/{Step}StepModule.ts`

```typescript
import { Page } from "@playwright/test";
import { BaseField } from "@finstreet/forms";
import { InquiryDetailsType } from "@/features/inquiryProcess/{product}InquiryProcess/forms/inquiryDetails/inquiryDetailsSchema";
import { FormModule } from "e2e/modules/FormModule";

export class InquiryDetailsStepModule extends FormModule<InquiryDetailsType> {
  constructor(page: Page) {
    super(page);
  }

  // Optional: fill without submitting (useful for navigation tests)
  async fill(data: InquiryDetailsType): Promise<void> {
    await this.form.fillField({
      fieldName: "loanAmount",
      fieldType: BaseField.NUMBER,
      value: data.loanAmount,
    });

    if (data.loanDuration.fiveYears) {
      await this.form.fillField({
        fieldName: "loanDuration.fiveYears",
        fieldType: BaseField.CHECKBOX,
        value: true,
      });
    }

    // ... more fields
  }

  async fillAndSubmitForm(data: InquiryDetailsType): Promise<void> {
    await this.fill(data);
    await this.form.submit();
  }
}
```

### 2. Create Test Data

**File:** `e2e/data/{product}/{product}InquiryTestData.ts`

```typescript
import { InquiryDetailsType } from "@/features/inquiryProcess/{product}InquiryProcess/forms/inquiryDetails/inquiryDetailsSchema";
import { HoaDetailsType } from "@/features/inquiryProcess/{product}InquiryProcess/forms/hoaDetails/hoaDetailsSchema";
import { PropertyManagerDetailsType } from "@/features/inquiryProcess/common/propertyManagerDetails/propertyManagerDetailsSchema";
import { PropertyManagementDetailsType } from "@/features/inquiryProcess/common/propertyManagementDetails/propertyManagementDetailsSchema";
import { SalutationOption } from "@/features/inquiryProcess/common/propertyManagerDetails/options/salutationOptions";
import { LegalForms } from "@/features/inquiryProcess/common/propertyManagementDetails/options/legalFormsOptions";
import { PropertyManagementType } from "@/features/inquiryProcess/common/propertyManagementDetails/options/typeOptions";
import { faker } from "@faker-js/faker";

export const validInquiryData = {
  inquiryDetails: {
    // product-specific fields
  } as InquiryDetailsType,

  hoaDetails: {
    inquiryId: "123",
    name: "Test WEG Gemeinschaft",
    postalCode: "10115",
    city: "Berlin",
    // ... product-specific fields
  } as HoaDetailsType,

  propertyManagerDetails: {
    inquiryId: "123",
    email: faker.internet.email(),
    salutation: SalutationOption.MR,
    firstName: "Max",
    lastName: "Mustermann",
    position: "Verwalter",
    phoneNumber: "+49 30 123456789",
    acceptedTerms: true,
  } as PropertyManagerDetailsType,

  propertyManagementDetailsWithSelectedCompany: {
    inquiryId: "123",
    propertyManagementSuggestions: "finstreet",
    name: "Premium Hausverwaltung AG",
    legalForm: LegalForms.AKTIENGESELLSCHAFT,
    alreadyCustomer: "no" as const,
    type: PropertyManagementType.GEWERBLICHER_HAUSVERWALTER,
    association: { associationMember: "no" as const },
    city: "München",
    street: "Hauptstraße",
    houseNumber: "1",
    postalCode: "80331",
  } as PropertyManagementDetailsType,
};

// Invalid data for banner/validation tests
export const invalidInquiryData = {
  hoaDetailsWithRestrictions: {
    // ... data that triggers validation banners
  } as HoaDetailsType,
};
```

### 3. Create InquiryPage Subclass

**File:** `e2e/pages/{product}/{Product}InquiryPage.ts`

```typescript
import { Page } from "@playwright/test";
import { InquiryPage, InquiryRoutes } from "e2e/pages/InquiryPage";
import { InquiryDetailsStepModule } from "e2e/modules/{product}/inquiryProcess/InquiryDetailsStepModule";
import { HoaDetailsStepModule } from "e2e/modules/{product}/inquiryProcess/HoaDetailsStepModule";
import { InquiryDetailsType } from "@/features/inquiryProcess/{product}InquiryProcess/forms/inquiryDetails/inquiryDetailsSchema";
import { HoaDetailsType } from "@/features/inquiryProcess/{product}InquiryProcess/forms/hoaDetails/hoaDetailsSchema";
import { PropertyManagerDetailsType } from "@/features/inquiryProcess/common/propertyManagerDetails/propertyManagerDetailsSchema";
import { PropertyManagementDetailsType } from "@/features/inquiryProcess/common/propertyManagementDetails/propertyManagementDetailsSchema";
import { Portal } from "@/shared/types/Portal";
import { get{Product}InquiryRoutes } from "e2e/utils/portalRoutes";

export interface CompleteInquiryProcessData {
  inquiryDetails: InquiryDetailsType;
  hoaDetails: HoaDetailsType;
  propertyManagerDetails: PropertyManagerDetailsType;
  propertyManagementDetails: PropertyManagementDetailsType;
}

export class {Product}InquiryPage extends InquiryPage<CompleteInquiryProcessData> {
  readonly inquiryDetails: InquiryDetailsStepModule;
  readonly hoaDetails: HoaDetailsStepModule;

  constructor(page: Page) {
    super(page);
    this.inquiryDetails = new InquiryDetailsStepModule(page);
    this.hoaDetails = new HoaDetailsStepModule(page);
  }

  getInquiryRoutes(portal: Portal): InquiryRoutes {
    return get{Product}InquiryRoutes(portal);
  }
}
```

### Optional Overrides

**Custom existing user redirect** — Override when existing users redirect to a different step:
```typescript
protected getExistingUserRedirectRoute(
  inquiryRoutes: InquiryRoutes,
  financingCaseId: string,
): string {
  return inquiryRoutes.hoaDetails(financingCaseId);  // HoaAccount redirects here
}
```

**Custom fourth step** — Override to support partial fill scenarios:
```typescript
async testFourthStep(
  data: CompleteInquiryProcessData,
  portal: Portal,
  financingCaseId: string,
  withSubmission: boolean = true,  // custom parameter
): Promise<void> {
  const inquiryRoutes = this.getInquiryRoutes(portal);
  await this.navigation.waitForUrl(
    inquiryRoutes.propertyManagementDetails(financingCaseId),
  );
  if (withSubmission) {
    await this.propertyManagementDetails.fillAndSubmitForm(data.propertyManagementDetails);
  } else {
    await this.propertyManagementDetails.fill(data.propertyManagementDetails);
  }
}
```

**Validation banner check** — Add if the product has validation banners:
```typescript
async hasValidationBanner(bannerId: string): Promise<boolean> {
  const selector = `[data-testid="${bannerId}"]`;
  return await this.page.isVisible(selector);
}
```

### 4. Add Portal Route Resolver

**File:** `e2e/utils/portalRoutes.ts`

```typescript
export function get{Product}InquiryRoutes(portal: Portal) {
  return portal === "propertyManager"
    ? routes.pm.{product}.inquiry
    : routes.fsp.{product}.inquiry;
}
```

### 5. Register in Fixtures

**File:** `e2e/fixtures/fixtures.ts`

```typescript
import { {Product}InquiryPage } from "../pages/{product}/{Product}InquiryPage";

type MyFixtures = {
  // ... existing
  {product}InquiryPage: {Product}InquiryPage;
};

export const test = base.extend<MyFixtures>({
  // ... existing
  {product}InquiryPage: async ({ page }, use) => {
    await use(new {Product}InquiryPage(page));
  },
});
```

### 6. Create Spec File

**File:** `e2e/tests/{product}/{product}InquiryProcess.spec.ts`

Standard 3 scenarios for Property Manager portal:

```typescript
import { routes } from "@/routes";
import { validInquiryData } from "e2e/data/{product}/{product}InquiryTestData";
import { test } from "e2e/fixtures/fixtures";
import { clearAuthState, testCredentials } from "e2e/utils/test-helpers";

test.describe("{Product} Inquiry Process - Property Manager", () => {
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test("unauthenticated user - complete full inquiry process", async ({
    page,
    {product}InquiryPage,
  }) => {
    await page.goto(routes.pm.{product}.inquiry.new);
    await {product}InquiryPage.navigation.waitForUrl(routes.pm.{product}.inquiry.new);

    await {product}InquiryPage.completeFullInquiryProcess({
      data: {
        inquiryDetails: validInquiryData.inquiryDetails,
        hoaDetails: validInquiryData.hoaDetails,
        propertyManagerDetails: validInquiryData.propertyManagerDetails,
        propertyManagementDetails: validInquiryData.propertyManagementDetailsWithSelectedCompany,
      },
      portal: "propertyManager",
    });
  });

  test("authenticated user - complete partial inquiry process (2 steps only)", async ({
    loginPage,
    {product}InquiryPage,
  }) => {
    await loginPage.navigation.goto(routes.auth.login());
    await loginPage.loginAsPropertyManager(
      testCredentials.propertyManagerEmail,
      testCredentials.propertyManagerPassword,
    );
    await loginPage.navigation.waitForRedirect(routes.auth.login());
    await loginPage.navigation.goto(routes.pm.{product}.inquiry.new);

    await {product}InquiryPage.completePartialInquiryProcess({
      data: {
        inquiryDetails: validInquiryData.inquiryDetails,
        hoaDetails: {
          ...validInquiryData.hoaDetails,
          hoaSuggestions: "new",
        },
        propertyManagerDetails: validInquiryData.propertyManagerDetails,
        propertyManagementDetails: validInquiryData.propertyManagementDetailsWithSelectedCompany,
      },
      portal: "propertyManager",
    });
  });

  test("existing user email - redirect to confirmation page", async ({
    {product}InquiryPage,
    page,
  }) => {
    await page.goto(routes.pm.{product}.inquiry.new);
    await {product}InquiryPage.navigation.waitForUrl(routes.pm.{product}.inquiry.new);

    await {product}InquiryPage.completeFullInquiryProcess({
      data: {
        inquiryDetails: validInquiryData.inquiryDetails,
        hoaDetails: validInquiryData.hoaDetails,
        propertyManagerDetails: {
          ...validInquiryData.propertyManagerDetails,
          email: "customer@example.com",
        },
        propertyManagementDetails: validInquiryData.propertyManagementDetailsWithSelectedCompany,
      },
      portal: "propertyManager",
    });
  });
});
```

### 7. Navigation Tests

**File:** `e2e/tests/{product}/{product}InquiryProcessNavigation.spec.ts`

```typescript
import { routes } from "@/routes";
import { validInquiryData } from "e2e/data/{product}/{product}InquiryTestData";
import { test } from "e2e/fixtures/fixtures";
import { clearAuthState } from "e2e/utils/test-helpers";

test.describe("{Product} Inquiry Process Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test("should be able to navigate back to first page", async ({
    page,
    {product}InquiryPage,
  }) => {
    await page.goto(routes.pm.{product}.inquiry.new);
    await {product}InquiryPage.navigation.waitForUrl(routes.pm.{product}.inquiry.new);

    const data = {
      inquiryDetails: validInquiryData.inquiryDetails,
      hoaDetails: validInquiryData.hoaDetails,
      propertyManagerDetails: validInquiryData.propertyManagerDetails,
      propertyManagementDetails: validInquiryData.propertyManagementDetailsWithSelectedCompany,
    };

    await {product}InquiryPage.testFirstStep(data);
    const financingCaseId = await {product}InquiryPage.testSecondStep(data, "propertyManager");
    await {product}InquiryPage.testThirdStep(data, "propertyManager", financingCaseId);
    await {product}InquiryPage.testFourthStep(data, "propertyManager", financingCaseId);

    // Navigate back through all steps
    await {product}InquiryPage.navigation.clickBackButton(
      routes.pm.{product}.inquiry.propertyManagerDetails(financingCaseId),
    );
    await {product}InquiryPage.navigation.clickBackButton(
      routes.pm.{product}.inquiry.hoaDetails(financingCaseId),
    );
    await {product}InquiryPage.navigation.clickBackButton(
      routes.pm.{product}.inquiry.inquiryDetails(financingCaseId),
    );
  });
});
```

### 8. Validation Banner Tests

**File:** `e2e/tests/{product}/{product}InquiryProcessBanner.spec.ts`

```typescript
import { validInquiryData, invalidInquiryData } from "e2e/data/{product}/{product}InquiryTestData";
import { test, expect } from "e2e/fixtures/fixtures";
import { dataTestIds } from "e2e/data/dataTestIds";
import { clearAuthState } from "e2e/utils/test-helpers";
import { routes } from "@/routes";

test.describe("Inquiry Process - Validation Banner", () => {
  test.beforeEach(async ({ page, {product}InquiryPage }) => {
    await clearAuthState(page);
    await page.goto(routes.pm.{product}.inquiry.new);
    await {product}InquiryPage.navigation.waitForUrl(routes.pm.{product}.inquiry.new);
  });

  test("should show validation banners for restrictive answers", async ({
    {product}InquiryPage,
  }) => {
    const data = {
      inquiryDetails: validInquiryData.inquiryDetails,
      hoaDetails: invalidInquiryData.hoaDetailsWithRestrictions,
      propertyManagerDetails: validInquiryData.propertyManagerDetails,
      propertyManagementDetails: validInquiryData.propertyManagementDetailsWithSelectedCompany,
    };

    await {product}InquiryPage.testFirstStep(data);
    await {product}InquiryPage.hoaDetails.fillAndSubmitForm(data.hoaDetails);

    expect(
      await {product}InquiryPage.hasValidationBanner(
        dataTestIds.inquiryProcess.validationBanners.sufficientShareholders,
      ),
    ).toBeTruthy();
  });
});
```

## InquiryPage Inherited Methods

All these methods are available on your subclass without implementation:

| Method | Description |
|---|---|
| `completeFullInquiryProcess({ data, portal })` | Full 4-step flow (auto-detects existing user) |
| `completePartialInquiryProcess({ data, portal })` | Steps 1-2 only, waits for thank-you page |
| `testFirstStep(data)` | Fill and submit step 1 |
| `testSecondStep(data, portal)` | Wait for redirect, extract ID, fill step 2. Returns `financingCaseId` |
| `testThirdStep(data, portal, financingCaseId)` | Fill step 3 |
| `testFourthStep(data, portal, financingCaseId)` | Fill step 4 (overridable) |
| `getInquiryIdFromUrl()` | Extracts UUID from browser URL |

## FSP Portal Tests

For FSP-portal inquiry tests, the flow starts from the property managements page:

```typescript
test.describe("{Product} Inquiry Process - Financial Services Provider", () => {
  test("non existing user - complete full inquiry process", async ({
    {product}InquiryPage,
    propertyManagmentsPage,
    loginPage,
  }) => {
    await loginPage.loginAsFsp(testCredentials.fspEmail, testCredentials.fspPassword);

    await propertyManagmentsPage.goToPropertyManagmentsPage();
    await {product}InquiryPage.navigation.waitForUrl(routes.fsp.propertyManagements.list);
    await propertyManagmentsPage.openFspNewInquiryModal();
    await propertyManagmentsPage.start{Product}Inquiry();

    await {product}InquiryPage.navigation.waitForRedirect(routes.fsp.propertyManagements.list);

    await {product}InquiryPage.completeFullInquiryProcess({
      data: { /* ... */ },
      portal: "operations",
    });
  });
});
```
