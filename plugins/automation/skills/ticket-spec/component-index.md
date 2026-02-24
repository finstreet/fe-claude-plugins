# Component Type Index

This document provides an overview of all 10 component types and links to each type's full specification in the owning skill.

---

## Quick Reference Table

| Type | PO-friendly name | Category | Key question to ask PO |
|------|-----------------|----------|----------------------|
| GENERIC | General Task | Other | "What needs to be done?" |
| FORM | User Form | Forms | "What fields does the user fill out?" |
| SIMPLE_FORM | Simple Form | Forms | "Which API endpoint defines the form?" |
| REQUEST | API Request | Data & API | "What backend endpoints are needed?" |
| INTERACTIVE_LIST | Data Table | Lists | "What columns should the table show?" |
| LIST_ACTIONS_AND_PAGINATION | List with Filters | Lists | "Does the list need search/sort/grouping?" |
| INQUIRY_PROCESS | Multi-Step Wizard | Navigation | "What are the steps in the process?" |
| MODAL | Popup Dialog | Navigation | "What triggers this popup and what does it show?" |
| PAGE | Page / Screen | Navigation | "Is this an inquiry step or standalone page?" |
| TASK_GROUP | Overview Dashboard | Navigation | "What panels and tasks should the overview show?" |

---

## Keyword-to-Type Mapping

Use these keywords from PO descriptions to identify the correct component type:

| Keywords in PO description | Maps to type |
|---------------------------|-------------|
| form, input, fill out, enter data, fields, validation | FORM |
| simple form, swagger, API form, auto-generated | SIMPLE_FORM |
| API, endpoint, fetch, request, backend call, server | REQUEST |
| table, list, columns, rows, data grid | INTERACTIVE_LIST |
| search, filter, sort, paginate, pagination | LIST_ACTIONS_AND_PAGINATION |
| steps, wizard, process, multi-step, flow, progress | INQUIRY_PROCESS |
| popup, dialog, modal, confirm, overlay, prompt | MODAL |
| page, screen, view, route | PAGE |
| overview, dashboard, panel, task list, grouped tasks | TASK_GROUP |
| documentation, config, custom, other | GENERIC |

---

## GENERIC — General Task

**PO-friendly name:** General Task

**When to use:** For any subtask that doesn't fit a specific type — documentation, configuration, custom logic, or a task that just needs a name and free-text description.

**Information to collect:**
- **Name** — Short descriptive name for the task
- **Content** — Free-text description (supports markdown) explaining what needs to be done

**Metadata JSON schema:**
```json
{
  "context": "<markdown content describing the task>"
}
```

---

## Component Type Specifications

For all other component types, refer to the owning skill's specification:

| Type | Specification |
|------|--------------|
| FORM | [form-skill/spec.md](../form-skill/spec.md#form--user-form) |
| SIMPLE_FORM | [form-skill/spec.md](../form-skill/spec.md#simple_form--simple-form) |
| REQUEST | [secure-fetch/spec.md](../secure-fetch/spec.md) |
| INTERACTIVE_LIST | [list-actions/spec.md](../list-actions/spec.md#interactive_list--data-table) |
| LIST_ACTIONS_AND_PAGINATION | [list-actions/spec.md](../list-actions/spec.md#list_actions_and_pagination--list-with-filters--pagination) |
| INQUIRY_PROCESS | [inquiry-process/spec.md](../inquiry-process/spec.md) |
| MODAL | [modal/spec.md](../modal/spec.md) |
| PAGE | [page/spec.md](../page/spec.md) |
| TASK_GROUP | [task-group/spec.md](../task-group/spec.md) |

> **Field types:** When working with FORM components, the complete field type reference is in [form-skill/field-types.md](../form-skill/field-types.md).
