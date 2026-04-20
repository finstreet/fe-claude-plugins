# Happy Path / Integration Tests

## When to Use

Use happy path tests for **full lifecycle integration** — testing the complete workflow from inquiry creation through all financing case actions. These tests span multiple portals (PM and FSP) and exercise the entire flow.

Examples: HOA Loan happy path, HOA Account happy path.

## Structure

Happy path tests use `test.describe.serial()` with high timeouts:

```typescript
import { expect, test } from "e2e/fixtures/fixtures";
import { clearAuthState, testCredentials } from "e2e/utils/test-helpers";
import { faker } from "@faker-js/faker";
import { MailtrapHelper } from "e2e/helpers/utilities/MailtrapHelper";
import { InvitationHelper } from "e2e/helpers/utilities/InvitationHelper";
import { InteractiveListHelper } from "e2e/helpers/components/InteractiveListHelper";
import { LoginPage } from "e2e/pages/auth/LoginPage";
import { FormInteractor } from "e2e/helpers/core/FormInteractor";
import { dataTestIds } from "e2e/data/dataTestIds";
import { routes } from "@/routes";

test.describe.serial("Happy Path - Complete Flow", () => {
  let mailtrapHelper: MailtrapHelper;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    mailtrapHelper = new MailtrapHelper();
  });

  test("Test the whole happy path flow", async ({
    browser,
    page,
    {product}InquiryPage,
    pm{Product}FinancingCaseOverviewPage,
    loginPage,
  }) => {
    test.setTimeout(360000);  // 6 minutes for full flow
    let financingCaseId: string = "";
    let fspContext: any = null;
    let fspPage: any = null;

    // ... test steps
  });
});
```

## The Standard Happy Path Pattern

### Step 1: Complete Inquiry Process

```typescript
await page.goto(routes.pm.{product}.inquiry.new);
await {product}InquiryPage.navigation.waitForUrl(routes.pm.{product}.inquiry.new);

const testEmail = faker.internet.email();
const newUserPassword = "SecurePassword123!";

const propertyManagerDetailsWithTestEmail = {
  ...validInquiryData.propertyManagerDetails,
  email: testEmail,
};

await test.step("Complete inquiry process", async () => {
  await {product}InquiryPage.completeFullInquiryProcess({
    data: {
      inquiryDetails: validInquiryData.inquiryDetails,
      hoaDetails: validInquiryData.hoaDetails,
      propertyManagerDetails: propertyManagerDetailsWithTestEmail,
      propertyManagementDetails: validInquiryData.propertyManagementDetailsWithSelectedCompany,
    },
    portal: "propertyManager",
  });
});
```

### Step 2: Invitation Email and Registration

```typescript
await test.step("Verify invitation email received and accept", async () => {
  const invitationLink = await InvitationHelper.waitForInvitationEmailAndExtractLink(
    testEmail,
    mailtrapHelper,
  );

  await InvitationHelper.acceptInvitationInNewContext(
    browser,
    invitationLink,
    newUserPassword,
  );
});
```

### Step 3: Login

```typescript
await test.step("Verify user can login and access the system", async () => {
  await page.waitForTimeout(2000);
  await clearAuthState(page);
  await loginPage.loginAsPropertyManager(testEmail, newUserPassword);
});
```

### Step 4: Navigate to Financing Case

```typescript
await test.step("Extract financing case ID from the list", async () => {
  const listHelper = new InteractiveListHelper(
    page,
    dataTestIds.{product}.financingCasesList.root,
  );
  await listHelper.waitForListToLoad();
  financingCaseId = (await listHelper.getIdFromFirstListItem()) || "";
  if (!financingCaseId) {
    throw new Error("Failed to extract financing case ID from the list");
  }
});

await test.step("Navigate to financing case details", async () => {
  const listHelper = new InteractiveListHelper(
    page,
    dataTestIds.{product}.financingCasesList.root,
  );
  await listHelper.clickFirstListItem(
    routes.pm.{product}.financingCase.overview(financingCaseId),
  );
});
```

### Step 5: PM Section Modules

Call `setupWithValidation` on each module in order:

