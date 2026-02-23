# Building a Task Panel

File: `{featurePath}/taskGroups/{taskGroupName}/taskPanels/{Product}{Role}{TaskPanelName}TaskPanel.tsx`

## Shell (required)

Every TaskPanel needs these four components:

```tsx
import { routes } from '@/routes';
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
} from '@finstreet/ui/components/patterns/TaskPanel';
import { useTranslations } from 'next-intl';

type {TaskPanelName}TaskPanelProps = {
  financingCaseId: string;    // ← or whatever ID is needed for route building
  completed: boolean;
  // add more specific completion props as needed
};

export function {TaskPanelName}TaskPanel({
  financingCaseId,
  completed,
}: {TaskPanelName}TaskPanelProps) {
  const t = useTranslations('{translationNamespace}');

  return (
    <TaskPanel
      href={routes.{role}.{resource}.{action}(financingCaseId)}
      prefetch={true}
      scroll={true}
      name={t('{task}.title')}
    >
      <TaskPanelHeader>
        <TaskPanelStatus status={completed ? 'done' : 'active'} />
        <TaskPanelTitle>{t('{task}.title')}</TaskPanelTitle>
      </TaskPanelHeader>
    </TaskPanel>
  );
}
```

### TaskPanel props

```typescript
type TaskPanelProps = {
  collapsible?: boolean;
  startOpen?: boolean;
  children: React.ReactNode;
  href?: string;          // ← link destination for the whole panel
  name?: string;          // ← used for accessibility
  variant?: 'bordered' | 'flat';
  css?: SystemStyleObject;
  error?: boolean;
} & Pick<LinkProps, 'scroll' | 'replace' | 'prefetch'>;
```

### TaskPanelStatus

```typescript
type TaskPanelStatusProps = {
  status: 'done' | 'active' | 'inactive' | 'warning';
};

// Default pattern:
<TaskPanelStatus status={completed ? 'done' : 'active'} />
```

## TaskPanelContent with SubTasks

Add `TaskPanelContent` and `SubTask` components when the context defines subtasks:

```tsx
import { SubTask } from '@finstreet/ui/components/patterns/SubTask';
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
  TaskPanelContent,
} from '@finstreet/ui/components/patterns/TaskPanel';

type {TaskPanelName}TaskPanelProps = {
  financingCaseId: string;
  completed: boolean;
  subtaskOneCompleted: boolean;
  subtaskTwoCompleted: boolean;
};

export function {TaskPanelName}TaskPanel({
  financingCaseId,
  completed,
  subtaskOneCompleted,
  subtaskTwoCompleted,
}: {TaskPanelName}TaskPanelProps) {
  const t = useTranslations('{translationNamespace}');

  return (
    <TaskPanel
      href={routes.{role}.{resource}.overview(financingCaseId)}
      prefetch={true}
      scroll={true}
      name={t('{task}.title')}
    >
      <TaskPanelHeader>
        <TaskPanelStatus status={completed ? 'done' : 'active'} />
        <TaskPanelTitle>{t('{task}.title')}</TaskPanelTitle>
      </TaskPanelHeader>
      <TaskPanelContent>
        <SubTask
          status={subtaskOneCompleted ? 'done' : 'active'}
          actionLabel={t('{task}.subtasks.one.actionLabel')}
          name={t('{task}.subtasks.one.title')}
          href={routes.{role}.{resource}.subtaskOne(financingCaseId)}
          prefetch={true}
          scroll={true}
        >
          {t('{task}.subtasks.one.title')}
        </SubTask>
        <SubTask
          status={subtaskTwoCompleted ? 'done' : 'active'}
          actionLabel={t('{task}.subtasks.two.actionLabel')}
          name={t('{task}.subtasks.two.title')}
          href={routes.{role}.{resource}.subtaskTwo(financingCaseId)}
          prefetch={true}
          scroll={true}
        >
          {t('{task}.subtasks.two.title')}
        </SubTask>
      </TaskPanelContent>
    </TaskPanel>
  );
}
```

### SubTask props

```typescript
type SubTaskProps = {
  children: React.ReactNode;
  status: 'done' | 'active' | 'inactive' | 'warning';
  href: string;
  name: string;
  actionLabel?: string;       // ← text displayed at the far right
  'data-testid'?: string;
} & Pick<LinkProps, 'scroll' | 'replace' | 'prefetch'>;
```

## Component Props Pattern

Props always include:
- `completed: boolean` — overall panel completion
- `{subTaskName}Completed: boolean` — one per subtask
- Any route params needed (e.g. `financingCaseId: string`)
