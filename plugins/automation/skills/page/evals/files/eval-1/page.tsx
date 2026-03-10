import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderTitle,
} from "@finstreet/ui/components/pageLayout/PageHeader";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { Suspense } from "react";
import { ListSkeleton } from "@finstreet/ui/components/base/Skeletons/ListSkeleton";
import { SearchParams } from "nuqs/server";
import { getExtracted } from "next-intl/server";
import { DocumentsList } from "@/features/documents/lists/DocumentsList";
import { documentsSearchParamsCache } from "@/features/documents/lists/DocumentsList/documentsSearchParams";
import { CreateDocumentModal } from "@/features/documents/modals/CreateDocumentModal";
import { OpenCreateDocumentModalButton } from "@/features/documents/modals/CreateDocumentModal/OpenCreateDocumentModalButton";

export const metadata: Metadata = {
  title: `Dokumente | ${Constants.companyName}`,
};

export const dynamic = "force-dynamic";

type DocumentsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const t = await getExtracted();
  const resolvedSearchParams = await searchParams;
  const { search, pagination } =
    documentsSearchParamsCache.parse(resolvedSearchParams);

  return (
    <>
      <PageHeader>
        <PageHeaderTitle>
          <Headline as="h1">{t("Dokumente")}</Headline>
        </PageHeaderTitle>
        <PageHeaderActions>
          <OpenCreateDocumentModalButton />
        </PageHeaderActions>
      </PageHeader>
      <PageContent>
        <Suspense fallback={<ListSkeleton />}>
          <DocumentsList
            searchParams={{
              search,
              pagination,
            }}
          />
        </Suspense>
      </PageContent>
      <CreateDocumentModal />
    </>
  );
}
