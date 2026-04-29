# Creating the Request

`{requestPath}/get{ListName}List.ts` is a server function that fetches the data for the list. The skeleton is the same for every list; specific actions plug into the same shape.

For per-action wiring (which fields to destructure, what to pass into `buildApiUrl`), see [actions.md](actions.md). This page covers the file's overall structure.

Look in `{requestPath}/server.ts` for the correct paginated fetch helper to call (`getPaginated{ListName}` or similar).

## Shape A — No grouping

Use this shape when the list has no Group action. Any combination of Search / Sort / Archived plugs in by including those fields in the destructure and the `buildApiUrl` `searchParams` argument; `buildApiUrl` does the API mapping generically.

```ts
import { Parsed{ListName}SearchParams } from "@/features/.../{listName}SearchParams";
import { buildApiUrl } from "@/shared/backend/models/common/buildApiUrl";
import { collectPaginatedData } from "@/shared/backend/models/common/collectPaginatedData";
import { get{ListName} } from "@/shared/backend/models/{model}/server";
import { Constants } from "@/shared/utils/constants";
import { getExtracted } from "next-intl/server";

export async function get{ListName}List(
  searchParams: Parsed{ListName}SearchParams,
) {
  const { search, pagination, sortBy, archived } = searchParams;  // ← include only what the list uses
  const currentPage = pagination["default"] || "1";
  const t = await getExtracted();

  const apiUrl = buildApiUrl({
    baseUrl: "/path/to/resource",
    searchParams: { search, sortBy, archived },
    additionalParams: {
      page: currentPage,
      limit: Constants.defaultPageSize,
    },
  });

  return collectPaginatedData({
    apiUrl,
    title: t("{German section title}"),
    groupKey: "default",
    apiCall: () => get{ListName}(apiUrl)({}),
  });
}
```

## Shape B — With grouping

Group flips the request between a flat paginated fetch (when no group is selected) and a multi-fetch (`collectGroupedData`) that runs one paginated fetch per group value.

The `if-else` shape and the **pre-initialized `listItems`** are mandatory — they let TypeScript and the caller see one consistent return shape regardless of which branch ran.

```ts
import {
  Parsed{ListName}SearchParams,
  {ListName}GroupByEnum,
  {ListName}GroupByStatusEnum,
} from "@/features/.../{listName}SearchParams";
import { buildApiUrl } from "@/shared/backend/models/common/buildApiUrl";
import { collectGroupedData } from "@/shared/backend/models/common/collectGroupedData";
import { collectPaginatedData } from "@/shared/backend/models/common/collectPaginatedData";
import { {LIST_NAME}_GROUP_CONFIG } from "./{listName}GroupConfigs";
import { ListItems } from "@/shared/types/InteractiveListTypes";
import { {ListName}ItemType } from "@/shared/backend/models/{model}/schema";
import { getPaginated{ListName} } from "@/shared/backend/models/{model}/server";
import { Constants } from "@/shared/utils/constants";
import { getExtracted } from "next-intl/server";

export async function get{ListName}List(
  searchParams: Parsed{ListName}SearchParams,
) {
  const { search, pagination, sortBy, groupBy, archived } = searchParams;
  const currentPage = pagination["default"] || "1";
  const t = await getExtracted();
  let listItems: ListItems<{ListName}ItemType[]> = [];   // ← always initialize before if-else

  if (groupBy && groupBy in {LIST_NAME}_GROUP_CONFIG) {
    const groupConfig =
      {LIST_NAME}_GROUP_CONFIG[
        groupBy as Exclude<{ListName}GroupByEnum, {ListName}GroupByEnum.NONE>
      ];

    const statusTitles: Record<{ListName}GroupByStatusEnum, string> = {
      [{ListName}GroupByStatusEnum.UNMAPPED]: t("Nicht zugeordnet"),
      // ...one entry per sub-enum value
    };

    const titles: Record<string, string> = statusTitles;
    // For multiple group dimensions, build one titles map per sub-enum and pick
    // the right one based on `groupBy`:
    //   const titles = groupBy === {ListName}GroupByEnum.PROCESS_LANE ? processLaneTitles : statusTitles;

    listItems = await collectGroupedData({
      searchParams,
      groupConfig,
      path: "/path/to/resource",
      titles,
      apiCall: (apiUrl) => getPaginated{ListName}(apiUrl)({}),
    });
  } else {
    const apiUrl = buildApiUrl({
      baseUrl: "/path/to/resource",
      searchParams: { search, sortBy, archived },
      additionalParams: {
        page: currentPage,
        limit: Constants.defaultPageSize,
      },
    });

    listItems = await collectPaginatedData({
      apiUrl,
      title: t("{German section title}"),
      groupKey: "default",
      apiCall: () => getPaginated{ListName}(apiUrl)({}),
    });
  }

  return listItems;
}
```

Notes:
- The `if-else` condition uses the destructured `groupBy`, not `searchParams.groupBy`. When `groupBy` is `NONE` (the "no grouping" enum value), it isn't in the group config — so the else-branch fires correctly without an extra check.
- The `as Exclude<…, NONE>` cast tells TypeScript that we've already proven `groupBy in CONFIG`, so the indexed access is safe.
- `collectGroupedData` reads `searchParams` so search / sortBy / archived still apply within each group's fetch.
- `titles` is built inline per request and passed to `collectGroupedData` separately — the `GroupConfig` type itself only carries `queryParam` and `values`.

## Multi-list

When multiple lists share SearchParams, create **one request function per list** (e.g. `get{ListNameA}.ts`, `get{ListNameB}.ts`). Each function reads its own pagination key (`pagination["{listKeyA}"]` vs `pagination["{listKeyB}"]`) and uses a matching `groupKey` in `collectPaginatedData`. Both receive the full `searchParams` so the shared `search` is passed automatically. See [multi-list-shared-search.md](multi-list-shared-search.md).

## Rules

- Pre-initialize `listItems` before the `if-else` block (Shape B). The TypeScript checker depends on it; conditional initialization breaks the return type.
- Pass the full destructured fields into `buildApiUrl`'s `searchParams` argument. `buildApiUrl` is generic and only emits query params for fields it recognizes — passing extras is safe.
- Don't build query param schemas in the endpoint config; everything flows through `buildApiUrl`.
