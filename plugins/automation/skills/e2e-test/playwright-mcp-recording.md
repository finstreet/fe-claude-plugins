# Playwright MCP Recording Guide

## Purpose

When a user wants to create an e2e test by walking through a feature in the browser, use the Playwright MCP server to operate the browser yourself. The user describes the feature in plain language — you drive the browser, extract all technical details, and produce a filled-out template. Then generate the actual test files from that template using the e2e-test skill.

## Workflow

```
1. Recording   — Drive the browser step by step, capturing all required data as you go
2. Template    — Output the filled-out template immediately after the session ends
3. Generation  — Use the template + e2e-test skill to generate the actual test files
```

---

## Before Starting: Identify the Test Type

Before touching the browser, determine which test type applies from what the user describes:

| User describes... | Test type |
|---|---|
| A form page with fields to fill and submit | **Form Module** |
| A section that creates items shown as cards, with update/delete | **Card CRUD Module** |
| A multi-step wizard where each step submits and moves to the next | **Inquiry Process** |
| The complete flow from inquiry creation through all financing case steps | **Happy Path** |

If it is not clear, ask: *"Does this feature create items shown as cards, or is it a single form you fill and submit?"*

---

## What to Capture on Every Interaction

Never interact with an element without capturing its `data-testid`. Never navigate without reading the resulting URL. Specifically, always collect:

- The `data-testid` of every button, input, card, and menu item you interact with
- The full URL before and after every navigation and every form submission
- The `data-testid` prefix and DOM element type of every form field
- The `data-testid` and text content of every error message that appears
- Whether a confirmation modal appears after submit — and if so, its submit button `data-testid`
- The `data-testid` and heading text of any card that appears after a successful creation

---

## Recording Steps: Standalone Form

1. Navigate to the overview page URL the user provides
2. Find the button that leads to the form page — read its `data-testid`
3. Click it — read the new URL
4. Query all `[data-testid]` attributes on the form — record each field's testid prefix and element type
5. Click Submit without filling in anything — query `[data-testid$="-error"]` — record every error testid and its message text
6. Reload the page
7. Fill each field with a reasonable valid value — record the exact value used for each field
8. Click Submit
9. Check whether a confirmation modal appeared — if yes, read its submit button `data-testid`, then click it
10. Read the final URL

## Recording Steps: Card CRUD

1. Navigate to the section page URL the user provides
2. Find the "New" / "Add" button — read its `data-testid`
3. Click it — the modal opens
4. Query all `[data-testid]` attributes inside the modal — record each field's testid prefix and element type
5. Click Submit without filling anything — record all `[data-testid$="-error"]` testids and messages
6. Close the modal (cancel button or Escape)
7. Click the New button again — fill each field with valid values — record the values — submit the modal
8. Read the `data-testid` and heading text of the card that appeared
9. Open the card's action menu — read the menu trigger's `data-testid`
10. Click Update — fill fields with slightly changed values — record the changed values — submit
11. Verify the card heading updated
12. Delete the card — read the delete option and delete confirm button `data-testid` values
13. Re-create the card with the original valid values
14. Find the "Confirm" / "Done" button that finalises the section — read its `data-testid`
15. Click it — check for a confirmation modal — if present, read its submit `data-testid` and click it
16. Read the final URL

## Recording Steps: Inquiry Process

Repeat for each step until the final redirect:

1. Navigate to step 1 URL
2. Read the current URL
3. Query all `[data-testid]` attributes on the visible form — record each field's testid prefix and element type
4. Fill each field with a valid value — record the exact value used
5. Click the Submit / Next button
6. Read the new URL — if the URL contains a case ID, note the pattern and extract the ID

After the final step: read the redirect URL.

---

## Field Type Identification

When inspecting a form field, map the DOM to the `BaseField` enum:

| DOM element / input type | `BaseField` value |
|---|---|
| `<input type="text">` | `INPUT` |
| `<input type="number">` | `NUMBER` |
| `<textarea>` | `TEXTAREA` |
| `<input type="password">` | `PASSWORD` |
| Custom select with trigger + dropdown | `SELECT` |
| Searchable input with autocomplete list | `COMBOBOX` |
| Date picker input | `DATEPICKER` |
| `<input type="checkbox">` | `CHECKBOX` |
| Yes/No radio pair | `YES_NO_RADIO_GROUP` |
| Radio button group with multiple options | `RADIO_GROUP` |
| Clickable card options | `SELECTABLE_CARDS` |
| `<input type="file">` | `FILE_UPLOAD` |

The `data-testid` prefix is the part before the type suffix: `bankAccountOwner-input` → prefix `bankAccountOwner`, type `INPUT`.

---

## After the Session: Output the Template

Immediately after the session, output the filled-out template below. Fill in every field from what was observed. Do not leave placeholders — if a value is missing, ask one targeted question to resolve it before writing the template.

After outputting the template, ask the user whether to proceed with generating the test files.

### Form Module Template

