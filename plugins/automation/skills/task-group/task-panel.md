# Building a Task Panel

File: `{featurePath}/taskGroups/{taskGroupName}/taskPanels/{Product}{Role}{PanelName}TaskPanel/index.tsx`

Every TaskPanel wraps itself in `TasksAndActionsLayout`. This layout gives each panel its own `tasks` area (the card itself) and `actions` area (an optional ActionPanel). Even panels without actions include the empty actions area — this keeps the layout grid consistent.

## Translation Namespace

The translation namespace for a TaskPanel always includes the full path through the taskGroup:

```
{translationNamespace}.taskGroups.{taskGroupName}.taskPanels.{panelName}
```

For example, if the base namespace is `financingCaseOverview.hoaAccount.fsp` and the taskGroup is `customerDetails`, a panel called `inquiry` uses:
```
financingCaseOverview.hoaAccount.fsp.taskGroups.customerDetails.taskPanels.inquiry
```

This matters because taskGroups namespace the translation keys — without the `taskGroups.{taskGroupName}` segment, you'll get the wrong translations.

## Minimal TaskPanel (link, no actions)

The simplest case: a panel that links somewhere and shows a completion status.

```tsx
import { routes } from "@/routes";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
} from "@finstreet/ui/components/patterns/TaskPanel";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  completed: boolean;
};

export const {Product}{Role}{PanelName}TaskPanel = ({
  completed,
  financingCaseId,
}: Props) => {
  const t = useTranslations(
    "{translationNamespace}.taskGroups.{taskGroupName}.taskPanels.{panelName}",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel
          href={routes.{role}.{resource}.{action}(financingCaseId)}
          prefetch={true}
          scroll={true}
          name={t("title")}
        >
          <TaskPanelHeader>
            <TaskPanelStatus status={completed ? "done" : "active"} />
            <TaskPanelTitle>{t("title")}</TaskPanelTitle>
          </TaskPanelHeader>
        </TaskPanel>
      </Area>
      <Area gridArea={"actions"}>
        <></>
      </Area>
    </TasksAndActionsLayout>
  );
};
```

## TaskPanel with ActionPanel

When a panel has associated actions, import the co-located ActionPanel and render it in the `actions` area.

```tsx
import { routes } from "@/routes";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
} from "@finstreet/ui/components/patterns/TaskPanel";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";
import { useTranslations } from "next-intl";
import { {Product}{Role}{PanelName}ActionPanel } from "./{Product}{Role}{PanelName}ActionPanel";

type Props = {
  financingCaseId: string;
  completed: boolean;
  flags: FlagsType;
};

export const {Product}{Role}{PanelName}TaskPanel = ({
  financingCaseId,
  completed,
  flags,
}: Props) => {
  const t = useTranslations(
    "{translationNamespace}.taskGroups.{taskGroupName}.taskPanels.{panelName}",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel
          href={routes.{role}.{resource}.{action}(financingCaseId)}
          prefetch={true}
          scroll={true}
          name={t("title")}
        >
          <TaskPanelHeader>
            <TaskPanelStatus status={completed ? "done" : "active"} />
            <TaskPanelTitle>{t("title")}</TaskPanelTitle>
          </TaskPanelHeader>
        </TaskPanel>
      </Area>
      <Area gridArea={"actions"}>
        <{Product}{Role}{PanelName}ActionPanel
          financingCaseId={financingCaseId}
          flags={flags}
        />
      </Area>
    </TasksAndActionsLayout>
  );
};
```

## TaskPanel with Summary

`TaskPanelSummary` sits inside `TaskPanelHeader`, after `TaskPanelTitle`. Wrap it in `<Box hideBelow={"lg"}>` so it hides on mobile.

