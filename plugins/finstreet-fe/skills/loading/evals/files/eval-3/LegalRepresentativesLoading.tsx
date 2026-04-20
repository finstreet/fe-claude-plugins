"use client";

import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import { BoxSkeleton } from "@finstreet/ui/components/base/Skeletons/BoxSkeleton";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { CardsGridLayout } from "@finstreet/ui/components/pageLayout/Layout/CardsGridLayout";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { useTranslations } from "next-intl";

export function LegalRepresentativesLoading() {
  const t = useTranslations("legalRepresentatives");

  return (
    <>
      <SubPageHeaderSkeleton title={t("title")} />
      <PageContent>
        <Typography as={"p"}>{t("description")}</Typography>
        <CardsGridLayout columns={2}>
          <BoxSkeleton width={"100%"} height={"200"} />
          <BoxSkeleton width={"100%"} height={"200"} />
        </CardsGridLayout>
      </PageContent>
    </>
  );
}
