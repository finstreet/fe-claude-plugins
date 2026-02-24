# Inquiry Process Specification (PO-facing)

## INQUIRY_PROCESS — Multi-Step Wizard

**PO-friendly name:** Multi-Step Wizard / Process Flow

**When to use:** When the user goes through multiple steps/screens in sequence (like a registration or application process). Each step has its own page/form, and a progress bar shows where the user is.

**Information to collect:**
- **Name** — Name of the process (e.g., "Financing Application Process")
- **Steps** — For each step in the wizard:
  - **Step name** — Technical identifier (camelCase, e.g., `personalDetails`)
  - **Route name** — URL segment for this step (kebab-case, e.g., `personal-details`)
  - **Title** — Display title shown on the step (e.g., "Personal Details")
  - **Description** — Short description of what this step covers
- **Progress bar groups** — How steps are visually grouped in the progress bar. Each group has:
  - **Group title** — Label for the group (e.g., "Your Information", "Review")

**Metadata JSON schema:**
```json
{
  "steps": [
    {
      "name": "personalDetails",
      "routeName": "personal-details",
      "title": "Personal Details",
      "description": "Enter your personal information"
    },
    {
      "name": "financialInfo",
      "routeName": "financial-info",
      "title": "Financial Information",
      "description": "Provide your financial details"
    },
    {
      "name": "review",
      "routeName": "review",
      "title": "Review & Submit",
      "description": "Review your application before submitting"
    }
  ],
  "progressBar": [
    { "groupTitle": "Your Information" },
    { "groupTitle": "Review" }
  ]
}
```
