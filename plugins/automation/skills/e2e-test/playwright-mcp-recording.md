# Playwright MCP Recording Guide

## Purpose

This guide describes a two-phase workflow for creating e2e tests with non-technical users.

**Phase 1 — Recording:** The user provides test steps one at a time in plain language. Execute each step in the browser using the Playwright MCP server. After each step, silently record all observed technical details (URLs, `data-testid` values, field types, error messages). Do not generate steps yourself. Do not suggest what to test next. Only execute what the user provides.

**Phase 2 — Template:** Once the user signals the recording is done, produce the filled-out template from everything collected during the session. Then generate the test files using the e2e-test skill.

---

## Phase 1: Executing Steps

### Your Role During Recording

Execute exactly what the user describes — no more. Do not add extra Playwright calls, do not inspect elements the user did not ask you to interact with, do not check for errors unless the user tells you to, do not navigate unless the user tells you to. Every Playwright action you take must directly correspond to an instruction the user gave.

As a byproduct of executing each step, passively note what you observe:

- The `data-testid` of the element you located to perform the action
- The URL after any navigation or form submission
- Any text or attributes that become visible as a direct result of the action (e.g., an error message that appeared after a submit, the URL the page landed on)

Do not run additional queries to discover things the user did not ask about. If the user says "click the submit button", click the submit button — read its `data-testid` to locate it, note the resulting URL — that is all.

If a step is ambiguous, ask one clarifying question. Do not guess and do not proceed with a broader action to compensate.

### Missing data-testid

If you attempt to interact with an element and it has no `data-testid` attribute, do not silently skip it or use a fallback selector without flagging it. Instead, record it as a missing testid in the session log and continue:

```
⚠ Missing data-testid: [description of element, e.g., "inquiry details panel header"]
  URL at time of interaction: [current URL]
  Element identified by: [how you found it, e.g., text content "Anfrage-Details"]
```

When producing the template, these are collected into a "Missing testids" section. The code generation step will include adding those testids to the source before generating test files.

### Field Type Identification

When the user asks you to interact with a form field, read its element type and map it to the `BaseField` enum:

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
| Any subset of: card creation via modal, update, delete, confirm | **Card CRUD Module** |
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

### Navigation to Section
| Step | Action | data-testid | Resulting URL |
|---|---|---|---|
| 1 | [e.g., Click list item] | [testid or ⚠ missing] | [URL] |
| 2 | [e.g., Click form link] | [testid or ⚠ missing] | [URL] |

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

### Missing testids — add to source before generating files
- [description of element] at [URL] — identified by [how it was found]

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

### Navigation to Section
| Step | Action | data-testid | Resulting URL |
|---|---|---|---|
| 1 | [e.g., Click list item] | [testid or ⚠ missing] | [URL] |
| 2 | [e.g., Expand panel] | [testid or ⚠ missing] | [URL] |
| 3 | [e.g., Click section link] | [testid or ⚠ missing] | [URL] |

### Recorded Operations
Only generate code for checked operations — do not pad with the full CRUD cycle.
- [ ] Delete existing card
- [ ] Validate empty/invalid form submission
- [ ] Create card with valid data
- [ ] Update existing card
- [ ] Confirm section / redirect

### dataTestIds to Add
- Card: [from session, if create or update was recorded]
- New item button: [from session, if create was recorded]
- Confirm section button: [from session, if confirm was recorded]

### Form Fields (in modal)
| Field Name (data-testid prefix) | Field Type | Valid Value | Update Value | Invalid Value | Error Field? |
|---|---|---|---|---|---|
| [from session] | [from DOM] | [value entered] | [changed value or —] | [value that triggered error or —] | yes/no |

### Card Verification
- Card headline composed from: [which field values appear in the heading]
- Card data-testid: [from session]

### Confirm Section
- Confirm button data-testid: [from session, or — if not recorded]
- Confirmation modal submit data-testid: [from session, or — if not recorded]
- Redirect URL after confirm: [from session, or — if not recorded]

### Missing testids — add to source before generating files
- [description of element] at [URL] — identified by [how it was found]
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

### Navigation to Section
| Step | Action | data-testid | Resulting URL |
|---|---|---|---|
| 1 | [e.g., Navigate directly to URL] | — | [URL] |

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

### Missing testids — add to source before generating files
- [description of element] at [URL] — identified by [how it was found]
```

---

## Generating the Test Files

After the template is confirmed, check the "Missing testids" section first. If it is non-empty, add those `data-testid` attributes to the source components before generating any test files. Then generate in this order:

1. Add `data-testid` attributes to source components for any flagged missing testids
2. Add entries to `e2e/data/dataTestIds.ts`
3. Create `e2e/data/{product}/{feature}TestData.ts`
4. Create the module in `e2e/modules/{product}/` — implement only the operations that are checked in "Recorded Operations"
5. Register the module on the parent overview page
6. Create or update the spec file in `e2e/tests/{product}/`

---

## Example Session

```
User: Go to http://localhost:3000/pm/hoa-account/financing-case/abc123/overview

[Navigate to the URL.]
URL: /pm/hoa-account/financing-case/abc123/overview ✓

User: Click the button that opens the reference account form

[Locate the button by its visible label, read its data-testid, click it, read new URL.]
Clicked: data-testid="hoaAccount-financingCase-pm-goToReferenceAccountAction"
URL: /pm/hoa-account/financing-case/abc123/reference-account ✓

User: Fill in "Max Mustermann" for bank account owner

[Locate the field, read its data-testid and element type, fill it.]
data-testid="bankAccountOwner-input" (<input type="text"> → INPUT)
Filled: "Max Mustermann" ✓

User: Fill in "DE89370400440532013000" for IBAN

[Locate the field, read its data-testid and element type, fill it.]
data-testid="iban-input" (<input type="text"> → INPUT)
Filled: "DE89370400440532013000" ✓

User: Submit the form

[Locate the submit button, read its data-testid, click it. Read resulting URL.]
Clicked: data-testid="submit-button"
A confirmation modal appeared. ✓

User: Read the data-testid of the confirmation modal submit button

[Read the attribute from the visible modal button.]
data-testid="confirmation-modal-confirm-submit-button" ✓

User: Click it

[Click the button. Read the final URL.]
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

### Navigation to Section
| Step | Action | data-testid | Resulting URL |
|---|---|---|---|
| 1 | Click overview page action button | hoaAccount-financingCase-pm-goToReferenceAccountAction | /reference-account |

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

### Missing testids — add to source before generating files
(none)
---

Shall I proceed to generate the test files?
```