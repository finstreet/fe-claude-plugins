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

export const BuildingLoanFspDocumentsActionPanel = ({
  financingCaseId,
  actionDisabled,
}: Props) => {
  const t = useTranslations(
    "financingCaseOverview.buildingLoan.fsp.taskGroups.customerDetails.taskPanels.documents.actionPanel",
  );

  // TODO: import and use the actual modal store hook
  // const { setData } = useRequestDocumentsModal();

  return (
    <ActionPanel variant="invisible">
      <ActionPanelContent>
        <ActionPanelAction
          disabled={actionDisabled}
          disabledHint={t("requestDocuments.disabledHint")}
          onClick={() => {
            // TODO: setData({ financingCaseId });
            console.log("requestDocuments clicked");
          }}
        >
          {t("requestDocuments.title")}
        </ActionPanelAction>
      </ActionPanelContent>
    </ActionPanel>
  );
};