```typescript
// Verify inquiry details view
await test.step("Verify inquiry details page sections", async () => {
  await pm{Product}FinancingCaseOverviewPage.goToInquiryDetails(financingCaseId);
  await pm{Product}FinancingCaseOverviewPage.inquiryDetails.waitForPageLoad();
  await pm{Product}FinancingCaseOverviewPage.inquiryDetails.verifyAllSectionTitles();
  await pm{Product}FinancingCaseOverviewPage.inquiryDetails.navigation.clickBackButton(
    routes.pm.{product}.financingCase.overview(financingCaseId),
  );
});

// Form modules
await pm{Product}FinancingCaseOverviewPage.referenceAccount.setupWithValidation(financingCaseId);
await pm{Product}FinancingCaseOverviewPage.additionalInformation.setupWithValidation(financingCaseId);

// Card CRUD modules
await pm{Product}FinancingCaseOverviewPage.legalRepresentatives.setupWithValidation(financingCaseId);

// Documents
await pm{Product}FinancingCaseOverviewPage.documents.setupAndUpload(financingCaseId);
```

### Step 6: FSP Actions (Multi-Browser Context)

When the flow requires FSP portal actions, create a new browser context:

```typescript
await test.step("FSP admin actions", async () => {
  fspContext = await browser.newContext();
  fspPage = await fspContext.newPage();
  const formInteractor = new FormInteractor(fspPage);
  const fspLoginPage = new LoginPage(fspPage);

  await fspLoginPage.loginAsFsp(testCredentials.fspEmail, testCredentials.fspPassword);

  // Navigate to the financing case in FSP portal
  const fspListHelper = new InteractiveListHelper(
    fspPage,
    dataTestIds.{product}.financingCasesList.root,
  );
  await fspListHelper.waitForListToLoad();

  // Remove grouping for easier navigation
  await formInteractor.selectVisibleOption(
    dataTestIds.inquiriesList.actions.groupBySelect,
    "none",
  );
  await fspPage.waitForTimeout(5000);

  await fspListHelper.clickFirstListItem(
    routes.fsp.{product}.financingCase.overview(financingCaseId),
  );

  const fspOverviewPage = new FSP{Product}FinancingCaseOverviewPage(fspPage);

  // FSP-specific actions (e.g., place offer, start signature)
  // ...
});

// Cleanup
if (fspContext) {
  await fspContext.close();
}
```

## Multi-Browser Context Pattern

When actions must happen in a different portal (FSP vs PM), create a separate browser context:

```typescript
// Create new context (fresh session, no shared cookies)
const fspContext = await browser.newContext();
const fspPage = await fspContext.newPage();

// Login as FSP user
const fspLoginPage = new LoginPage(fspPage);
await fspLoginPage.loginAsFsp(testCredentials.fspEmail, testCredentials.fspPassword);

// Create page objects on the new page
const fspOverviewPage = new FSP{Product}FinancingCaseOverviewPage(fspPage);

// Perform FSP actions
// ...

// Always close the context when done
await fspContext.close();
```

**Important:** After FSP actions that affect the PM view, add a reload on the PM page:

```typescript
await page.waitForTimeout(5000);
await pm{Product}FinancingCaseOverviewPage.navigation.reload();
await pm{Product}FinancingCaseOverviewPage.navigation.waitForNavigation();
```

## InteractiveListHelper Usage

```typescript
const listHelper = new InteractiveListHelper(page, dataTestIds.{product}.financingCasesList.root);

// Wait for list to be visible and contain items
await listHelper.waitForListToLoad();

// Extract ID from the first list item's data-testid attribute
const id = await listHelper.getIdFromFirstListItem();

// Click first item and wait for navigation
await listHelper.clickFirstListItem(routes.pm.{product}.financingCase.overview(id));
```

## Real Example: HOA Loan Happy Path Flow

```
1. PM: Complete inquiry process (4 steps)
2. PM: Accept invitation email (new browser context)
3. PM: Login with new credentials
4. PM: Navigate to financing case from list
5. PM: Verify inquiry details page
6. PM: Property items (card CRUD)
7. PM: Financing details (form)
8. FSP: Login → Place offer (new browser context)
9. PM: Reload → Legal representatives (card CRUD)
10. PM: SEPA mandate (form)
11. PM: Additional information (form)
12. PM: Documents (upload)
```

## Real Example: HOA Account Happy Path Flow

```
1. PM: Complete inquiry process (4 steps)
2. PM: Accept invitation email
3. PM: Login
4. PM: Navigate to financing case
5. PM: Verify inquiry details
6. PM: Reference account (form)
7. PM: Additional information (form)
8. PM: Legal representatives (card CRUD)
9. PM: Documents (upload)
10. FSP: Start signature process (new browser context)
```
