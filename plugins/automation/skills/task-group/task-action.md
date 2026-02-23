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
import { useTranslations } from 'next-intl';

type {TaskGroupName}ActionProps = {
  financingCaseId: string;
  {actionName}Disabled: boolean;     // ← one per action
};

export function {TaskGroupName}Action({
  financingCaseId,
  {actionName}Disabled,
}: {TaskGroupName}ActionProps) {
  const t = useTranslations('{translationNamespace}');

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
  disabledHint={t('{action}.disabledHint')}
  onClick={handle{ActionName}}
>
  {t('{action}.title')}
</ActionPanelAction>
```

## Link Action

```tsx
<ActionPanelAction
  href={routes.{role}.{resource}.{action}(financingCaseId)}
  name={t('{action}.title')}
  prefetch={true}
  scroll={true}
  disabled={!{actionName}Enabled}
  disabledHint={t('{action}.disabledHint')}
>
  {t('{action}.title')}
</ActionPanelAction>
```

## Full Example

```tsx
import {
  ActionPanel,
  ActionPanelContent,
  ActionPanelAction,
} from '@finstreet/ui/components/patterns/ActionPanel';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('hoaLoan.fsp.actions');

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
          disabledHint={t('startValueIndication.disabledHint')}
          onClick={handleStartValueIndication}
        >
          {t('startValueIndication.title')}
        </ActionPanelAction>
        <ActionPanelAction
          disabled={provideDocumentDisabled}
          disabledHint={t('provideDocument.disabledHint')}
          onClick={handleProvideDocument}
        >
          {t('provideDocument.title')}
        </ActionPanelAction>
        <ActionPanelAction
          href={routes.fsp.hoaLoan.placeOffer(financingCaseId)}
          name={t('placeOffer.title')}
          disabled={placeOfferDisabled}
          disabledHint={t('placeOffer.disabledHint')}
        >
          {t('placeOffer.title')}
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
