# Building the TaskGroup

File: `{featurePath}/taskGroups/{taskGroupName}/{Product}{Role}{TaskGroupName}TaskGroup.tsx`

The TaskGroup assembles all TaskPanels under a labeled wrapper. It receives the full overview response and distributes section data to each TaskPanel.

The TaskGroup itself does NOT use `TasksAndActionsLayout` — that layout lives inside each individual TaskPanel. The TaskGroup just wraps TaskPanels in a `VStack`.

## Template

```tsx
import { TaskGroup } from "@finstreet/ui/components/patterns/TaskGroup";
import { VStack } from "@styled-system/jsx";
import { useExtracted } from "next-intl";
import { {Product}{Role}{Panel1}TaskPanel } from "./taskPanels/{Product}{Role}{Panel1}TaskPanel";
import { {Product}{Role}{Panel2}TaskPanel } from "./taskPanels/{Product}{Role}{Panel2}TaskPanel";

type Props = {
  financingCaseId: string;
  financingCaseOverviewResponse: OverviewResponseType;
};

export const {Product}{Role}{TaskGroupName}TaskGroup = ({
  financingCaseId,
  financingCaseOverviewResponse,
}: Props) => {
  const t = useExtracted();

  const { sections, flags } = financingCaseOverviewResponse;

  return (
    <TaskGroup label={t("label")}>
      <VStack gap={4} alignItems="stretch">
        <{Product}{Role}{Panel1}TaskPanel
          financingCaseId={financingCaseId}
          completed={sections.{panel1Section}.completed}
        />

        <{Product}{Role}{Panel2}TaskPanel
          financingCaseId={financingCaseId}
          completed={sections.{panel2Section}.completed}
          flags={flags}
        />
      </VStack>
    </TaskGroup>
  );
};
```

## Passing Data to TaskPanels

The TaskGroup destructures `sections` and `flags` from the response and passes the relevant slice to each TaskPanel. How much data each panel gets depends on its complexity:

- **Simple panel**: just `completed` boolean
- **Panel with summary**: `completed`, `completedCount`, `totalCount`
- **Panel with subtasks**: the whole section object (e.g. `contractDetails={sections.contractDetails}`)
- **Panel with actions**: also gets `flags` for enable/disable state

## Rules

- The TaskGroup only passes data down — it contains no business logic
- Always wrap TaskPanels in `<VStack gap={4} alignItems="stretch">`
- Use `useExtracted` for the `label` translation
- The overview response type should be imported from the backend schema
