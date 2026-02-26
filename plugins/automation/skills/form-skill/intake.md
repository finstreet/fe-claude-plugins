# Interactive Form Intake

Gather all information needed to build a form via interactive questions, then create a JIRA ticket with the compiled specification. This skill does NOT build the form — it only produces the ticket.

Use `AskUserQuestion` to guide the user through structured choices.

**IMPORTANT:** NEVER hard-code available field types or validations in your questions. Always derive them from the referenced documentation files. This ensures the intake stays in sync automatically when those files are updated.

## Step 1: Workflow Context

Ask these questions in a single `AskUserQuestion` call (max 4 per call):

| Question | Header | Options | Notes |
|----------|--------|---------|-------|
| What is the feature name? (e.g. `financing-details`, `contact-data`) | Feature | Free text (user selects "Other") | Used for directory resolution |
| Which product does this belong to? | Product | eco-scale, bfw | Project convention |
| Which portal type? | Portal | inquiry, portal | Determines page structure |
| Which user role? | Role | customer, intermediary | Determines directory path |

## Step 2: Form Identity

Ask in a single `AskUserQuestion` call:

| Question | Header | Options | Notes |
|----------|--------|---------|-------|
| What should the form be called? (PascalCase, e.g. `Revenue`, `ContactData`) | Form name | Free text (user selects "Other") | Drives all file naming |
| Is this a standard form or a create/update form? | Form type | Standard, Create/Update | Standard = single action; Create/Update = shared schema with two configs |
| Where does this form live? | Placement | Own page, Modal, Inquiry step | Affects form config (e.g. modal close, navigation) |

## Step 3: Field Configuration

For each field the user mentioned, gather type and validation details.

### Deriving type options

Read [field-types.md](field-types.md). Every `##` heading is an available field type. Present them as options in `AskUserQuestion`, grouped logically:

- **Text:** `input`, `textarea`, `password`
- **Numeric:** `number`
- **Date:** `datepicker`
- **Selection:** `select`, `radio-group`, `yes-no-radio-group`, `selectable-cards`
- **Boolean:** `checkbox`
- **File:** `file-upload`
- **Composite:** `array`
- **Internal:** `hidden`

When a field name strongly implies a type, suggest the most likely option first with "(Recommended)":
- Names containing "revenue", "amount", "price", "cost", "rate" → `number (Recommended)`
- Names containing "date", "birthday", "birthDate" → `datepicker (Recommended)`
- Names containing "phone", "name", "email", "street", "city" → `input (Recommended)`
- Names containing "description", "notes", "comment" → `textarea (Recommended)`
- Names starting with "is", "has", "should" → `yes-no-radio-group (Recommended)`

### Deriving validation options

Read [schema.md](schema.md), section "Custom Validations". Present relevant built-in validations based on the selected field type:

| Field Type | Relevant Validations |
|------------|---------------------|
| `input` | trimmedString, min/max length, PhoneNumberValidation, PostalCodeValidation |
| `number` | min/max value, decimal places |
| `datepicker` | DateValidationSchema, minDate/maxDate |
| `yes-no-radio-group` | YesNoValidationSchema (always applied, no need to ask) |
| `checkbox` | RequiredCheckboxValidation |
| `select` / `radio-group` | Required (min 1 selection) |

### Per-field question flow

Process fields in batches. For each field, ask up to 4 questions in one `AskUserQuestion` call:

1. **Type**: "What type is `{fieldName}`?" — options derived from field-types.md (with recommendation if applicable)
2. **Required**: "Is `{fieldName}` required?" — Yes / No
3. **Validation**: "Any special validation for `{fieldName}`?" — derived from schema.md per selected type. Include "None" as a default option.
4. **Layout**: "Should `{fieldName}` be on its own row or side-by-side?" — Full width / Side-by-side with next field

### Follow-up questions per type

After the base questions, ask follow-ups depending on the chosen type:

**For `number` fields:**
- "Currency suffix for `{fieldName}`?" — Options: `€`, `%`, None
- "Decimal places?" — Options: 0, 2

**For `select`, `radio-group`, or `selectable-cards` fields:**
- "What are the options for `{fieldName}`?" — Let user list them as free text (comma-separated)

**For `file-upload` fields:**
- "Max number of files?" — Options: 1, 3, 5
- "Accepted file types?" — Options: PDF only, Images only, PDF + Images

## Step 4: Hidden Fields

Ask: "Does the form action need any IDs passed as hidden fields? (e.g. portalId, financingCaseId)"

Options:
- "No hidden fields needed"
- Let user type field names (user selects "Other")

## Step 5: Compile and Confirm Specification

After all questions are answered, compile a structured spec and present it to the user as a formatted summary.

### Spec Format

```json
{
  "workflow": {
    "featureName": "...",
    "product": "...",
    "portal": "...",
    "role": "..."
  },
  "form": {
    "name": "...",
    "type": "standard | create-update",
    "placement": "page | modal | inquiry-step"
  },
  "fields": [
    {
      "name": "firstName",
      "type": "input",
      "required": true,
      "validation": "trimmedString().min(1).max(50)",
      "layout": "side-by-side"
    },
    {
      "name": "totalRevenue",
      "type": "number",
      "required": true,
      "validation": "coerce.number().min(0)",
      "suffix": "€",
      "decimal": 2,
      "layout": "side-by-side"
    }
  ],
  "hiddenFields": ["financingCaseId"],
  "layout": [
    ["firstName", "lastName"],
    ["phoneNumber"],
    ["totalRevenue", "currentRevenue"]
  ]
}
```

Present the spec to the user and ask for confirmation via `AskUserQuestion`:
- "Looks good, create the ticket!" — proceed to Step 6
- "I need to make changes" — ask which parts to adjust and re-gather those answers

## Step 6: Create JIRA Ticket

Once the spec is confirmed, create a JIRA ticket using the JIRA MCP.

### Ticket Structure

- **Summary:** `[{product}] Create {form.name} form`
- **Description:** Use the template below, filled in from the compiled spec.

### Description Template

```markdown
## Form Specification

| Property | Value |
|----------|-------|
| Feature | {workflow.featureName} |
| Product | {workflow.product} |
| Portal | {workflow.portal} |
| Role | {workflow.role} |
| Form Name | {form.name} |
| Form Type | {form.type} |
| Placement | {form.placement} |

## Fields

| Field | Type | Required | Validation | Layout |
|-------|------|----------|------------|--------|
| {field.name} | {field.type} | {field.required} | {field.validation} | {field.layout} |
| ... | ... | ... | ... | ... |

### Type-specific details

For each field with extra config (suffix, decimal, options, etc.), list them:

- **{fieldName}**: suffix=€, decimal=2
- **{fieldName}**: options=[option1, option2, option3]

## Hidden Fields

{hiddenFields as comma-separated list, or "None"}

## Layout

{layout rows, e.g.:}
- Row 1: firstName + lastName (side-by-side)
- Row 2: phoneNumber (full width)
- Row 3: totalRevenue + currentRevenue (side-by-side)

## Spec (machine-readable)

\`\`\`json
{full compiled spec JSON}
\`\`\`
```

After creating the ticket, display the ticket key/URL to the user.

## Why This Stays in Sync

This file does NOT define field types, validations, or patterns itself. It references:

- [field-types.md](field-types.md) — for available field types and their configurations
- [schema.md](schema.md) — for available validations and schema patterns
- [options.md](options.md) — for option patterns (when select/radio/selectable-cards fields are chosen)

When those files are updated with new field types or validations, the intake questions automatically reflect the changes with zero maintenance needed here.
