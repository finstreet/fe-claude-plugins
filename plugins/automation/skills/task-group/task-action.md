# Building a Task Action

File: `{featurePath}/taskGroups/{taskGroupName}/{Product}{Role}{TaskGroupName}Action.tsx`

An `ActionPanel` lists actions a user can take. Actions are either links or click handlers (e.g., opening a modal).

## Shell

```tsx
import {
  ActionPanel,
  ActionPanelContent,
  ActionPanelAction,
} from '@finstreet/ui/components/patterns/ActionPanel';
import { useExtracted } from 'next-intl';

type {TaskGroupName}ActionProps = {
  financingCaseId: string;
  {actionName}Disabled: boolean;     // ← one per action
};

export function {TaskGroupName}Action({
  financingCaseId,
  {actionName}Disabled,
}: {TaskGroupName}ActionProps) {
  const t = useExtracted();

  return (
    <ActionPanel>
      <ActionPanelContent>
        {/* actions go here */}
      </ActionPanelContent>
    </ActionPanel>
  );
}
```

## Click Action

Add a `handle{ActionName}` function with a TODO console.log:

```tsx
const handle{ActionName} = () => {
  // TODO: Implement {actionName} functionality
  console.log('{actionName} clicked');
};

<ActionPanelAction
  disabled={!{actionName}Enabled}
  disabledHint={t("{German disabled hint}")}
  onClick={handle{ActionName}}
>
  {t("{German action title}")}
</ActionPanelAction>
```

## Link Action

```tsx
<ActionPanelAction
  href={routes.{role}.{resource}.{action}(financingCaseId)}
  name={t("{German action title}")}
  prefetch={true}
  scroll={true}
  disabled={!{actionName}Enabled}
  disabledHint={t("{German disabled hint}")}
>
  {t("{German action title}")}
</ActionPanelAction>
```

## Full Example

```tsx
import {
  ActionPanel,
  ActionPanelContent,
  ActionPanelAction,
} from '@finstreet/ui/components/patterns/ActionPanel';
import { useExtracted } from 'next-intl';

type HoaLoanFspActionsProps = {
  financingCaseId: string;
  startValueIndicationDisabled: boolean;
  provideDocumentDisabled: boolean;
  placeOfferDisabled: boolean;
};

export function HoaLoanFspActions({
  financingCaseId,
  startValueIndicationDisabled,
  provideDocumentDisabled,
  placeOfferDisabled,
}: HoaLoanFspActionsProps) {
  const t = useExtracted();

  const handleStartValueIndication = () => {
    // TODO: Implement start value indication functionality
    console.log('startValueIndication clicked');
  };

  const handleProvideDocument = () => {
    // TODO: Implement provide document functionality
    console.log('provideDocument clicked');
  };

  return (
    <ActionPanel>
      <ActionPanelContent>
        <ActionPanelAction
          disabled={startValueIndicationDisabled}
          disabledHint={t("Wertermittlung kann erst gestartet werden, wenn alle Aufgaben erledigt sind")}
          onClick={handleStartValueIndication}
        >
          {t("Wertermittlung starten")}
        </ActionPanelAction>
        <ActionPanelAction
          disabled={provideDocumentDisabled}
          disabledHint={t("Dokument kann erst bereitgestellt werden, wenn alle Aufgaben erledigt sind")}
          onClick={handleProvideDocument}
        >
          {t("Dokument bereitstellen")}
        </ActionPanelAction>
        <ActionPanelAction
          href={routes.fsp.hoaLoan.placeOffer(financingCaseId)}
          name={t("Angebot erstellen")}
          disabled={placeOfferDisabled}
          disabledHint={t("Angebot kann erst erstellt werden, wenn alle Aufgaben erledigt sind")}
        >
          {t("Angebot erstellen")}
        </ActionPanelAction>
      </ActionPanelContent>
    </ActionPanel>
  );
}
```

## ActionPanelAction Props

```typescript
type ActionPanelActionProps =
  | {
      href: string;                  // ← link action
      name: string;
      onClick?: never;
      disabled?: boolean;
      disabledHint?: string;
      children: React.ReactNode;
    }
  | {
      onClick: () => void;           // ← click action
      href?: never;
      name?: never;
      disabled?: boolean;
      disabledHint?: string;
      children: React.ReactNode;
    };
```

## Component Props Pattern

- `{actionName}Disabled: boolean` — one prop per action (derive from flags/data in the parent)
- Route params needed for link actions (e.g. `financingCaseId: string`)
