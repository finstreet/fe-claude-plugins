# Inquiry Process Tests

## When to Use

Use this guide when adding e2e tests for a **multi-step inquiry process**. An inquiry process is a wizard where the user fills out a sequence of forms, one per step, and each step submission navigates to the next.

The number of steps, their names, and their content are entirely product-specific. Before writing any code, read the inquiry process source to determine:

1. **How many steps** the process has
2. **What each step's form schema looks like** (field names, types)
3. **How navigation works** — are step URLs based on a case ID? Is the ID known upfront or extracted after step 1?
4. **Whether portals exist** — does the same inquiry run under different portals (e.g., property manager vs operations)?
5. **Whether shared steps exist** — are any step modules already implemented and reused across products?

## Pattern Overview

Every inquiry process test follows the same architecture:

```
FormModule<T>              ── one per step, fills and submits a single form
     │
InquiryPage (BasePage)     ── composes all step modules, orchestrates the flow
     │
Spec file                  ── uses the InquiryPage to drive test scenarios
```

## Step-by-Step Guide

### 1. Create Step Modules

Create one `FormModule<T>` subclass per step. Each module knows how to fill and submit its form.

**File:** `e2e/modules/{product}/inquiryProcess/{StepName}StepModule.ts`

```typescript
import { Page } from "@playwright/test";
import { BaseField } from "@finstreet/forms";
import { StepSchemaType } from "@/features/inquiryProcess/.../{stepName}Schema";
import { FormModule } from "e2e/modules/FormModule";

export class StepNameStepModule extends FormModule<StepSchemaType> {
  constructor(page: Page) {
    super(page);
  }

  // Optional: fill without submitting (useful for navigation tests)
  async fill(data: StepSchemaType): Promise<void> {
    await this.form.fillField({
      fieldName: "fieldA",
      fieldType: BaseField.NUMBER,
      value: data.fieldA,
    });

    await this.form.fillField({
      fieldName: "fieldB",
      fieldType: BaseField.SELECT,
      value: data.fieldB,
    });

    // ... one fillField call per form field
  }

  async fillAndSubmitForm(data: StepSchemaType): Promise<void> {
    await this.fill(data);
    await this.form.submit();
  }
}
```

**Rules:**
- Import the schema type from the source form schema (e.g., `@/features/inquiryProcess/forms/{stepName}/{stepName}Schema`)
- Import option enums from their source option files
- Use `BaseField` enum to match the field type (`INPUT`, `NUMBER`, `SELECT`, `CHECKBOX`, `YES_NO_RADIO_GROUP`, `RADIO_GROUP`, `COMBOBOX`, `DATEPICKER`, `SELECTABLE_CARDS`, `FILE_UPLOAD`, `TEXTAREA`, `PASSWORD`)
- `fieldName` must match the form's `data-testid` pattern (usually the schema field name)
- For nested fields use dot notation: `"parent.child"`
- Always implement both `fill()` (for navigation tests) and `fillAndSubmitForm()` (for happy path tests)
- If a step module already exists as a shared module (e.g., in `e2e/modules/common/`), reuse it instead of creating a new one

### 2. Create Test Data

**File:** `e2e/data/{product}/{product}InquiryTestData.ts`

Create one data object per step, typed with `satisfies StepSchemaType`:

```typescript
import { Step1Type } from "@/features/inquiryProcess/forms/step1/step1Schema";
import { Step2Type } from "@/features/inquiryProcess/forms/step2/step2Schema";
// ... import all step schema types and option enums

export const validInquiryData = {
  step1: {
    // all fields with valid values
  } satisfies Step1Type,

  step2: {
    // all fields with valid values
  } satisfies Step2Type,

  // ... one entry per step
};
```

**Rules:**
- Use `satisfies` (not `as`) for type safety
- Import option enum values from their source files for select/radio fields
- Use `faker` for generated values (emails, etc.) where appropriate
- Add `invalidInquiryData` if you need validation/banner tests

### 3. Create InquiryPage

**File:** `e2e/pages/{product}/{Product}InquiryPage.ts`

The InquiryPage composes all step modules and provides orchestration methods.

