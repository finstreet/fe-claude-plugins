# Implementing the Container

File: `{featurePath}/index.tsx`

The container is a Server Component that fetches data and passes it to the Client presentation component.

## Template

```typescript
import { {ListName}PresentationList } from "@/features/.../{ ListName}PresentationList";
import { Parsed{ListName}SearchParams } from "@/features/.../{listName}SearchParams";
import { get{ListName}List } from "@/shared/backend/models/{model}/get{ListName}List";

type {ListName}Props = {
  searchParams: Parsed{ListName}SearchParams;
};

export async function {ListName}({ searchParams }: {ListName}Props) {
  const items = await get{ListName}List(searchParams);

  return <{ListName}PresentationList data={items} />;
}
```

## Rules

- This is a Server Component (`async function`) — no `'use client'` directive
- Always pass `searchParams` down from the page
- Prop name passed to the presentation component is always `data`
