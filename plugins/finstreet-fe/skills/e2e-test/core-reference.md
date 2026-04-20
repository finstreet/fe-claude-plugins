# Core Helpers & Conventions Reference

## Class Hierarchy

```
BaseHelper (page: Page)
   │
   ├── FormInteractor    ── fillField(options), submit(), selectFirstOption(), selectVisibleOption()
   ├── ErrorHandler      ── getFieldError(fieldName), getFormError(), getErrorMessage(fieldName?)
   ├── NavigationHelper  ── goto(), reload(), waitForUrl(), waitForRedirect(), clickBackButton(), navigateToSection()
   ├── CardHelper        ── getCard(), verifyCardHeadline(), clickUpdateCard(), deleteCard(), verifyCardDoesNotExist()
   └── InteractiveListHelper ── waitForListToLoad(), getFirstListItem(), clickFirstListItem(), getIdFromFirstListItem()

BasePage extends BaseHelper
   │  composes: form (FormInteractor), errors (ErrorHandler), navigation (NavigationHelper)
   │
   ├── FormModule<T> extends BasePage         ── abstract fillAndSubmitForm(data: T)
   ├── CardCrudModule<T> extends BasePage      ── abstract fillAndSubmitForm(data: T) + verifyCardExists(data: T)
   └── InquiryPage<T> extends BasePage         ── abstract inquiryDetails, hoaDetails, getInquiryRoutes(portal)
```

## BaseHelper

**File:** `e2e/helpers/core/BaseHelper.ts`

```typescript
export class BaseHelper {
  constructor(protected page: Page) {}

  getPage(): Page;
  async clickByTestId(testId: string): Promise<void>;
  getLocatorByTestId(testId: string): Locator;
  async waitForSelectorByTestId(selector: string): Promise<void>;  // 10s timeout
  async getTextByTestId(testId: string): Promise<string | null>;
  getDataTestId(testId: string): string;  // returns `[data-testid="${testId}"]`
}
```

## BasePage

**File:** `e2e/pages/BasePage.ts`

Composes all core helpers for convenient access:

```typescript
export class BasePage extends BaseHelper {
  readonly form: FormInteractor;
  readonly errors: ErrorHandler;
  readonly navigation: NavigationHelper;

  constructor(page: Page) {
    super(page);
    this.form = new FormInteractor(page);
    this.errors = new ErrorHandler(page);
    this.navigation = new NavigationHelper(page);
  }
}
```

## FormInteractor

**File:** `e2e/helpers/core/FormInteractor.ts`

### fillField API

```typescript
interface FieldInteractionOptions {
  fieldName: string;        // Maps to data-testid prefix
  fieldType: BaseField;     // Enum from @finstreet/forms
  value?: string | boolean | number | unknown;
  clickFirstItem?: boolean; // Only for COMBOBOX — click item-0 (true) or item-1 (false, default)
}

async fillField(options: FieldInteractionOptions): Promise<void>;
async submit(): Promise<void>;  // Clicks dataTestIds.buttons.submitButton
```

### All 12 Field Types and Their data-testid Patterns

| BaseField | data-testid Used | Interaction |
|---|---|---|
| `INPUT` | `${fieldName}-input` | `page.fill()` |
| `PASSWORD` | `${fieldName}-password` | `page.fill()` |
| `NUMBER` | `${fieldName}-number` | `page.fill()` with `.toString()` |
| `TEXTAREA` | `${fieldName}-textarea` | `page.fill()` |
| `CHECKBOX` | `${fieldName}-checkbox` | `page.click()` at position `{x:2, y:2}` |
| `YES_NO_RADIO_GROUP` | `${fieldName}-yes-no-radio-group__item-yes` or `__item-no` | `clickByTestId()` |
| `RADIO_GROUP` | `${fieldName}-radio-group__item-${value}` | `clickByTestId()` |
| `SELECT` | `${fieldName}-select__trigger` → `__content` → `__item-${value}` | Click trigger, wait for content, click item |
| `COMBOBOX` | `${fieldName}-combobox__input` → `__item-0` or `__item-1` | Clear if visible, fill input, wait 5s, click item |
| `DATEPICKER` | `${fieldName}-datepicker` | `page.fill()` |
| `SELECTABLE_CARDS` | `${fieldName}-selectable-cards__card-${value}` | `clickByTestId()` per value, 200ms wait between |
| `FILE_UPLOAD` | `${fieldName}-file-upload` | `page.setInputFiles()` |