```
## E2E Test Template: [Feature Name]

### Test Type
Form Module

### Feature
- Feature name: [from session]
- Product: [from session]
- Portal: [from session]
- TypeScript schema import: [look up in the codebase from the feature route]

### Routes
- Overview page URL: [as routes.* expression]
- Form page URL: [as routes.* expression]
- Navigation button data-testid: [from session]
- dataTestIds key path: [e.g., hoaAccount.financingCase.pm.goToReferenceAccountAction]

### Form Fields
| Field Name (data-testid prefix) | Field Type | Valid Value | Invalid Value | Error Field? |
|---|---|---|---|---|
| [from session] | [from DOM] | [value used] | [value used for invalid submit] | yes/no |

### Validation
- Expected error fields: [comma-separated list of field name prefixes that showed errors]

### Post-Submit Behavior
- Confirmation modal before navigation: yes / no
- Confirmation modal submit data-testid: [from session, if applicable]
- Redirect URL after success: [as routes.* expression]

### Additional Notes
[Any conditional fields, special interactions, or portal-specific behavior observed]
```

### Card CRUD Template

```
## E2E Test Template: [Feature Name]

### Test Type
Card CRUD Module

### Feature
- Feature name: [from session]
- Product: [from session]
- Portal: [from session]
- TypeScript schema import: [look up in the codebase]

### Routes
- Overview page URL: [as routes.* expression]
- Section page URL: [as routes.* expression]
- Navigation button data-testid: [from session]

### dataTestIds to Add
- Card: [from session]
- New item button: [from session]
- Confirm section button: [from session]

### Form Fields (in modal)
| Field Name (data-testid prefix) | Field Type | Valid Value | Update Value | Invalid Value | Error Field? |
|---|---|---|---|---|---|
| [from session] | [from DOM] | [value used] | [changed value used] | [invalid value used] | yes/no |

### Card Verification
- Card headline is composed from: [which field values appear in the heading]
- Card data-testid: [from session]

### Confirm Section
- Confirm button data-testid: [from session]
- Confirmation modal submit data-testid: [from session, if applicable]
- Redirect URL after confirm: [as routes.* expression]
```

### Inquiry Process Template

```
## E2E Test Template: [Product] Inquiry Process

### Test Type
Inquiry Process

### Feature
- Product: [from session]
- Portal(s): [from session]
- Number of steps: [from session]

### Step N: [Step Name]
- URL: [as routes.* expression]
- Schema import: [look up in the codebase]
- Fields:
  | Field Name (data-testid prefix) | Field Type | Valid Value |
  |---|---|---|
  | [from session] | [from DOM] | [value used] |
- After submit: [URL pattern observed; note if case ID must be extracted from URL]

[repeat for every step]

### Final Step Redirect
- URL after last step submit: [from session]
```

---

## Generating the Test Files

Once the template is confirmed, generate the test files using the e2e-test skill in this order:

1. Add entries to `e2e/data/dataTestIds.ts`
2. Create `e2e/data/{product}/{feature}TestData.ts`
3. Create the module in `e2e/modules/{product}/`
4. Register the module on the parent overview page
5. Create or update the spec file in `e2e/tests/{product}/`

---

## Example: Complete Session for a Standalone Form

```
User: I want to create a test for the reference account form.
      Start at http://localhost:3000/pm/hoa-account/financing-case/abc123/overview

[Navigate to the overview page. Take a screenshot. Query [data-testid] on all visible action buttons.]

Found: data-testid="hoaAccount-financingCase-pm-goToReferenceAccountAction"

[Click the button. Read the new URL.]

URL: /pm/hoa-account/financing-case/abc123/reference-account

[Query all [data-testid] on the form.]

Fields found:
- bankAccountOwner-input  →  <input type="text">  →  BaseField.INPUT
- iban-input              →  <input type="text">  →  BaseField.INPUT
- submit-button

[Click Submit without filling anything. Query [data-testid$="-error"].]

Errors:
- data-testid="bankAccountOwner-error"  →  "This field is required"
- data-testid="iban-error"              →  "Please enter a valid IBAN"

[Reload. Fill fields. Click Submit.]

bankAccountOwner = "Max Mustermann"
iban = "DE89370400440532013000"

[Confirmation modal appeared. Read its submit button testid.]

data-testid="confirmation-modal-confirm-submit-button"

[Click it. Read the final URL.]

Final URL: /pm/hoa-account/financing-case/abc123/overview

---
## E2E Test Template: Reference Account

### Test Type
Form Module

### Feature
- Feature name: Reference Account
- Product: hoaAccount
- Portal: propertyManager
- TypeScript schema import: UpdateReferenceAccountType from
  @/features/referenceAccount/forms/updateReferenceAccountForm/updateReferenceAccountFormSchema

### Routes
- Overview page URL: routes.pm.hoaAccount.financingCase.overview(caseId)
- Form page URL: routes.pm.hoaAccount.financingCase.referenceAccount(caseId)
- Navigation button data-testid: hoaAccount-financingCase-pm-goToReferenceAccountAction
- dataTestIds key path: hoaAccount.financingCase.pm.goToReferenceAccountAction

### Form Fields
| Field Name       | Field Type | Valid Value               | Invalid Value  | Error Field? |
|---|---|---|---|---|
| bankAccountOwner | INPUT      | "Max Mustermann"          | ""             | yes          |
| iban             | INPUT      | "DE89370400440532013000"  | "INVALID_IBAN" | yes          |

### Validation
- Expected error fields: bankAccountOwner, iban

### Post-Submit Behavior
- Confirmation modal before navigation: yes
- Confirmation modal submit data-testid: confirmation-modal-confirm-submit-button
- Redirect URL after success: routes.pm.hoaAccount.financingCase.overview(caseId)
---

Shall I proceed to generate the test files?
```