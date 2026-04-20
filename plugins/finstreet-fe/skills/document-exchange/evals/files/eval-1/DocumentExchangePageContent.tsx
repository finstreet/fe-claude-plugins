"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentRequestItemType } from "@/shared/backend/models/common/DocumentRequestItem";
import { useSortRequestsByRequestGroup } from "@/features/documentExchange/useSortRequestsByRequestGroup";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { useTranslations } from "next-intl";
import { DocumentExchangeRequestGroup } from "@/features/documentExchange/pm/components/DocumentExchangeRequestGroup";
import { VStack } from "@styled-system/jsx";

type DocumentExchangePageContentProps = {
  documentRequests: Array<DocumentRequestItemType>;
  financingCaseId: string;
  itemsDeletable?: boolean;
  editable?: boolean;
};

export const DocumentExchangePageContent = ({
  documentRequests,
  financingCaseId,
  itemsDeletable = false,
  editable = true,
}: DocumentExchangePageContentProps) => {
  const [highlightedDocumentId, setHighlightedDocumentId] = useState<
    string | null
  >(null);
  const searchParams = useSearchParams();
  const sortedRequest = useSortRequestsByRequestGroup({
    requests: documentRequests,
  });
  const t = useTranslations("documentExchange");

  useEffect(() => {
    const anchorParam = searchParams.get("anchor");

    if (anchorParam) {
      setHighlightedDocumentId(anchorParam);

      const element = document.getElementById(anchorParam);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - 100;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  }, [searchParams]);

  return (
    <>
      <PageContent>
        <Typography>{t("description")}</Typography>
        <VStack gap={16} alignItems={"stretch"}>
          {Object.values(sortedRequest).map((requestGroup) => (
            <DocumentExchangeRequestGroup
              key={requestGroup.title}
              requestGroup={requestGroup}
              financingCaseId={financingCaseId}
              editable={editable}
              itemsDeletable={itemsDeletable}
              highlightedDocumentId={highlightedDocumentId}
            />
          ))}
        </VStack>
      </PageContent>
    </>
  );
};
