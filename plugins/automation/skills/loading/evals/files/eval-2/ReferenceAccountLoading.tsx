import { FormSkeleton } from "@/shared/components/FormSkeleton";
import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import {
  FormLayout,
  FormLayoutArea,
} from "@finstreet/ui/components/pageLayout/Layout/FormLayout";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { getTranslations } from "next-intl/server";

export async function ReferenceAccountLoading() {
  const t = await getTranslations("referenceAccount");

  return (
    <>
      <SubPageHeaderSkeleton title={t("updateReferenceAccountForm.title")} />
      <PageContent>
        <FormLayout>
          <FormLayoutArea gridArea={"form"}>
            <FormSkeleton />
          </FormLayoutArea>
        </FormLayout>
      </PageContent>
    </>
  );
}
