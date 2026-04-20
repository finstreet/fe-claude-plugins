import { PersonalLoanFinancingCaseOverviewType } from "@/shared/backend/models/financingCaseOverview/personalLoan/fsp/schema";
import { TaskGroup } from "@finstreet/ui/components/patterns/TaskGroup";
import { VStack } from "@styled-system/jsx";
import { useTranslations } from "next-intl";
import { PersonalLoanFspInquiryTaskPanel } from "./taskPanels/PersonalLoanFspInquiryTaskPanel";
import { PersonalLoanFspRequiredDocumentsTaskPanel } from "./taskPanels/PersonalLoanFspRequiredDocumentsTaskPanel";

type Props = {
  financingCaseId: string;
  financingCaseOverviewResponse: PersonalLoanFinancingCaseOverviewType;
};

export const PersonalLoanFspVerifyInquiryTaskGroup = ({
  financingCaseId,
  financingCaseOverviewResponse,
}: Props) => {
  const t = useTranslations(
    "financingCaseOverview.personalLoan.fsp.taskGroups.verifyInquiry",
  );

  const { sections } = financingCaseOverviewResponse;

  return (
    <TaskGroup label={t("label")}>
      <VStack gap={4} alignItems="stretch">
        <PersonalLoanFspInquiryTaskPanel
          financingCaseId={financingCaseId}
          completed={sections.inquiry.completed}
        />

        <PersonalLoanFspRequiredDocumentsTaskPanel
          financingCaseId={financingCaseId}
          completed={sections.requiredDocuments.completed}
          completedCount={sections.requiredDocuments.completedCount}
          totalCount={sections.requiredDocuments.totalCount}
        />
      </VStack>
    </TaskGroup>
  );
};
