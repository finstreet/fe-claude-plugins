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
