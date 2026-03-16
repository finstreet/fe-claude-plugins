# Building an Action Panel

File: `{featurePath}/taskGroups/{taskGroupName}/taskPanels/{Product}{Role}{PanelName}TaskPanel/{Product}{Role}{PanelName}ActionPanel.tsx`

An ActionPanel is co-located with its TaskPanel and rendered in the `actions` area of the `TasksAndActionsLayout`. ActionPanels are always `"use client"` components because they use hooks (modal stores, transitions, translations).

## Click Action (modal trigger)

The most common pattern — opening a modal via a zustand store hook.

```tsx
"use client";

import {
  ActionPanel,
  ActionPanelContent,
  ActionPanelAction,
} from "@finstreet/ui/components/patterns/ActionPanel";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  actionDisabled: boolean;
};

export const {Product}{Role}{PanelName}ActionPanel = ({
  financingCaseId,
  actionDisabled,
}: Props) => {
  const t = useTranslations(
    "{translationNamespace}.taskGroups.{taskGroupName}.taskPanels.{panelName}.actionPanel",
  );

  // TODO: import and use the actual modal store hook
  // const { setData } = useMyModal();

  return (
    <ActionPanel variant="invisible">
      <ActionPanelContent>
        <ActionPanelAction
          disabled={actionDisabled}
          disabledHint={t("{actionName}.disabledHint")}
          onClick={() => {
            // TODO: setData({ financingCaseId });
            console.log("{actionName} clicked");
          }}
        >
          {t("{actionName}.title")}
        </ActionPanelAction>
      </ActionPanelContent>
    </ActionPanel>
  );
};
```

## Link Action

When the action navigates to a page instead of opening a modal.

```tsx
"use client";

import { routes } from "@/routes";
import {
  ActionPanel,
  ActionPanelContent,
  ActionPanelAction,
} from "@finstreet/ui/components/patterns/ActionPanel";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  actionDisabled: boolean;
};

export const {Product}{Role}{PanelName}ActionPanel = ({
  financingCaseId,
  actionDisabled,
}: Props) => {
  const t = useTranslations(
    "{translationNamespace}.taskGroups.{taskGroupName}.taskPanels.{panelName}.actionPanel",
  );

  return (
    <ActionPanel variant="invisible">
      <ActionPanelContent>
        <ActionPanelAction
          disabled={actionDisabled}
          disabledHint={t("{actionName}.disabledHint")}
          href={routes.{role}.{resource}.{action}(financingCaseId)}
          name={t("{actionName}.title")}
          prefetch={true}
          scroll={true}
        >
          {t("{actionName}.title")}
        </ActionPanelAction>
      </ActionPanelContent>
    </ActionPanel>
  );
};
```

## Multiple Actions

An ActionPanel can contain several actions. Mix click and link actions as needed.

```tsx
"use client";

import {
  ActionPanel,
  ActionPanelContent,
  ActionPanelAction,
} from "@finstreet/ui/components/patterns/ActionPanel";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  flags: FlagsType;
};

export const {Product}{Role}{PanelName}ActionPanel = ({
  financingCaseId,
  flags,
}: Props) => {
  const t = useTranslations(
    "{translationNamespace}.taskGroups.{taskGroupName}.taskPanels.{panelName}.actionPanel",
  );

  // TODO: import and use the actual modal store hooks
  // const { setData: setFirstModalData } = useFirstModal();
  // const { setData: setSecondModalData } = useSecondModal();

  return (
    <ActionPanel variant="invisible">
      <ActionPanelContent>
        <ActionPanelAction
          disabledHint={t("firstAction.disabledHint")}
          disabled={!flags.firstActionEnabled}
          onClick={() => {
            // TODO: setFirstModalData({ financingCaseId });
            console.log("firstAction clicked");
          }}
        >
          {t("firstAction.title")}
        </ActionPanelAction>
        <ActionPanelAction
          disabledHint={t("secondAction.disabledHint")}
          disabled={!flags.secondActionEnabled}
          onClick={() => {
            // TODO: setSecondModalData({ financingCaseId });
            console.log("secondAction clicked");
          }}
        >
          {t("secondAction.title")}
        </ActionPanelAction>
      </ActionPanelContent>
    </ActionPanel>
  );
};
```

## ActionPanelAction Props Reference

```typescript
type ActionPanelActionProps =
  | {
      href: string;           // link action
      name: string;
      onClick?: never;
      disabled?: boolean;
      disabledHint?: string;
      children: React.ReactNode;
      "data-testid"?: string;
    } & Pick<LinkProps, "scroll" | "replace" | "prefetch">
  | {
      onClick: () => void;    // click action
      href?: never;
      name?: never;
      disabled?: boolean;
      disabledHint?: string;
      children: React.ReactNode;
      "data-testid"?: string;
    };
```

## Rules

1. Always `"use client"` at the top of the file
2. Always `variant="invisible"` on `ActionPanel`
3. Click actions that open modals use a zustand store hook pattern: `const { setData } = useMyModal()`
4. `disabled` and `disabledHint` go together — when disabled, the hint explains why
5. Link actions include `prefetch={true}` and `scroll={true}`
