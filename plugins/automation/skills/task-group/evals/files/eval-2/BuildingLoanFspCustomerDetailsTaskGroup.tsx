import { BuildingLoanFinancingCaseOverviewType } from "@/shared/backend/models/financingCaseOverview/buildingLoan/fsp/schema";
import { TaskGroup } from "@finstreet/ui/components/patterns/TaskGroup";
import { VStack } from "@styled-system/jsx";
import { useTranslations } from "next-intl";
import { BuildingLoanFspApplicationTaskPanel } from "./taskPanels/BuildingLoanFspApplicationTaskPanel";
import { BuildingLoanFspDocumentsTaskPanel } from "./taskPanels/BuildingLoanFspDocumentsTaskPanel";
import { BuildingLoanFspContractTaskPanel } from "./taskPanels/BuildingLoanFspContractTaskPanel";

type Props = {
  financingCaseId: string;
  financingCaseOverviewResponse: BuildingLoanFinancingCaseOverviewType;
};

export const BuildingLoanFspCustomerDetailsTaskGroup = ({
  financingCaseId,
  financingCaseOverviewResponse,
}: Props) => {
  const t = useTranslations(
    "financingCaseOverview.buildingLoan.fsp.taskGroups.customerDetails",
  );

  const { sections, flags } = financingCaseOverviewResponse;

  return (
    <TaskGroup label={t("label")}>
      <VStack gap={4} alignItems="stretch">
        <BuildingLoanFspApplicationTaskPanel
          financingCaseId={financingCaseId}
          completed={sections.application.completed}
        />

        <BuildingLoanFspDocumentsTaskPanel
          financingCaseId={financingCaseId}
          completed={sections.documents.completed}
          flags={flags}
        />

        <BuildingLoanFspContractTaskPanel
          financingCaseId={financingCaseId}
          contract={sections.contract}
        />
      </VStack>
    </TaskGroup>
  );
};