```tsx
import { Typography } from "@finstreet/ui/components/base/Typography";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
  TaskPanelSummary,
} from "@finstreet/ui/components/patterns/TaskPanel";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";
import { Box } from "@styled-system/jsx";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  completed: boolean;
  completedCount: number;
  totalCount: number;
};

export const {Product}{Role}{PanelName}TaskPanel = ({
  financingCaseId,
  completed,
  completedCount,
  totalCount,
}: Props) => {
  const t = useTranslations(
    "{translationNamespace}.taskGroups.{taskGroupName}.taskPanels.{panelName}",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel
          href={routes.{role}.{resource}.{action}(financingCaseId)}
          prefetch={true}
          scroll={true}
          name={t("title")}
        >
          <TaskPanelHeader>
            <TaskPanelStatus status={completed ? "done" : "active"} />
            <TaskPanelTitle>{t("title")}</TaskPanelTitle>
            <Box hideBelow={"lg"}>
              <TaskPanelSummary justifyContent={"flex-end"}>
                <Typography textAlign={"right"}>
                  {t.rich("summary", {
                    br: () => <br />,
                    strong: (chunks) => <strong>{chunks}</strong>,
                    current: () => completedCount,
                    total: () => totalCount,
                  })}
                </Typography>
              </TaskPanelSummary>
            </Box>
          </TaskPanelHeader>
        </TaskPanel>
      </Area>
      <Area gridArea={"actions"}>
        <></>
      </Area>
    </TasksAndActionsLayout>
  );
};
```

## Collapsible TaskPanel with SubTasks

Use `collapsible` on `TaskPanel` and add `TaskPanelContent` with `SubTask` children. Collapsible panels typically don't have an `href` on the outer `TaskPanel` — the SubTasks provide the links instead.

```tsx
import { routes } from "@/routes";
import { SubTask } from "@finstreet/ui/components/patterns/SubTask";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
  TaskPanelContent,
} from "@finstreet/ui/components/patterns/TaskPanel";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  contractDetails: ContractDetailsType;
};

export const {Product}{Role}{PanelName}TaskPanel = ({
  financingCaseId,
  contractDetails,
}: Props) => {
  const t = useTranslations(
    "{translationNamespace}.taskGroups.{taskGroupName}.taskPanels.{panelName}",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel collapsible>
          <TaskPanelHeader>
            <TaskPanelStatus
              status={contractDetails.completed ? "done" : "active"}
            />
            <TaskPanelTitle>{t("title")}</TaskPanelTitle>
          </TaskPanelHeader>
          <TaskPanelContent>
            <SubTask
              status={
                contractDetails.subtaskOne.completed ? "done" : "active"
              }
              actionLabel={
                contractDetails.subtaskOne.completed
                  ? t("subtasks.subtaskOne.actions.viewData")
                  : t("subtasks.subtaskOne.actions.addData")
              }
              name={t("subtasks.subtaskOne.title")}
              href={routes.{role}.{resource}.subtaskOne(financingCaseId)}
              prefetch={true}
              scroll={true}
            >
              {t("subtasks.subtaskOne.title")}
            </SubTask>
            <SubTask
              status={
                contractDetails.subtaskTwo.completed ? "done" : "active"
              }
              actionLabel={
                contractDetails.subtaskTwo.completed
                  ? t("subtasks.subtaskTwo.actions.viewData")
                  : t("subtasks.subtaskTwo.actions.addData")
              }
              name={t("subtasks.subtaskTwo.title")}
              href={routes.{role}.{resource}.subtaskTwo(financingCaseId)}
              prefetch={true}
              scroll={true}
            >
              {t("subtasks.subtaskTwo.title")}
            </SubTask>
          </TaskPanelContent>
        </TaskPanel>
      </Area>
      <Area gridArea={"actions"}>
        <></>
      </Area>
    </TasksAndActionsLayout>
  );
};
```

## TaskPanel Props Reference

```typescript
type TaskPanelProps = {
  collapsible?: boolean;
  startOpen?: boolean;
  children: React.ReactNode;
  href?: string;
  name?: string;
  variant?: "bordered" | "flat";
  css?: SystemStyleObject;
  error?: boolean;
} & Pick<LinkProps, "scroll" | "replace" | "prefetch">;
```

## TaskPanelStatus

```typescript
type TaskPanelStatusProps = {
  status: "done" | "active" | "inactive" | "warning";
};
// Default: status={completed ? "done" : "active"}
```

## SubTask Props Reference

```typescript
type SubTaskProps = {
  children: React.ReactNode;
  status: "done" | "active" | "inactive" | "warning";
  href: string;
  name: string;
  actionLabel?: string;
  "data-testid"?: string;
} & Pick<LinkProps, "scroll" | "replace" | "prefetch">;
```
