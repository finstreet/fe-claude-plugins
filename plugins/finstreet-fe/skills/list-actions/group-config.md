# Group Config

File: `{featurePath}/{listName}GroupConfigs.ts`

Only needed when the list has the Group action. Maps each `groupBy` enum value to its API query param and the set of allowed values. The grouped fetch uses this config to know which query param to filter on and what values to iterate over (one paginated fetch per value). For the full Group action recipe (parser, items hook, request handling, slot), see [actions.md § Group](actions.md#group).

## Type

```ts
// from "@/shared/types/GroupConfig"
export type GroupConfig = {
  queryParam: string;   // ← API query param for this filter (from Swagger/context)
  values: string[];     // ← all possible group values (from the sub-enum)
};
```

The translated headings shown above each group are NOT part of `GroupConfig` — they're built as a separate `titles: Record<string, string>` map in the request file (see actions.md § Group).

## Template

The `Record` is keyed on `Exclude<{ListName}GroupByEnum, {ListName}GroupByEnum.NONE>` because the `NONE` value is the "no grouping" marker — it's only present in the enum so the `<GroupByAction />` dropdown can render a "Keine Gruppierung" option, never as a real grouped fetch.

```ts
import { GroupConfig } from "@/shared/types/GroupConfig";
import {
  {ListName}GroupByEnum,
  {ListName}GroupByStatusEnum,
} from "./{listName}SearchParams";

export const {LIST_NAME}_GROUP_CONFIG: Record<
  Exclude<{ListName}GroupByEnum, {ListName}GroupByEnum.NONE>,
  GroupConfig
> = {
  [{ListName}GroupByEnum.STATUS]: {
    queryParam: "q[status_eq]",                        // ← from Swagger
    values: Object.values({ListName}GroupByStatusEnum),
  },
  // ...one entry per non-NONE GroupByEnum value
};
```

## Rules

- The `Record` type is keyed on `Exclude<{ListName}GroupByEnum, NONE>` — every non-NONE enum value must have an entry.
- `queryParam` comes from the Swagger parameters or context.
- `values` always comes from `Object.values()` of the corresponding sub-enum.
- Translated headings live in the request file's `titles` map, NOT here.
