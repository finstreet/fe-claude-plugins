# JIRA Ticket Templates

This document defines the format for JIRA tickets created by the `/ticket-spec` skill. Every feature produces a **parent issue** and one or more **subtask issues**. Each subtask issue contains both a human-readable section and a machine-readable JSON block.

---

## Parent Issue Template

The parent issue provides the overall feature context.

```markdown
## Summary

{1-3 sentence description of the feature from a business perspective}

## Business Context

{Why is this feature needed? What problem does it solve?}

## Technical Overview

{High-level description of the technical approach}

## Components

| # | Component | Type | Description |
|---|-----------|------|-------------|
| 1 | {name} | {type} | {one-line description} |
| 2 | {name} | {type} | {one-line description} |
| ... | ... | ... | ... |

## Acceptance Criteria

- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] ...
```

---

## Subtask Issue Templates

Each subtask issue has two sections:
1. **Human-readable** — Structured tables and descriptions for developers and POs to read
2. **Machine-readable** — Collapsible JSON block with exact metadata for automation

---

### GENERIC

```markdown
## Task: {name}

### Description

{Free-text content describing what needs to be done}

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "GENERIC",
  "metadata": {
    "context": "{content}"
  }
}
\`\`\`

</details>
```

---

### FORM

```markdown
## Form: {name}

### Fields

| # | Field | Label | Type | Required | Notes |
|---|-------|-------|------|----------|-------|
| 1 | `{name}` | {label} | {fieldType} | {Yes/No} | {placeholder, suffix, condition, etc.} |
| 2 | ... | ... | ... | ... | ... |

{If radio-group, select, or selectable-card fields exist:}

### Field Options

**{fieldName}** ({fieldType}):
| Label | Value |
|-------|-------|
| {label} | {value} |

### Additional Details

{additionalDetails if provided, otherwise omit this section}

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "FORM",
  "metadata": {
    "fields": [...],
    "additionalDetails": "..."
  }
}
\`\`\`

</details>
```

---

### SIMPLE_FORM

```markdown
## Simple Form: {simpleFormName}

### Configuration

| Property | Value |
|----------|-------|
| Form Name | {simpleFormName} |
| Swagger Path | `{swaggerPath}` |

### Description

{description}

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "SIMPLE_FORM",
  "metadata": {
    "simpleFormName": "{simpleFormName}",
    "swaggerPath": "{swaggerPath}",
    "description": "{description}"
  }
}
\`\`\`

</details>
```

---

### REQUEST

```markdown
## API Requests: {name}

### Endpoints

| # | Method | Endpoint | Type | Auth | Paginated | Result Schema |
|---|--------|----------|------|------|-----------|---------------|
| 1 | {httpMethod} | `{endpoint}` | {requestType} | {Yes/No} | {Yes/No} | {Yes/No} |
| 2 | ... | ... | ... | ... | ... | ... |

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "REQUEST",
  "metadata": {
    "requests": [
      {
        "endpoint": "{endpoint}",
        "httpMethod": "{httpMethod}",
        "requestType": "{requestType}",
        "paginated": {boolean},
        "protected": {boolean},
        "resultSchema": {boolean}
      }
    ]
  }
}
\`\`\`

</details>
```

---

### INTERACTIVE_LIST

```markdown
## Data Table: {name}

### Columns

| # | Column | Header | Grid Width |
|---|--------|--------|-----------|
| 1 | `{name}` | {translation} | {gridTemplateColumns}/12 |
| 2 | ... | ... | ... |

**Total grid width:** {sum}/12

### Empty State

> {noItemTranslation}

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "INTERACTIVE_LIST",
  "metadata": {
    "columns": [...],
    "noItemTranslation": "{noItemTranslation}"
  }
}
\`\`\`

</details>
```

---

### LIST_ACTIONS_AND_PAGINATION

```markdown
## List Actions: {name}

### Features

| Feature | Enabled |
|---------|---------|
| Search | {Yes/No} |
| Sort | {Yes/No} |
| Grouping | {Yes/No} |

### Connected Lists

| # | List Name | Swagger Path |
|---|-----------|-------------|
| 1 | {name} | `{swaggerPath}` |
| 2 | ... | ... |

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "LIST_ACTIONS_AND_PAGINATION",
  "metadata": {
    "withSearch": {boolean},
    "withSort": {boolean},
    "withGrouping": {boolean},
    "interactiveLists": [
      {
        "swaggerPath": "{swaggerPath}",
        "name": "{name}"
      }
    ]
  }
}
\`\`\`

</details>
```

---

### INQUIRY_PROCESS

```markdown
## Multi-Step Process: {name}

### Steps

| # | Step | Route | Title | Description |
|---|------|-------|-------|-------------|
| 1 | `{name}` | `/{routeName}` | {title} | {description} |
| 2 | ... | ... | ... | ... |

### Progress Bar Groups

| # | Group Title |
|---|-------------|
| 1 | {groupTitle} |
| 2 | ... |

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "INQUIRY_PROCESS",
  "metadata": {
    "steps": [...],
    "progressBar": [...]
  }
}
\`\`\`

</details>
```

---

### MODAL

```markdown
## Modal: {name}

### Configuration

| Property | Value |
|----------|-------|
| Title | {title} |
| Subheading | {subheading or "—"} |
| Confirm Button | {confirmButton or "—"} |
| Open Button | {Yes/No} |

### Data Passed to Modal

| Key | Type |
|-----|------|
| `{keyName}` | `{dataType}` |
| ... | ... |

### Content

{contentDescription or "To be defined by developer"}

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "MODAL",
  "metadata": {
    "dataTypes": [...],
    "withOpenButton": {boolean},
    "translations": {
      "title": "{title}",
      "subheading": "{subheading}",
      "confirmButton": "{confirmButton}"
    },
    "contentDescription": "{contentDescription}"
  }
}
\`\`\`

</details>
```

---

### PAGE

```markdown
## Page: {name}

### Configuration

| Property | Value |
|----------|-------|
| Page Type | {inquiry/portal} |
| Title | {title} |
| Description | {description or "—"} |

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "PAGE",
  "metadata": {
    "pageType": "{inquiry|portal}",
    "translations": {
      "title": "{title}",
      "description": "{description}"
    }
  }
}
\`\`\`

</details>
```

---

### TASK_GROUP

```markdown
## Overview: {name}

### Groups & Panels

{For each group:}

#### Group: {taskGroupName}

| Panel | Title | Type | Content / Subtasks |
|-------|-------|------|-------------------|
| `{taskPanelName}` | {title} | Content | {content preview} |
| `{taskPanelName}` | {title} | Subtask References | {list of action labels} |

---

<details>
<summary>Machine-readable metadata (do not edit)</summary>

\`\`\`json
{
  "type": "TASK_GROUP",
  "metadata": [
    {
      "taskGroupName": "{taskGroupName}",
      "taskPanels": [...]
    }
  ]
}
\`\`\`

</details>
```

---

## Formatting Rules

1. **Always include both sections** — The human-readable section comes first, the machine-readable `<details>` block comes last
2. **JSON must be valid** — The metadata JSON must match the schemas defined in the component specifications (linked from [component-index.md](./component-index.md)) exactly
3. **Use backticks for technical names** — Field names, endpoints, routes should be in backticks
4. **Tables for structured data** — Use markdown tables for lists of fields, columns, steps, etc.
5. **Keep human section scannable** — POs and developers should be able to understand the ticket without expanding the JSON block
6. **Subtask issue summary format** — Use `[{TYPE}] {name}` as the JIRA issue summary (e.g., `[FORM] Personal Details Form`)
