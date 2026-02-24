# List Specifications (PO-facing)

This document is the single source of truth for INTERACTIVE_LIST and LIST_ACTIONS_AND_PAGINATION component specifications.

---

## INTERACTIVE_LIST — Data Table

**PO-friendly name:** Data Table / Interactive List

**When to use:** When you need to display data in a table/list format with columns. This defines the column structure and the message shown when no data is available.

**Information to collect:**
- **Name** — Name of the list (e.g., "Financing Cases List")
- **Columns** — For each column:
  - **Column name** — Technical identifier (camelCase, e.g., `caseNumber`)
  - **Translation** — Display header the user sees (e.g., "Case Number")
  - **Grid width** — Number of grid columns this column spans (all columns must sum to exactly 12)
- **Empty state message** — Text shown when the list has no items (e.g., "No financing cases found")

**Metadata JSON schema:**
```json
{
  "columns": [
    {
      "name": "caseNumber",
      "translation": "Case Number",
      "gridTemplateColumns": 3
    },
    {
      "name": "status",
      "translation": "Status",
      "gridTemplateColumns": 2
    },
    {
      "name": "createdAt",
      "translation": "Created",
      "gridTemplateColumns": 4
    },
    {
      "name": "actions",
      "translation": "Actions",
      "gridTemplateColumns": 3
    }
  ],
  "noItemTranslation": "No financing cases found"
}
```

> **Important:** Grid column widths must sum to exactly 12 (12-column grid system).

---

## LIST_ACTIONS_AND_PAGINATION — List with Filters & Pagination

**PO-friendly name:** List with Search, Sort & Filters

**When to use:** When a data table needs search, sorting, grouping, and/or pagination capabilities. This type connects to one or more interactive lists and adds actions on top.

**Information to collect:**
- **Name** — Name for the list actions (e.g., "Case List Actions")
- **Search enabled** — Should the list have a search bar? (yes/no)
- **Sort enabled** — Should the list support sorting? (yes/no)
- **Grouping enabled** — Should the list support grouping items? (yes/no)
- **Connected lists** — Which interactive lists does this connect to? For each:
  - **Swagger path** — The API endpoint that provides paginated data
  - **List name** — Name of the connected interactive list

**Metadata JSON schema:**
```json
{
  "withSearch": true,
  "withSort": true,
  "withGrouping": false,
  "interactiveLists": [
    {
      "swaggerPath": "/api/internal/financing_inquiries",
      "name": "FinancingCasesList"
    }
  ]
}
```
