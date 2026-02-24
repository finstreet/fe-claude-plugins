# Form Specifications (PO-facing)

This document is the single source of truth for FORM and SIMPLE_FORM component specifications used by the ticket-spec skill.

---

## FORM — User Form

**PO-friendly name:** User Form (with detailed fields)

**When to use:** When the user needs to fill out a structured form with specific fields, validation, and possibly conditional logic. Use this when you need full control over every field in the form.

**Information to collect:**
- **Name** — Name of the form (e.g., "Personal Details Form")
- **Fields** — A list of form fields. For each field, collect:
  - **Field name** — Technical identifier (camelCase, e.g., `firstName`)
  - **Label** — Display label the user sees (e.g., "First Name")
  - **Field type** — What kind of input (see [field-types.md](./field-types.md) for all options)
  - **Validation** — Required or optional
  - **Placeholder** — (optional) Hint text shown in the empty field
  - **Render condition** — (optional) Only show this field when another field has a certain value
  - **Caption** — (optional) Help text below the field
  - **Type-specific options** — Depending on the field type, additional configuration may be needed (e.g., dropdown items, suffix like "m2" or "EUR", radio options)
- **Additional details** — (optional) Extra instructions for the developer (e.g., "Add 5 placeholder select options", "Use lorem ipsum for descriptions")

**Metadata JSON schema:**
```json
{
  "fields": [
    {
      "name": "fieldName",
      "label": "Field Label",
      "fieldType": "input",
      "validation": "required",
      "placeholder": "Enter value...",
      "renderCondition": "otherField === 'yes'",
      "caption": "Help text below the field",
      "suffix": "EUR"
    }
  ],
  "additionalDetails": "Optional extra instructions for the developer"
}
```

> **Field type details** — For the complete list of field types, their properties, and PO-facing questions, see [field-types.md](./field-types.md).

---

## SIMPLE_FORM — Simple Form

**PO-friendly name:** Simple Form (API-backed)

**When to use:** When the form fields are auto-generated from a Swagger/OpenAPI specification. The developer just needs the form name, the API path, and a description. No manual field definitions needed.

**Information to collect:**
- **Form name** — Name of the form (e.g., "HOA Account Form")
- **Swagger path** — The API path that defines the form structure (e.g., `/api/internal/financing_inquiries/hoa_account`)
- **Description** — What this form is for and any special behavior

**Metadata JSON schema:**
```json
{
  "simpleFormName": "HoaAccountForm",
  "swaggerPath": "/api/internal/financing_inquiries/hoa_account",
  "description": "Form for managing HOA account details"
}
```