```typescript
import { Page } from "@playwright/test";
import { BasePage } from "e2e/pages/BasePage";
import { Step1StepModule } from "e2e/modules/{product}/inquiryProcess/Step1StepModule";
import { Step2StepModule } from "e2e/modules/{product}/inquiryProcess/Step2StepModule";
import { Step3StepModule } from "e2e/modules/{product}/inquiryProcess/Step3StepModule";
import { Step1Type } from "@/features/inquiryProcess/forms/step1/step1Schema";
import { Step2Type } from "@/features/inquiryProcess/forms/step2/step2Schema";
import { Step3Type } from "@/features/inquiryProcess/forms/step3/step3Schema";
import { routes } from "@/routes";

export interface InquiryProcessData {
  step1: Step1Type;
  step2: Step2Type;
  step3: Step3Type;
}

export class ProductInquiryPage extends BasePage {
  readonly step1: Step1StepModule;
  readonly step2: Step2StepModule;
  readonly step3: Step3StepModule;

  constructor(page: Page) {
    super(page);
    this.step1 = new Step1StepModule(page);
    this.step2 = new Step2StepModule(page);
    this.step3 = new Step3StepModule(page);
  }

  // --- Individual step methods ---

  async testStep1(data: InquiryProcessData): Promise<void> {
    await this.step1.fillAndSubmitForm(data.step1);
  }

  async testStep2(
    data: InquiryProcessData,
    caseId: string,
  ): Promise<void> {
    await this.navigation.waitForUrl(routes.portal.inquiry.step2(caseId));
    await this.step2.fillAndSubmitForm(data.step2);
  }

  async testStep3(
    data: InquiryProcessData,
    caseId: string,
  ): Promise<void> {
    await this.navigation.waitForUrl(routes.portal.inquiry.step3(caseId));
    await this.step3.fillAndSubmitForm(data.step3);
  }

  // --- Orchestrators ---

  async completeFullInquiryProcess({
    data,
    caseId,
  }: {
    data: InquiryProcessData;
    caseId: string;
  }): Promise<void> {
    await this.testStep1(data);
    await this.testStep2(data, caseId);
    await this.testStep3(data, caseId);
  }

  async fillAllStepsWithoutFinalSubmit({
    data,
    caseId,
  }: {
    data: InquiryProcessData;
    caseId: string;
  }): Promise<void> {
    await this.testStep1(data);
    await this.testStep2(data, caseId);
    // Last step: fill without submitting
    await this.navigation.waitForUrl(routes.portal.inquiry.step3(caseId));
    await this.step3.fill(data.step3);
  }
}
```

**Key design decisions (adapt per product):**

| Concern | Option A | Option B |
|---|---|---|
| Case ID source | Known upfront (from test data / URL) | Extracted from URL after step 1 (`getInquiryIdFromUrl()`) |
| Portal awareness | Single portal — no portal param needed | Multiple portals — add `portal` param, use route resolver |
| Shared steps | All steps product-specific | Some steps reused (instantiate shared modules) |
| Existing user flow | Not applicable | Add detection logic + shortened flow |

**If the ID must be extracted from the URL** (e.g., the first step creates the case):

```typescript
async getInquiryIdFromUrl(): Promise<string> {
  const url = this.page.url();
  const match = url.match(/\/your-pattern\/([a-f0-9-]{36})/i);
  if (!match) {
    throw new Error(`Could not extract inquiry ID from URL: ${url}`);
  }
  return match[1];
}

async testStep2(data: InquiryProcessData): Promise<string> {
  await this.navigation.waitForRedirect(routes.portal.inquiry.new);
  const caseId = await this.getInquiryIdFromUrl();
  await this.navigation.waitForUrl(routes.portal.inquiry.step2(caseId));
  await this.step2.fillAndSubmitForm(data.step2);
  return caseId;
}
```

**If portal-aware routing is needed:**

```typescript
// e2e/utils/portalRoutes.ts
export function getProductInquiryRoutes(portal: Portal) {
  return portal === "propertyManager"
    ? routes.pm.product.inquiry
    : routes.fsp.product.inquiry;
}

// In the InquiryPage — add portal param to step methods
async testStep2(data: InquiryProcessData, portal: Portal, caseId: string): Promise<void> {
  const inquiryRoutes = getProductInquiryRoutes(portal);
  await this.navigation.waitForUrl(inquiryRoutes.step2(caseId));
  await this.step2.fillAndSubmitForm(data.step2);
}
```

