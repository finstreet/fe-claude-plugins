import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { ResetScrollPosition } from "@finstreet/ui/components/base/ResetScrollPosition";
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
import { getHoaAccountFinancingCaseOverview } from "@/shared/backend/models/financingCaseOverview/hoaAccount/fsp/server";
import { HoaAccountOverviewPageHeader } from "@/features/financingCaseOverview/hoaAccount/fsp/HoaAccountOverviewPageHeader";
import { CustomerDetailsTaskGroup } from "@/features/financingCaseOverview/hoaAccount/fsp/taskGroups/CustomerDetailsTaskGroup";
import { InternalTaskGroup } from "@/features/financingCaseOverview/hoaAccount/fsp/taskGroups/InternalTaskGroup";
import { ArchiveFinancingCaseModal } from "@/features/financingCaseOverview/common/fsp/modals/archiveFinancingCaseModal";
import { AssignCaseManagerModal } from "@/features/caseManagers/modals";

export const metadata: Metadata = {
  title: `WEG-Konto Übersicht | ${Constants.companyName}`,
};

type HoaAccountOverviewPageProps = {
  params: Promise<{ financingCaseId: string }>;
};

export default async function HoaAccountOverviewPage({
  params,
}: HoaAccountOverviewPageProps) {
  const { financingCaseId } = await params;

  const overviewResponse = await fetchWithErrorHandling(() =>
    getHoaAccountFinancingCaseOverview({
      pathVariables: { financingCaseId },
    }),
  );

  return (
    <>
      <ResetScrollPosition />
      <HoaAccountOverviewPageHeader
        financingCaseId={financingCaseId}
        overviewResponse={overviewResponse}
      />
      <PageContent>
        <CustomerDetailsTaskGroup
          financingCaseId={financingCaseId}
          overviewResponse={overviewResponse}
        />
        <InternalTaskGroup
          financingCaseId={financingCaseId}
          overviewResponse={overviewResponse}
        />
      </PageContent>
      <ArchiveFinancingCaseModal />
      <AssignCaseManagerModal />
    </>
  );
}
