# Options Reference

Options are required for `select`, `radio-group`, and `selectable-cards` field types. Each set of options lives in its own hook file under `{parentDirectory}/options/`.

## When to Create Options

ONLY create options files when the field type is one of:
- `select`
- `radio-group`
- `selectable-cards`

## Select / Radio Group Options

Options for `select` and `radio-group` return `{ label: string; value: string }[]`.

```typescript
// path: {parent}/options/useSalutationOptions.ts
import { useExtracted } from "next-intl";

export enum SalutationOptions {
  MALE = "mr",
  FEMALE = "ms",
}

export function useSalutationOptions() {
  const t = useExtracted();

  return [
    { label: t("Herr"), value: SalutationOptions.MALE },
    { label: t("Frau"), value: SalutationOptions.FEMALE },
  ];
}
```

## Selectable Cards Options

Options for `selectable-cards` return `SelectableCardOption[]`:

```typescript
type SelectableCardOption = {
  id: string;
  label: string;
  subLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
};
```

If no icons are provided, ALWAYS use `FaHouse` as a placeholder.

```typescript
// path: {parent}/options/useUsagePurposeOptions.ts
import { useExtracted } from "next-intl";
import { FaHouse } from "react-icons/fa6";

export enum UsagePurposes {
  FACADE = "facade",
  ROOF = "roof",
  HEATING = "heating",
  OTHER = "other",
}

export function useUsagePurposeOptions() {
  const t = useExtracted();

  return [
    { label: t("Fassade"), id: UsagePurposes.FACADE, icon: FaHouse },
    { label: t("Dach"), id: UsagePurposes.ROOF, icon: FaHouse },
    { label: t("Heizung"), id: UsagePurposes.HEATING, icon: FaHouse },
    { label: t("Sonstiges"), id: UsagePurposes.OTHER, icon: FaHouse },
  ];
}
```

Key differences from select/radio options:
- Uses `id` instead of `value`
- Requires an `icon` property
- Optional `subLabel` for additional description text

## Options from API Responses

When options depend on backend data (dynamic labels, dynamic sublabels, API-provided lists), pass the API response as a parameter to the options hook:

```typescript
// path: {parent}/options/useAccountKindOptions.ts
import { useExtracted } from "next-intl";
import { FaHouse } from "react-icons/fa6";
import { GetOptionsResponseType } from "@/shared/backend/models/someResource";

export enum AccountKindOptions {
  CHECKING_ACCOUNT = "checkingAccount",
  FIXED_DEPOSIT = "fixedDeposit",
}

export function useAccountKindOptions(
  options: GetOptionsResponseType,
) {
  const t = useExtracted();

  return [
    {
      label: t("Girokonto"),
      subLabel: `${options.overnightDepositInterestRate}%`, // Dynamic from backend
      id: AccountKindOptions.CHECKING_ACCOUNT,
      icon: FaHouse,
    },
    {
      label: t("Festgeld"),
      subLabel: `${options.fixedDepositRate}%`, // Dynamic from backend
      id: AccountKindOptions.FIXED_DEPOSIT,
      icon: FaHouse,
    },
  ];
}
```

Then pass the API data through to the options hook in useFormFields:

```typescript
export function use{FormName}FormFields(
  options: GetOptionsResponseType,
): FormFieldsType<{FormName}Type> {
  const accountKindOptions = useAccountKindOptions(options);
  // ...
}
```

## Inline Options from API Data

For simple cases where a separate options hook would be overkill, map API data directly in useFormFields:

```typescript
export function use{FormName}FormFields(
  options: GetOptionsResponseType,
): FormFieldsType<{FormName}Type> {
  const t = useExtracted();

  return {
    investmentDurations: {
      type: "select",
      label: t("{German label for investmentDurations}"),
      items: options.durations.map((d) => ({
        label: `${d.amount} ${d.displayUnit}`,
        value: d.amount.toString(),
      })),
    },
    department: {
      type: "select",
      label: t("{German label for department}"),
      items: options.departments.map((dept) => ({
        label: dept.label,
        value: dept.value,
      })),
    },
  };
}
```

When useFormFields accepts parameters, the formConfig must pass them through:

```typescript
// In useFormConfig:
const fields = use{FormName}FormFields(options);
```