**If a generic base class exists** (e.g., `InquiryPage<T>`):
Extend it instead of `BasePage`. The base class may already provide shared step modules, orchestrators, and ID extraction. Your subclass only needs to provide the product-specific step modules and a route resolver. Check what the base class offers before writing orchestration methods.

### 4. Register in Fixtures

**File:** `e2e/fixtures/fixtures.ts`

```typescript
import { ProductInquiryPage } from "../pages/{product}/ProductInquiryPage";

type MyFixtures = {
  // ... existing fixtures
  productInquiryPage: ProductInquiryPage;
};

export const test = base.extend<MyFixtures>({
  // ... existing fixtures
  productInquiryPage: async ({ page }, use) => {
    await use(new ProductInquiryPage(page));
  },
});
```

### 5. Create Spec Files

#### Happy Path Test

**File:** `e2e/tests/{product}/{product}InquiryProcess.spec.ts`

```typescript
import { routes } from "@/routes";
import { validInquiryData, TEST_CASE_ID } from "e2e/data/{product}/{product}InquiryTestData";
import { test } from "e2e/fixtures/fixtures";
import { clearAuthState } from "e2e/utils/test-helpers";

test.describe("Product Inquiry Process", () => {
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test("complete full inquiry process", async ({
    page,
    productInquiryPage,
  }) => {
    const startUrl = routes.portal.inquiry.step1(TEST_CASE_ID);

    await test.step("Navigate to first step", async () => {
      await page.goto(startUrl);
      await productInquiryPage.navigation.waitForUrl(startUrl);
    });

    await test.step("Complete all inquiry steps", async () => {
      await productInquiryPage.completeFullInquiryProcess({
        data: validInquiryData,
        caseId: TEST_CASE_ID,
      });
    });
  });
});
```

#### Navigation Test

**File:** `e2e/tests/{product}/{product}InquiryProcessNavigation.spec.ts`

```typescript
import { routes } from "@/routes";
import { validInquiryData, TEST_CASE_ID } from "e2e/data/{product}/{product}InquiryTestData";
import { test } from "e2e/fixtures/fixtures";
import { clearAuthState } from "e2e/utils/test-helpers";

test.describe("Product Inquiry Process Navigation", () => {
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test("should navigate back through all steps to the first page", async ({
    page,
    productInquiryPage,
  }) => {
    const startUrl = routes.portal.inquiry.step1(TEST_CASE_ID);

    await test.step("Navigate to first step", async () => {
      await page.goto(startUrl);
      await productInquiryPage.navigation.waitForUrl(startUrl);
    });

    await test.step("Fill all steps without final submission", async () => {
      await productInquiryPage.fillAllStepsWithoutFinalSubmit({
        data: validInquiryData,
        caseId: TEST_CASE_ID,
      });
    });

    // Navigate back through each step (last → first)
    await test.step("Navigate back from step 3 to step 2", async () => {
      await productInquiryPage.navigation.clickBackButton(
        routes.portal.inquiry.step2(TEST_CASE_ID),
      );
    });

    await test.step("Navigate back from step 2 to step 1", async () => {
      await productInquiryPage.navigation.clickBackButton(
        routes.portal.inquiry.step1(TEST_CASE_ID),
      );
    });
  });
});
```

## File Creation Order

1. **Step modules** — `e2e/modules/{product}/inquiryProcess/{StepName}StepModule.ts` (one per step)
2. **Test data** — `e2e/data/{product}/{product}InquiryTestData.ts`
3. **InquiryPage** — `e2e/pages/{product}/{Product}InquiryPage.ts`
4. **Portal routes** — `e2e/utils/portalRoutes.ts` (only if portal-aware)
5. **Fixtures** — Update `e2e/fixtures/fixtures.ts`
6. **Spec files** — `e2e/tests/{product}/{product}InquiryProcess.spec.ts` + navigation spec

## Checklist

Before writing code, verify:
- [ ] Read all step form schemas to know every field name and type
- [ ] Read `routes.ts` to find the inquiry step URLs and how case IDs are used
- [ ] Check if a generic `InquiryPage<T>` base class exists — if so, extend it
- [ ] Check if any step modules are already shared (e.g., `e2e/modules/common/`)
- [ ] Check if portal route resolvers already exist in `e2e/utils/portalRoutes.ts`
