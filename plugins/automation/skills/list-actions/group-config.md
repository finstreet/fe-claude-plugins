# Group Config

File: `{featurePath}/{listName}GroupConfigs.ts`

Only needed for Case 3 (grouping). Provides the query param, allowed values, and translation key for each group-by option.

## Type

```typescript
// from "@/shared/types/GroupConfig"
export type GroupConfig = {
  queryParam: string;   // ← API query param for this filter (from Swagger/context)
  values: string[];     // ← all possible group values (from the sub-enum)
  translationKey: string; // ← always "{enumValue}.titles"
};
```

## Template

```typescript
import { GroupConfig } from "@/shared/types/GroupConfig";
import { {ListName}GroupByEnum, {ListName}GroupByStatusEnum } from './{listName}SearchParams';

export const {LIST_NAME}_GROUP_CONFIG: Record<{ListName}GroupByEnum, GroupConfig> = {
  [{ListName}GroupByEnum.STATUS]: {
    queryParam: 'q[status_eq]',                        // ← from Swagger or context
    values: Object.values({ListName}GroupByStatusEnum),
    translationKey: 'status.titles',                   // ← always "{enumValue}.titles"
  },
  [{ListName}GroupByEnum.HOA_ALREADY_CUSTOMER]: {
    queryParam: 'q[hoa_already_customer]',
    values: Object.values({ListName}GroupByHoaAlreadyCustomerEnum),
    translationKey: 'hoa_already_customer.titles',
  },
};
```

## Rules

- The `Record` type must be keyed by the `GroupByEnum` — every enum value must have an entry
- `queryParam` comes from the Swagger parameters or context
- `values` always comes from `Object.values()` of the corresponding sub-enum
- `translationKey` is always `{enumValue}.titles` where `enumValue` matches the enum string value