### Additional Methods

```typescript
// Select an option from a visible dropdown (for dropdowns already in DOM)
async selectVisibleOption(testId: string, value: string): Promise<void>;

// Select the first option from a dropdown
async selectFirstOption(testId: string): Promise<void>;
```

## ErrorHandler

**File:** `e2e/helpers/core/ErrorHandler.ts`

```typescript
export class ErrorHandler extends BaseHelper {
  // Get error text for a specific field — looks for `${fieldName}-error` data-testid
  async getFieldError(fieldName: string): Promise<string | null>;   // 5s timeout

  // Get form-level error — looks for `form-error` data-testid
  async getFormError(): Promise<string | null>;                      // 5s timeout

  // Convenience: delegates to getFieldError(fieldName) or getFormError() if no fieldName
  async getErrorMessage(fieldName?: string): Promise<string | null>;
}
```

## NavigationHelper

**File:** `e2e/helpers/core/NavigationHelper.ts`

```typescript
export class NavigationHelper extends BaseHelper {
  async goto(path: string): Promise<void>;
  async reload(): Promise<void>;                    // reload + waitForNavigation
  async waitForNavigation(): Promise<void>;          // waitForLoadState("networkidle")
  async waitForUrl(url: string, timeout?: number): Promise<void>;     // pathname.includes(url)
  async waitForRedirect(fromPath: string, timeout?: number): Promise<void>;  // waits until URL no longer includes fromPath
  async clickBackButton(nextUrl: string): Promise<void>;   // clicks dataTestIds.buttons.backButton, waits for nextUrl
  async navigateToSection(testId: string, route: string): Promise<void>;  // clickByTestId + waitForUrl + waitForNavigation
}
```

## CardHelper

**File:** `e2e/helpers/components/CardHelper.ts`

```typescript
export class CardHelper extends BaseHelper {
  constructor(page: Page, cardTestId: string);

  getCard(cardIndex?: number): Locator;                    // Gets nth card by cardTestId
  async verifyCardDoesNotExist(cardIndex?: number): Promise<void>;   // expect(card).not.toBeVisible()
  async verifyCardHeadline(cardIndex: number, expectedText: string): Promise<void>;  // Checks h3 text
  async openCardMenu(cardIndex?: number): Promise<void>;    // Clicks dataTestIds.menu.trigger on card
  async clickUpdateCard(cardIndex?: number): Promise<void>;  // openCardMenu + click dataTestIds.menu.update
  async deleteCard(cardIndex?: number): Promise<void>;       // openCardMenu + click dataTestIds.menu.delete + click submitButton
}
```

## InteractiveListHelper

**File:** `e2e/helpers/components/InteractiveListHelper.ts`

```typescript
export class InteractiveListHelper extends BaseHelper {
  constructor(page: Page, rootTestId: string);

  getListGroup(): Locator;                    // `${rootTestId}__group`
  getListContainer(): Locator;                // rootTestId
  getListItemByIndex(index: number): Locator; // locator("li").nth(index)
  getFirstListItem(): Locator;
  getLastListItem(): Locator;
  getListItemByTestId(testId: string): Locator;

  async extractIdFromListItem(item: Locator, pattern?: RegExp): Promise<string | null>;  // extracts from data-testid
  async getIdFromNthListItem(index: number): Promise<string | null>;
  async getIdFromFirstListItem(): Promise<string | null>;
  async clickNthListItem(index: number, redirectRoute: string): Promise<void>;
  async clickFirstListItem(redirectRoute: string): Promise<void>;
  async waitForListToLoad(options?: { waitForItems?: boolean }): Promise<void>;  // 10s timeout
}
```

## MailtrapHelper

**File:** `e2e/helpers/utilities/MailtrapHelper.ts`

```typescript
export class MailtrapHelper {
  constructor(config?: Partial<MailtrapConfig>);  // Uses env vars: MAILTRAP_API_TOKEN, MAILTRAP_INBOX_ID, MAILTRAP_ACCOUNT_ID

  async getLatestEmail(recipientEmail: string, maxAge?: number): Promise<Message | null>;
  async waitForEmail(recipientEmail: string, maxWaitTime?: number, checkInterval?: number): Promise<Message | null>;
  async extractLinkFromEmail(messageId: number, linkPattern?: RegExp): Promise<string | null>;
  async extractInvitationLink(messageId: number): Promise<string | null>;  // Handles URL replacement for local dev
  async deleteEmail(messageId: number): Promise<boolean>;
  async clearInbox(): Promise<boolean>;
}
```

