---
name: task-group
description: "Complete guide to building TaskGroups with @finstreet/ui. A TaskGroup displays a set of tasks a user must complete before proceeding. Covers TaskPanels, TaskActions, and the TaskGroup wrapper."
---

# Task Group — Complete Guide

A `TaskGroup` shows users a set of tasks they need to complete. It consists of:

- **TaskPanels** — individual task cards, each with a status indicator and optional subtasks
- **TaskAction** — a panel with action buttons (links or modal triggers)
- **TaskGroup** — the wrapper that lays out panels and actions side by side

## Directory Structure

```
{featurePath}/taskGroups/{taskGroupName}/
  ├── taskPanels/
  │   ├── {Product}{Role}{TaskPanelName}TaskPanel.tsx
  │   └── ...                                          ← one file per TaskPanel
  ├── {Product}{Role}{TaskGroupName}Action.tsx
  └── {Product}{Role}{TaskGroupName}TaskGroup.tsx
```

## File Creation Order

1. All TaskPanels (can be built independently of each other)
2. TaskAction
3. TaskGroup (assembles everything)

## Key Imports

```typescript
// TaskPanel components
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
  TaskPanelContent,
} from '@finstreet/ui/components/patterns/TaskPanel';

// SubTask (for TaskPanelContent)
import { SubTask } from '@finstreet/ui/components/patterns/SubTask';

// ActionPanel components
import {
  ActionPanel,
  ActionPanelContent,
  ActionPanelAction,
} from '@finstreet/ui/components/patterns/ActionPanel';

// TaskGroup layout
import { TaskGroup } from '@finstreet/ui/components/patterns/TaskGroup';
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from '@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout';

// Routes and translations
import { routes } from '@/routes';
import { useTranslations } from 'next-intl';
import { VStack } from '@styled-system/jsx';
```

## Step-by-Step Reference

- For **TaskPanel** patterns (shell, status, subtasks), see [task-panel.md](task-panel.md)
- For **TaskAction** patterns (link and click actions), see [task-action.md](task-action.md)
- For **TaskGroup** assembly, see [task-group.md](task-group.md)

## Rules

1. Build all TaskPanels before the Action and TaskGroup
2. `prefetch={true}` and `scroll={true}` on `TaskPanel` and `SubTask` unless told otherwise
3. Each `TaskPanel` always receives a `completed` prop; add more specific props as needed
4. Each click action in a TaskAction gets a `handle{ActionName}` function with a `console.log` TODO
5. Use `done` / `active` status — only use `inactive` or `warning` if explicitly required
