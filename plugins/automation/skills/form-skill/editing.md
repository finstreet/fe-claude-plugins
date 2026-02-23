# Editing Existing Forms

This guide covers common form modification scenarios and which files need to change for each.

## File Dependency Graph

```
Schema ──────────► useFormFields ──────► FormFields Component
  │                    │                        │
  │                    │                        │
  ▼                    ▼                        ▼
Types exported     Field configs            DynamicFormField
  │                    │                    rendering
  │                    │
  ▼                    ▼
FormAction         useFormConfig ──────► Form Component
  │                    │
  ▼                    ▼
Backend call       Wires everything
                   together

DefaultValues ◄── Schema types
                   useFormConfig uses DefaultValues
```

When editing, always work **top-down**: schema first, then downstream files.

## Common Operations

### Add a New Field

| File | Change |
|------|--------|
| `options/use{Name}Options.ts` | Create new file (only if `select`, `radio-group`, or `selectable-cards`) |
| `{formName}Schema.ts` | Add field to schema object with correct validation |
| `use{FormName}FormFields.ts` | Add field config with type, label, and any options |
| `get{FormName}DefaultValues.ts` | Add default value (`""` for input, `undefined` for others) |
| `{FormName}FormFields.tsx` | Add `<DynamicFormField fieldName={fieldNames.newField} />` |
| `{formName}FormAction.ts` | Only if the field needs to be sent to the backend |
| `use{FormName}FormConfig.tsx` | Usually no change needed (fields come from hook) |
| `{FormName}Form.tsx` | Usually no change needed |

### Remove a Field

Reverse of adding. Update files in any order, but ensure consistency:

| File | Change |
|------|--------|
| `{formName}Schema.ts` | Remove field from schema object |
| `use{FormName}FormFields.ts` | Remove field config |
| `get{FormName}DefaultValues.ts` | Remove default value |
| `{FormName}FormFields.tsx` | Remove `<DynamicFormField>` for this field |
| `{formName}FormAction.ts` | Remove field from backend payload if present |
| `options/use{Name}Options.ts` | Delete file if no other field uses these options |

### Change a Field Type

The files that need updating depend on what the type changes to/from:

**Any type change:**

| File | Change |
|------|--------|
| `use{FormName}FormFields.ts` | Update `type` and add/remove type-specific properties |
| `{formName}Schema.ts` | Update validation if the data type changes (e.g., `string` → `number`, or adding `YesNoValidationSchema`) |
| `get{FormName}DefaultValues.ts` | Update default value if the field type category changes (`""` for input, `undefined` for others) |

**Changing to `select` / `radio-group` / `selectable-cards`:**

| File | Change |
|------|--------|
| `options/use{Name}Options.ts` | Create options hook if it doesn't exist |
| `use{FormName}FormFields.ts` | Add `items` (select/radio) or `options` + `selectType` (selectable-cards) |

**Changing from `select` / `radio-group` / `selectable-cards` to another type:**

| File | Change |
|------|--------|
| `use{FormName}FormFields.ts` | Remove `items`/`options`/`selectType` properties |
| `options/use{Name}Options.ts` | Delete if no other field uses it |

**Changing to/from `yes-no-radio-group`:**

| File | Change |
|------|--------|
| `{formName}Schema.ts` | Add or remove `YesNoValidationSchema` |

### Add Conditional Rendering

Show/hide a field based on another field's value:

| File | Change |
|------|--------|
| `use{FormName}FormFields.ts` | Add `renderCondition` to the dependent field |
| `{formName}Schema.ts` | Make field `.optional()` or wrap in `superRefine` if validation should also be conditional |
| `get{FormName}DefaultValues.ts` | Ensure default value is `undefined` for conditionally rendered fields |

Example in useFormFields:

```typescript
subsidyAmount: {
  type: "number",
  label: t("fields.subsidyAmount.label"),
  suffix: "€",
  renderCondition: (formValues) => {
    return formValues.subsidyIncluded === YesNoOptions.YES;
  },
},
```

