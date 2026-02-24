# Page Specification (PO-facing)

## PAGE — Page / Screen

**PO-friendly name:** Page / Screen

**When to use:** When a new page needs to be created in the application. Pages can be either "inquiry" type (part of a multi-step wizard) or "portal" type (standalone page).

**Information to collect:**
- **Name** — Name of the page (e.g., "Personal Details Page")
- **Page type** — Either:
  - **Inquiry** — A step within a multi-step process (requires a description)
  - **Portal** — A standalone page
- **Title** — Page title displayed to the user
- **Description** — (required for inquiry pages, optional for portal) Description text shown on the page

**Metadata JSON schema:**
```json
{
  "pageType": "inquiry",
  "translations": {
    "title": "Personal Details",
    "description": "Please fill in your personal information below"
  }
}
```

> **Note:** `pageType` must be either `"inquiry"` or `"portal"`. Description is required when pageType is `"inquiry"`.
