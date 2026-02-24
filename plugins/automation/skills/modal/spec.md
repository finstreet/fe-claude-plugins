# Modal Specification (PO-facing)

## MODAL — Popup Dialog

**PO-friendly name:** Popup / Dialog Window

**When to use:** When the user needs to see or interact with content in a popup overlay — confirmations, detail views, quick-edit forms, etc.

**Information to collect:**
- **Name** — Name of the modal (e.g., "Delete Confirmation Modal")
- **Title** — Heading text shown at the top of the modal
- **Subheading** — (optional) Secondary text below the title
- **Confirm button text** — (optional) Label for the primary action button (e.g., "Delete", "Confirm", "Save")
- **Content description** — (optional) What content should be shown in the modal body
- **Data it receives** — What information does the modal need when opened? For each piece of data:
  - **Key name** — Technical name (e.g., `financingCaseId`)
  - **Data type** — TypeScript type (e.g., `string`, `number`)
- **Needs an open button** — Should a dedicated button component be created to open this modal? (yes/no)

**Metadata JSON schema:**
```json
{
  "dataTypes": [
    { "keyName": "financingCaseId", "dataType": "string" },
    { "keyName": "userName", "dataType": "string" }
  ],
  "withOpenButton": true,
  "translations": {
    "title": "Delete Financing Case",
    "subheading": "This action cannot be undone",
    "confirmButton": "Delete"
  },
  "contentDescription": "Show a warning message and the case number before deletion"
}
```