If the schema needs conditional validation, use `superRefine` (see [schema.md](schema.md#dependent-field-validations)).

### Add Backend Prefill to an Existing Form

When a form that previously had no backend data now needs to be prefilled:

| File | Change |
|------|--------|
| `get{FormName}DefaultValues.ts` | Add backend type parameter, add mapping logic |
| `{FormName}Form.tsx` | Ensure `defaultValues` is passed as prop |
| `use{FormName}FormConfig.tsx` | Ensure `defaultValues` is accepted as parameter (not inline) |

Before (no prefill):

```typescript
export function get{FormName}DefaultValues({ id }: { id: string }) {
  return { id, name: "" } as const satisfies {FormName}DefaultValues;
}
```

After (with prefill):

```typescript
export function get{FormName}DefaultValues({
  id,
  backendValues,
}: {
  id: string;
  backendValues?: BackendType;
}) {
  const defaultValues = { id, name: "" } as const satisfies {FormName}DefaultValues;

  if (!backendValues) return defaultValues;

  return {
    ...defaultValues,
    name: backendValues.name,
  };
}
```

If `useFormConfig` previously had inline `defaultValues`, refactor it to accept them as a parameter.

### Add a Hidden ID Field

When the form action needs an ID that wasn't there before:

| File | Change |
|------|--------|
| `{formName}Schema.ts` | Add `fieldId: z.trimmedString().min(1)` |
| `use{FormName}FormFields.ts` | Add `fieldId: { type: "hidden" }` |
| `get{FormName}DefaultValues.ts` | Add the ID to defaults, accept it as function parameter |
| `{formName}FormAction.ts` | Extract ID from `formData` |
| `{FormName}FormFields.tsx` | **No change** — never render hidden fields |

### Modify the Form Action

**Add a backend request:**

| File | Change |
|------|--------|
| `{formName}FormAction.ts` | Import backend function, call it, handle success/error |

Always use `handleFormRequestError(result.error)` for error cases. Check the backend function's config to know if `pathVariables` and/or `payload` are needed.

**Add a redirect:**

| File | Change |
|------|--------|
| `{formName}FormAction.ts` | Import `redirect` from `next/navigation`, call after success |

**Change from redirect to success message (or vice versa):**

| File | Change |
|------|--------|
| `{formName}FormAction.ts` | Swap `redirect()` for `return { error: null, message: "..." }` or vice versa |

### Convert to Create/Update Pattern

When a single form needs to support both creating and updating:

| File | Action |
|------|--------|
| `{formName}Schema.ts` | Keep base schema, add `update{FormName}Schema` extending with ID field. Export both type sets. |
| `{formName}FormAction.ts` | Export two actions: `create{FormName}FormAction` and `update{FormName}FormAction` |
| `use{FormName}FormFields.ts` | Keep as-is (shared) |
| `{FormName}FormFields.tsx` | Keep as-is (shared) |
| `create/useCreate{FormName}FormConfig.tsx` | New file — uses base schema + create action |
| `create/Create{FormName}Form.tsx` | New file — uses create config |
| `update/useUpdate{FormName}FormConfig.tsx` | New file — uses extended schema + update action |
| `update/Update{FormName}Form.tsx` | New file — uses update config |

Delete the old single `use{FormName}FormConfig.tsx` and `{FormName}Form.tsx`.

### Add Array Field to Existing Form

| File | Change |
|------|--------|
| `{formName}Schema.ts` | Change field to `z.array(z.object({ ... }))` |
| `use{FormName}FormFields.ts` | Change field to `type: "array"` with child configs |
| `get{FormName}DefaultValues.ts` | Set default to array with one empty entry: `[{ child: "" }]` |
| `{FormName}FormFields.tsx` | Add internal array component using `useFieldArray` from `@finstreet/forms/rhf`. Pass `fields` in addition to `fieldNames` as prop. |
| `{FormName}Form.tsx` | Pass `config.fields` to FormFields component |

See [file-templates.md](file-templates.md#with-array-fields) for the full array field component pattern.
