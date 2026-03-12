---
name: e2e-test
description: "Complete guide to writing Playwright e2e tests for finstreet/boilerplate features. Covers form modules, card CRUD modules, inquiry process pages, happy path tests, fixtures, test data, and dataTestIds. Use this skill whenever adding, modifying, or debugging e2e tests, or when the user mentions e2e, end-to-end, playwright tests, or integration tests for features."
---

# Playwright E2E Test Guide

This project uses a layered Playwright e2e test architecture with reusable page objects, form modules, card CRUD modules, and inquiry process pages. All tests use `data-testid` selectors and follow strict patterns.

## Architecture

```
BaseHelper (clickByTestId, getLocatorByTestId, getTextByTestId, waitForSelectorByTestId)
   │
BasePage (composes: form: FormInteractor, errors: ErrorHandler, navigation: NavigationHelper)
   │
   ├── FormModule<T>         ── abstract fillAndSubmitForm(data: T)
   │                             executeValidationAndSubmit(options)
   │
   ├── CardCrudModule<T>     ── abstract fillAndSubmitForm(data: T) + verifyCardExists(data: T)
   │                             executeCrudCycle(options)
   │
   └── InquiryPage (BasePage) ── composes step modules per product
                                 completeFullInquiryProcess / fillAllStepsWithoutFinalSubmit
```

## Directory Structure

```
e2e/
├── config/                          # Step configs for inquiry processes
├── data/
│   ├── dataTestIds.ts               # Centralized data-testid constants
│   ├── common/                      # Shared test data
│   └── {product}/                   # Product-specific test data
│       └── {feature}TestData.ts
├── fixtures/
│   └── fixtures.ts                  # Playwright fixture registration
├── files/                           # File upload resources
├── helpers/
│   ├── core/
│   │   ├── BaseHelper.ts            # Base class: data-testid interactions
│   │   ├── FormInteractor.ts        # fillField for all 12 field types
│   │   ├── NavigationHelper.ts      # goto, waitForUrl, clickBackButton
│   │   └── ErrorHandler.ts          # getFieldError, getFormError
│   ├── components/
│   │   ├── CardHelper.ts            # Card CRUD: getCard, clickUpdateCard, deleteCard
│   │   └── InteractiveListHelper.ts # List: waitForListToLoad, clickFirstListItem
│   └── utilities/
│       ├── InvitationHelper.ts      # Email invitation workflows
│       └── MailtrapHelper.ts        # Email testing via Mailtrap API
├── modules/
│   ├── FormModule.ts                # Abstract form validation+submit cycle
│   ├── CardCrudModule.ts            # Abstract card CRUD cycle
│   ├── LegalRepresentativesModule.ts # Reusable card CRUD (shared across products)
│   ├── common/                      # Shared modules (documents, property manager steps)
│   └── {product}/                   # Product-specific modules
│       ├── {Feature}Module.ts       # FormModule or CardCrudModule subclass
│       └── inquiryProcess/          # Inquiry step modules
│           └── {Step}StepModule.ts
├── pages/
│   ├── BasePage.ts                  # Composes FormInteractor + ErrorHandler + NavigationHelper
│   ├── InquiryPage.ts              # Generic inquiry flow orchestration
│   ├── auth/
│   │   ├── LoginPage.ts            # Portal-specific login methods
│   │   └── AcceptInvitationPage.ts
│   └── {product}/
│       ├── {Product}InquiryPage.ts          # InquiryPage subclass
│       ├── PM{Product}FinancingCaseOverviewPage.ts  # PM overview with modules
│       └── FSP{Product}FinancingCaseOverviewPage.ts # FSP overview with modules
├── tests/
│   └── {product}/
│       ├── {product}HappyPath.spec.ts
│       ├── {product}InquiryProcess.spec.ts
│       ├── {product}InquiryProcessNavigation.spec.ts
│       └── {product}InquiryProcessBanner.spec.ts
└── utils/
    ├── portalRoutes.ts              # Portal-aware route resolvers
    └── test-helpers.ts              # testCredentials, clearAuthState
```

## File Creation Order

When adding e2e tests for a new feature, follow this order:

1. **dataTestIds** — Add test ID constants to `e2e/data/dataTestIds.ts`
2. **Test data** — Create `e2e/data/{product}/{feature}TestData.ts`
3. **Module** — Create `e2e/modules/{product}/{Feature}Module.ts` (extends `FormModule<T>` or `CardCrudModule<T>`)
4. **Page** — Register module on the parent overview page (e.g., `PM{Product}FinancingCaseOverviewPage`)
5. **Fixtures** — Register any new pages in `e2e/fixtures/fixtures.ts`
6. **Spec** — Create or update `e2e/tests/{product}/*.spec.ts`