## InvitationHelper

**File:** `e2e/helpers/utilities/InvitationHelper.ts`

```typescript
export class InvitationHelper {
  static async waitForInvitationEmailAndExtractLink(
    email: string,
    mailtrapHelper: MailtrapHelper,
  ): Promise<string>;

  static async acceptInvitationInNewContext(
    browser: Browser,
    invitationLink: string,
    password: string,
  ): Promise<void>;
}
```

## Test Data Conventions

### File Location
```
e2e/data/{product}/{feature}TestData.ts
```

### Structure
Always export an object with `valid` and `invalid` properties. For card CRUD, also include `update` data. Use `satisfies` for type safety:

```typescript
import { SomeFormType } from "@/features/{product}/forms/{feature}/{feature}FormSchema";

export const featureTestData = {
  valid: {
    fieldName: "valid value",
    // ...all required fields
  } satisfies SomeFormType,

  invalid: {
    fieldName: "",  // empty or invalid
    // ...trigger validation errors
  },
};
```

### Import Option Enums from Source
```typescript
import { UsagePurposes } from "@/features/propertyManagement/forms/financingDetails/usagePurposeOptions";
import { YesNoOptions } from "@/shared/components/form/YesNoRadioGroup/options";
import { SalutationOption } from "@/features/inquiryProcess/common/propertyManagerDetails/options/salutationOptions";
```

## dataTestIds Extension Guide

Add new test IDs to `e2e/data/dataTestIds.ts` in the appropriate section:

```typescript
export const dataTestIds = {
  // ... existing sections
  myFeature: {
    myCard: "my-feature-card",
    newButton: "my-feature-new-button",
    confirmButton: "my-feature-confirm-button",
  },
};
```

## Fixture Registration Pattern

**File:** `e2e/fixtures/fixtures.ts`

```typescript
import { test as base } from "@playwright/test";
import { MyNewPage } from "../pages/myProduct/MyNewPage";

type MyFixtures = {
  // ... existing fixtures
  myNewPage: MyNewPage;
};

export const test = base.extend<MyFixtures>({
  // ... existing fixtures
  myNewPage: async ({ page }, use) => {
    await use(new MyNewPage(page));
  },
});

export { expect } from "@playwright/test";
```

## Portal Route Resolver Pattern

**File:** `e2e/utils/portalRoutes.ts`

```typescript
import { routes } from "@/routes";
import { Portal } from "@/shared/types/Portal";

export function getMyProductInquiryRoutes(portal: Portal) {
  return portal === "propertyManager"
    ? routes.pm.myProduct.inquiry
    : routes.fsp.myProduct.inquiry;
}
```

## LoginPage Patterns

**File:** `e2e/pages/auth/LoginPage.ts`

```typescript
export class LoginPage extends BasePage {
  async loginAsPropertyManager(email: string, password: string);      // → routes.pm.hoaLoan.financingCase.list()
  async loginAsPropertyManagerHoaAccount(email: string, password: string); // → routes.pm.hoaAccount.financingCase.list()
  async loginAsFsp(email: string, password: string);                  // → routes.fsp.hoaLoan.financingCase.list()
  async loginAsFspAdmin(email: string, password: string);             // → routes.admin.members.index
  async clickPasswordResetLink();
}
```

## Test Utilities

**File:** `e2e/utils/test-helpers.ts`

```typescript
export const testCredentials = {
  propertyManagerEmail: process.env.E2E_TEST_PROPERTY_MANAGER_EMAIL || "customer@example.com",
  propertyManagerPassword: process.env.E2E_TEST_PROPERTY_MANAGER_PASSWORD || "password123",
  fspEmail: process.env.E2E_TEST_FSP_EMAIL || "fsp@example.com",
  fspPassword: process.env.E2E_TEST_FSP_PASSWORD || "password123",
  // ... more credentials
};

export async function clearAuthState(page: Page): Promise<void>;   // Clears cookies
export async function waitForPageLoad(page: Page): Promise<void>;  // waitForLoadState("networkidle")
```
