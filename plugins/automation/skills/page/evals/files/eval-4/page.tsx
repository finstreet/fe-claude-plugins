import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { Panel } from "@finstreet/ui/components/base/Panel";
import { VStack } from "@styled-system/jsx";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { getExtracted } from "next-intl/server";
import { Banner } from "@finstreet/ui/components/base/Banner";
import { ForgotPasswordForm } from "@/features/auth/forms/forgotPasswordForm";

export const metadata: Metadata = {
  title: `Passwort vergessen | ${Constants.companyName}`,
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    emailSent: string;
  }>;
};

export default async function ForgotPasswordPage(
  props: ForgotPasswordPageProps,
) {
  const searchParams = await props.searchParams;
  const t = await getExtracted();

  return (
    <Panel p={8}>
      <VStack gap={8} alignItems="stretch">
        <Headline as="h1">{t("Passwort vergessen")}</Headline>
        {searchParams.emailSent ? (
          <Banner type="success">
            {t("E-Mail wurde erfolgreich gesendet")}
          </Banner>
        ) : null}
        <ForgotPasswordForm />
      </VStack>
    </Panel>
  );
}
