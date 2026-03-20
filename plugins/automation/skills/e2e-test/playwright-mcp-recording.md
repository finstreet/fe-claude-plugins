# Playwright MCP Recording Guide

## Purpose

This guide describes a two-phase workflow for creating e2e tests with non-technical users.

**Phase 1 — Recording:** The user provides test steps one at a time in plain language. Execute each step in the browser using the Playwright MCP server. After each step, silently record all observed technical details (URLs, `data-testid` values, field types, error messages). Do not generate steps yourself. Do not suggest what to test next. Only execute what the user provides.

**Phase 2 — Template:** Once the user signals the recording is done, produce the filled-out template from everything collected during the session. Then generate the test files using the e2e-test skill.

---

## Phase 1: Executing Steps

### Your Role During Recording

- Execute each step the user provides — nothing more
- After every step, silently log what was observed (see "What to Record" below)
- Confirm each completed step with a brief status and the key values captured (e.g., URL, data-testids found)
- If a step is ambiguous or cannot be executed, ask one clarifying question — do not guess

### What to Record on Every Step

After executing any step, capture and retain:

| Observed detail | When to capture |
|---|---|
| Current URL | After every navigation and every form submission |
| `data-testid` of the interacted element | On every click, fill, or interaction |
| `data-testid` prefix + DOM element type of form fields | When a form becomes visible |
| `data-testid` and text of error messages | After any failed/invalid form submission |
| Whether a confirmation modal appeared | After any form submission |
| `data-testid` of confirmation modal submit button | When a modal is visible |
| `data-testid` and heading text of new cards | After any successful card creation |

### Field Type Identification

When a form becomes visible, inspect each field and map it to the `BaseField` enum:

| DOM element | `BaseField` value |
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

## Phase 2: Producing the Template

When the user says the recording is done, output the filled-out template. Every field must be filled from what was observed — leave nothing as a placeholder. If a value is genuinely missing, ask one targeted question before writing the template.

After outputting the template, ask the user whether to proceed with generating the test files.

### Determine the Test Type

Pick the correct template based on what the session covered:

| Session covered... | Test type |
|---|---|
| A single form with fields, validation, and submit | **Form Module** |
| Card creation via modal + update + delete + confirm | **Card CRUD Module** |
| Multiple sequential form steps | **Inquiry Process** |

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
| [from session] | [from DOM] | [value entered] | [value that triggered error] | yes/no |

### Validation
- Expected error fields: [comma-separated list of prefixes that showed errors]

### Post-Submit Behavior
- Confirmation modal before navigation: yes / no
- Confirmation modal submit data-testid: [from session, if applicable]
- Redirect URL after success: [as routes.* expression]

### Additional Notes
[Any conditional fields or special behavior observed]
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
| [from session] | [from DOM] | [value entered] | [changed value] | [value that triggered error] | yes/no |

### Card Verification
- Card headline composed from: [which field values appear in the heading]
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
  | [from session] | [from DOM] | [value entered] |
- After submit: [URL pattern observed; note if case ID is embedded]

[repeat for every step]

### Final Step Redirect
- URL after last step submit: [from session]
```

---

## Generating the Test Files

After the template is confirmed, generate the test files using the e2e-test skill in this order:

1. Add entries to `e2e/data/dataTestIds.ts`
2. Create `e2e/data/{product}/{feature}TestData.ts`
3. Create the module in `e2e/modules/{product}/`
4. Register the module on the parent overview page
5. Create or update the spec file in `e2e/tests/{product}/`

---

## Example Session

```
User: Go to http://localhost:3000/pm/hoa-account/financing-case/abc123/overview

[Navigate. Read URL. Take screenshot.]
URL: /pm/hoa-account/financing-case/abc123/overview ✓

User: Click the button that opens the reference account form

[Inspect [data-testid] on visible buttons. Click the matching one. Read new URL.]
Clicked: data-testid="hoaAccount-financingCase-pm-goToReferenceAccountAction"
URL: /pm/hoa-account/financing-case/abc123/reference-account

Fields found:
- bankAccountOwner-input  →  <input type="text">  →  INPUT
- iban-input              →  <input type="text">  →  INPUT
- submit-button

User: Submit the form without filling anything in

[Click Submit. Query [data-testid$="-error"].]
Errors:
- bankAccountOwner-error  →  "This field is required"
- iban-error              →  "Please enter a valid IBAN"

User: Reload the page and fill in "Max Mustermann" for bank account owner
      and "DE89370400440532013000" for IBAN, then submit

[Reload. Fill fields. Click Submit.]
Filled bankAccountOwner = "Max Mustermann", iban = "DE89370400440532013000"
Confirmation modal appeared → data-testid="confirmation-modal-confirm-submit-button"

User: Confirm the modal

[Click the confirmation button. Read final URL.]
URL: /pm/hoa-account/financing-case/abc123/overview ✓

User: That's it, generate the template

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
