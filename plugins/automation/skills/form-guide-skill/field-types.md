# Field Types Reference

All field configs inherit from `BaseFieldConfig`:

```typescript
type BaseFieldConfig<FormValues, FieldName extends keyof FormValues, FieldType extends string> = {
  label: ReactNode;          // Required - field label
  placeholder?: string;      // Optional
  renderCondition?: (values: FormValues) => boolean;  // Optional - conditional rendering
  type: FieldType;           // Required - determines which component renders
  asyncValidate?: (value: FormValues[FieldName]) => Promise<string | undefined>;  // Optional
  caption?: string;          // Optional - explanatory text below the field
  disabled?: boolean;        // Optional
};
```

Only set required properties unless explicitly stated otherwise.

## `hidden`

For IDs and values that must be submitted but not displayed. NEVER render hidden fields in the FormFields component.

```typescript
financingCaseId: {
  type: "hidden",
},
```

## `input`

```typescript
name: {
  type: "input",
  label: t("name.label"),
},
```

Additional properties:
- `onClear?: () => void` - adds a clear button
- `suffix?: string` - text appended to the input

## `number`

For numeric-only input fields.

```typescript
estimatedMonthlyRevenue: {
  type: "number",
  label: t("estimatedMonthlyRevenue.label"),
  decimal: 2,
  suffix: "€",
  caption: t("estimatedMonthlyRevenue.caption"),
},
```

Additional properties:
- `suffix?: string` - currency symbol or unit (e.g., "€", "%")
- `decimal?: number` - number of decimal places
- `formatNumber?: boolean` - defaults to `true`, only change if explicitly stated
- `locale?: Intl.LocalesArgument` - defaults to `de-DE`, only change if explicitly stated

## `password`

```typescript
password: {
  type: "password",
  label: t("password.label"),
},
```

No additional properties. Does NOT support `asyncValidate`.

## `textarea`

```typescript
specialNotes: {
  type: "textarea",
  label: t("specialNotes.label"),
},
```

No additional properties.

## `checkbox`

```typescript
acceptedTerms: {
  type: "checkbox",
  label: "I am the label of the checkbox",
},
```

Additional properties:
- `disabled?: boolean`
- `disabledTooltipText?: string`

## `datepicker`

```typescript
birthDate: {
  type: "datepicker",
  label: "Geburtsdatum",
},
```

No additional properties.

## `select`

Requires `items` from an options hook. See [options.md](options.md).

```typescript
const averagePaymentTermOptions = useAveragePaymentTermOptions();

averagePaymentTerm: {
  type: "select",
  label: t("averagePaymentTerm.label"),
  items: averagePaymentTermOptions,
},
```

Additional properties:
- `items: SelectItems` - **required** - array of `{ label: string; value: string }`

## `radio-group`

Requires `items` from an options hook. See [options.md](options.md).

```typescript
const salutationOptions = useSalutationOptions();

salutation: {
  type: "radio-group",
  label: t("salutation.label"),
  items: salutationOptions,
},
```

Additional properties:
- `items: RadioGroupItems` - **required**
- `variant?: "default" | "likert"` - defaults to `"default"`. ALWAYS use `"likert"` when variant is requested.
- `orientation?: "horizontal" | "vertical"`

## `yes-no-radio-group`

ALWAYS use this instead of `radio-group` when options are "Yes"/"No" (or "Ja"/"Nein"). ALWAYS validate with `YesNoValidationSchema` in the schema.

```typescript
usesThirdPartyBillingSoftware: {
  type: "yes-no-radio-group",
  label: t("usesThirdPartyBillingSoftware.label"),
  caption: t("usesThirdPartyBillingSoftware.caption"),
},
```

No additional properties beyond base config.

## `selectable-cards`

Requires `options` from an options hook. See [options.md](options.md).

```typescript
const usagePurposeOptions = useUsagePurposeOptions();

usagePurposes: {
  type: "selectable-cards",
  label: "",
  selectType: "multiple",
  options: usagePurposeOptions,
},
```

Additional properties:
- `options: SelectableCardOption[]` - **required** - array of `{ id: string; label: string; subLabel?: string; icon: ComponentType }`
- `selectType: "single" | "multiple"` - **required**

## `array`

For schema fields that are `z.array(z.object({...}))`. The parent gets `type: "array"` and children are configured as nested properties.

```typescript
// Schema
institutionalIdentifiers: z.array(
  z.object({
    identifier: InstitutionalIdentifierValidationSchema,
  }),
),

// useFormFields
institutionalIdentifiers: {
  type: "array",
  identifier: {
    type: "input",
    label: t("fields.institutionalIdentifiers.label"),
  },
},
```

See [file-templates.md](file-templates.md) for how to render array fields in the FormFields component.

## Nested Object Fields

For nested schema objects, mirror the nesting in fields config:

```typescript
// Schema
subsidy: z.object({
  subsidyIncluded: YesNoValidationSchema,
  subsidyAmount: z.coerce.number().optional(),
})

// useFormFields
subsidy: {
  subsidyIncluded: {
    type: "yes-no-radio-group",
    label: t("fields.subsidyIncluded.label"),
  },
  subsidyAmount: {
    type: "number",
    label: t("fields.subsidyAmount.label"),
    suffix: "€",
    renderCondition: (formValues) => {
      return formValues.subsidy.subsidyIncluded === YesNoOptions.YES;
    },
  },
},
```

## Conditional Rendering with `renderCondition`

Use `renderCondition` to show/hide fields based on other field values:

```typescript
customIndustry: {
  type: "input",
  label: t("customIndustry.label"),
  renderCondition: (formValues) => {
    return formValues.industry.name === IndustryOptions.SONSTIGES;
  },
},
```
