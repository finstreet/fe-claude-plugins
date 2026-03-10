import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { BankDetailsPage } from "@/features/inquiryProcess/common/bankDetails/BankDetailsPage";

export const metadata: Metadata = {
  title: `Bankverbindung | ${Constants.companyName}`,
};

type FSPBankDetailsPageProps = {
  params: Promise<{ inquiryId: string }>;
};

export default async function FSPBankDetailsPage({
  params,
}: FSPBankDetailsPageProps) {
  const { inquiryId } = await params;

  return <BankDetailsPage inquiryId={inquiryId} />;
}
