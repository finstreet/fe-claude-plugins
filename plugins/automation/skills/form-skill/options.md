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
import { useTranslations } from "next-intl";

export enum SalutationOptions {
  MALE = "mr",
  FEMALE = "ms",
}

export function useSalutationOptions() {
  const t = useTranslations(
    "inquiryProcess.contactData.fields.salutation.items",
  );

  return Object.values(SalutationOptions).map((salutation) => ({
    label: t(salutation),
    value: salutation,
  }));
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
import { useTranslations } from "next-intl";
import { FaHouse } from "react-icons/fa6";
import { IconType } from "react-icons";

export enum UsagePurposes {
  FACADE = "facade",
  ROOF = "roof",
  HEATING = "heating",
  OTHER = "other",
}

const usagePurposeIcons: Record<UsagePurposes, IconType> = {
  facade: FaHouse,
  roof: FaHouse,
  heating: FaHouse,
  other: FaHouse,
};

export function useUsagePurposeOptions() {
  const t = useTranslations("financingDetails.fields.usagePurpose.items");

  return Object.values(UsagePurposes).map((usagePurpose) => ({
    label: t(usagePurpose),
    id: usagePurpose,
    icon: usagePurposeIcons[usagePurpose],
  }));
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
import { useTranslations } from "next-intl";
import { FaHouse } from "react-icons/fa6";
import { GetOptionsResponseType } from "@/shared/backend/models/someResource";

export enum AccountKindOptions {
  CHECKING_ACCOUNT = "checkingAccount",
  FIXED_DEPOSIT = "fixedDeposit",
}

export function useAccountKindOptions(
  options: GetOptionsResponseType,
) {
  const t = useTranslations("accountKinds.items");

  return [
    {
      label: t("checkingAccount.label"),
      subLabel: `${options.overnightDepositInterestRate}%`, // Dynamic from backend
      id: AccountKindOptions.CHECKING_ACCOUNT,
      icon: FaHouse,
    },
    {
      label: t("fixedDeposit.label"),
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
  const t = useTranslations("{namespace}.fields");

  return {
    investmentDurations: {
      type: "select",
      label: t("investmentDurations.label"),
      items: options.durations.map((d) => ({
        label: `${d.amount} ${d.displayUnit}`,
        value: d.amount.toString(),
      })),
    },
    department: {
      type: "select",
      label: t("department.label"),
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
