import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { FspFinancingCaseOverviewSubPageHeader } from "@/layouts/fsp/FspFinancingCaseOverviewSubPageHeader";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
import { getAccountDetails } from "@/shared/backend/models/accountDetails/server";
import { getExtracted } from "next-intl/server";
import { AccountDetailsForm } from "@/features/accountDetails/forms/AccountDetailsForm";

export const metadata: Metadata = {
  title: `Kontodetails | ${Constants.companyName}`,
};

type AccountDetailsPageProps = {
  params: Promise<{ financingCaseId: string }>;
};

export default async function AccountDetailsPage({
  params,
}: AccountDetailsPageProps) {
  const { financingCaseId } = await params;
  const t = await getExtracted();

  const accountDetailsResponse = await fetchWithErrorHandling(() =>
    getAccountDetails({
      pathVariables: { financingCaseId },
    }),
  );

  return (
    <>
      <FspFinancingCaseOverviewSubPageHeader
        title={t("Kontodetails")}
        financingCaseId={financingCaseId}
        header={accountDetailsResponse.header}
      />
      <PageContent>
        <AccountDetailsForm defaultValues={accountDetailsResponse} />
      </PageContent>
    </>
  );
}
