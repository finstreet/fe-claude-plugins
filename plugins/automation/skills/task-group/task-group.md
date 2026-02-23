# Building the TaskGroup

File: `{featurePath}/taskGroups/{taskGroupName}/{Product}{Role}{TaskGroupName}TaskGroup.tsx`

The TaskGroup assembles all TaskPanels and the TaskAction into a two-column layout (tasks | actions).

## Template

```tsx
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from '@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout';
import { TaskGroup } from '@finstreet/ui/components/patterns/TaskGroup';
import { VStack } from '@styled-system/jsx';
import { useTranslations } from 'next-intl';
import { {Product}{Role}{TaskPanelName}TaskPanel } from './taskPanels/{Product}{Role}{TaskPanelName}TaskPanel';
import { {Product}{Role}{TaskGroupName}Action } from './{Product}{Role}{TaskGroupName}Action';

type {TaskGroupName}TaskGroupProps = {
  financingCaseId: string;
  sections: {
    {taskPanelName}: {
      completed: boolean;
      // subtask completions as needed
    };
    // one entry per TaskPanel
  };
  flags: {
    {actionName}: boolean;   // ← one per disabled action flag
  };
};

export function {TaskGroupName}TaskGroup({
  financingCaseId,
  sections,
  flags,
}: {TaskGroupName}TaskGroupProps) {
  const t = useTranslations('{translationNamespace}');

  return (
    <TaskGroup label={t('label')}>
      <TasksAndActionsLayout>
        <Area gridArea="tasks">
          <VStack gap={4} alignItems="stretch">
            <{Product}{Role}{TaskPanelName}TaskPanel
              financingCaseId={financingCaseId}
              completed={sections.{taskPanelName}.completed}
            />
            {/* add remaining TaskPanels */}
          </VStack>
        </Area>
        <Area gridArea="actions">
          <{Product}{Role}{TaskGroupName}Action
            financingCaseId={financingCaseId}
            {actionName}Disabled={!flags.{actionName}}
          />
        </Area>
      </TasksAndActionsLayout>
    </TaskGroup>
  );
}
```

## Without Actions

If there is no `TaskAction`, omit the `actions` area entirely:

```tsx
return (
  <TaskGroup label={t('label')}>
    <TasksAndActionsLayout>
      <Area gridArea="tasks">
        <VStack gap={4} alignItems="stretch">
          <{TaskPanelName}TaskPanel
            financingCaseId={financingCaseId}
            completed={sections.{taskPanelName}.completed}
          />
        </VStack>
      </Area>
    </TasksAndActionsLayout>
  </TaskGroup>
);
```

## Full Example

```tsx
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from '@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout';
import { TaskGroup } from '@finstreet/ui/components/patterns/TaskGroup';
import { VStack } from '@styled-system/jsx';
import { useTranslations } from 'next-intl';
import { HoaLoanFspInquiryTaskPanel } from './taskPanels/HoaLoanFspInquiryTaskPanel';
import { HoaLoanFspApplicationInformationTaskPanel } from './taskPanels/HoaLoanFspApplicationInformationTaskPanel';
import { HoaLoanFspActions } from './HoaLoanFspActions';

type HoaLoanFspTaskGroupProps = {
  financingCaseId: string;
  sections: {
    hoaLoanInquiry: { completed: boolean };
    applicationDetails: {
      completed: boolean;
      propertyItemsConfirmed: boolean;
      financingDetailsConfirmed: boolean;
    };
  };
  flags: {
    mutable: boolean;
  };
};

export function HoaLoanFspTaskGroup({
  financingCaseId,
  sections,
  flags,
}: HoaLoanFspTaskGroupProps) {
  const t = useTranslations('hoaLoan.fsp');

  return (
    <TaskGroup label={t('taskGroup.label')}>
      <TasksAndActionsLayout>
        <Area gridArea="tasks">
          <VStack gap={4} alignItems="stretch">
            <HoaLoanFspInquiryTaskPanel
              financingCaseId={financingCaseId}
              completed={sections.hoaLoanInquiry.completed}
            />
            <HoaLoanFspApplicationInformationTaskPanel
              financingCaseId={financingCaseId}
              completed={sections.applicationDetails.completed}
              propertyItemsConfirmed={sections.applicationDetails.propertyItemsConfirmed}
              financingDetailsConfirmed={sections.applicationDetails.financingDetailsConfirmed}
            />
          </VStack>
        </Area>
        <Area gridArea="actions">
          <HoaLoanFspActions
            financingCaseId={financingCaseId}
            startValueIndicationDisabled={!flags.mutable}
            provideDocumentDisabled={!flags.mutable}
            placeOfferDisabled={!flags.mutable}
          />
        </Area>
      </TasksAndActionsLayout>
    </TaskGroup>
  );
}
```

## Rules

- Derive all props from the TaskPanel and TaskAction components — the TaskGroup only passes data down
- `sections` groups TaskPanel-related data; `flags` groups action enable/disable states
- Always wrap TaskPanels in `<VStack gap={4} alignItems="stretch">`
- `gridArea="tasks"` and `gridArea="actions"` are fixed string values