For inquiry processes, also create:
- Step modules in `e2e/modules/{product}/inquiryProcess/`
- Inquiry page in `e2e/pages/{product}/{Product}InquiryPage.ts`
- Portal routes in `e2e/utils/portalRoutes.ts`

## Key Imports

```typescript
// Playwright
import { Page, expect, test } from "@playwright/test";

// Base classes
import { FormModule } from "e2e/modules/FormModule";
import { CardCrudModule } from "e2e/modules/CardCrudModule";
import { BasePage } from "e2e/pages/BasePage";
import { InquiryPage, InquiryRoutes } from "e2e/pages/InquiryPage";

// Helpers
import { InteractiveListHelper } from "e2e/helpers/components/InteractiveListHelper";
import { CardHelper } from "e2e/helpers/components/CardHelper";
import { MailtrapHelper } from "e2e/helpers/utilities/MailtrapHelper";
import { InvitationHelper } from "e2e/helpers/utilities/InvitationHelper";

// Data
import { dataTestIds } from "e2e/data/dataTestIds";
import { routes } from "@/routes";
import { BaseField } from "@finstreet/forms";
import { Portal } from "@/shared/types/Portal";

// Fixtures
import { test, expect } from "e2e/fixtures/fixtures";

// Utilities
import { clearAuthState, testCredentials } from "e2e/utils/test-helpers";
```

## Conventions

### data-testid Selectors
All element interactions use `data-testid` attributes. Never use CSS selectors, class names, or text content for element selection. The `dataTestIds` object in `e2e/data/dataTestIds.ts` centralizes all test ID constants.

### test.step() Nesting
Always wrap logical sections in `test.step()` for clear HTML report output:
```typescript
await test.step("Fill in and confirm financing details", async () => {
  // ...
});
```

### clearAuthState
Always call `clearAuthState(page)` in `beforeEach` to clear cookies:
```typescript
test.beforeEach(async ({ page }) => {
  await clearAuthState(page);
});
```

### Timeout Configuration
- Default: use `test.describe.configure({ timeout: 60000 })` for inquiry processes
- Happy paths: use `test.setTimeout(360000)` inside the test for long flows

### Fixture Imports
Always import `test` and `expect` from `e2e/fixtures/fixtures` (not from `@playwright/test`) in spec files:
```typescript
import { test, expect } from "e2e/fixtures/fixtures";
```

### Source Type Imports
Import schema types from `@/features/...` and option enums from their source files:
```typescript
import { FinancingDetailsType } from "@/features/propertyManagement/forms/financingDetails/financingDetailsFormSchema";
import { UsagePurposes } from "@/features/propertyManagement/forms/financingDetails/usagePurposeOptions";
import { YesNoOptions } from "@/shared/components/form/YesNoRadioGroup/options";
```

### Portal-Aware Routing
Routes differ by portal. Use portal route resolvers:
```typescript
// e2e/utils/portalRoutes.ts
export function getHoaLoanInquiryRoutes(portal: Portal) {
  return portal === "propertyManager"
    ? routes.pm.hoaLoan.inquiry
    : routes.fsp.hoaLoan.inquiry;
}
```

## Decision Tree: What Type of Test Do I Need?

### Standalone form → Read `form-module-tests.md`
Use when: A feature has a form that validates, submits, and navigates back to an overview page.
Examples: Financing details, SEPA mandate, reference account, additional information.

### Card CRUD (modal → card → update/delete) → Read `card-crud-tests.md`
Use when: A feature creates items via a modal form, displays them as cards, and supports update/delete operations.
Examples: Property items, legal representatives.

### Multi-step inquiry wizard → Read `inquiry-process-tests.md`
Use when: Adding a new product's multi-step inquiry process with any number of steps.
Examples: HOA Loan inquiry, HOA Account inquiry, Factoring inquiry.

### Full lifecycle integration → Read `happy-path-tests.md`
Use when: Testing the complete workflow from inquiry creation through all financing case actions.
Examples: HOA Loan happy path, HOA Account happy path.

### Helper/field type reference → Read `module.md` or `core-reference.md`
Use when: You need the API for FormInteractor, ErrorHandler, or NavigationHelper. For CardHelper, InteractiveListHelper, and other base classes, read `core-reference.md`.

## Reference Files

| File | When to Read |
|------|--------------|
| `module.md` | Need method signatures for FormInteractor, ErrorHandler, or NavigationHelper |
| `core-reference.md` | Need method signatures for BaseHelper, CardHelper, InteractiveListHelper, or other base classes |
| `form-module-tests.md` | Adding a standalone form test module (validate → submit → navigate) |
| `card-crud-tests.md` | Adding card-based CRUD tests (modal → card → update/delete cycle) |
| `inquiry-process-tests.md` | Adding a new product's multi-step inquiry process tests |
| `happy-path-tests.md` | Adding full lifecycle integration tests |
