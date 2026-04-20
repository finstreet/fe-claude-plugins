"use client";

import { useState } from "react";
import { DocumentRequest } from "@finstreet/ui/components/patterns/DocumentRequest";
import { Banner } from "@finstreet/ui/components/base/Banner";
import { DocumentRequestItemType } from "@/shared/backend/models/common/DocumentRequestItem";
import { useDocumentExchangeSwitch } from "@/features/documentExchange/store";
import documentExchangeRefetchAction from "@/features/documentExchange/common/actions/documentExchangeRefetchAction";
import { documentExchangeUploadAction } from "@/features/documentExchange/common/actions/documentExchangeUploadAction";
import { documentExchangeDownloadDocumentAction } from "@/features/documentExchange/common/actions/documentExchangeDownloadDocumentAction";
import { useTranslations } from "next-intl";
import { VStack } from "@styled-system/jsx";

type HoaLoanCommercialRegisterExtractDisplayProps = {
  financingCaseId: string;
  documentRequestItem: DocumentRequestItemType;
  editable?: boolean;
  deleteDocument?: ({}: {
    financingCaseId: string;
    documentId: string;
    filename: string;
  }) => Promise<void>;
  highlightedDocumentId?: string | null;
};

export function DocumentExchangeRequestDisplay({
  financingCaseId,
  documentRequestItem,
  editable = true,
  deleteDocument,
  highlightedDocumentId,
}: HoaLoanCommercialRegisterExtractDisplayProps) {
  const [downloadError, setDownloadError] = useState(false);
  const { isChecked } = useDocumentExchangeSwitch();
  const t = useTranslations("documentExchange.documentRequestCard");

  const handleDownloadDocument = async (input: {
    financingCaseId: string;
    documentId: string;
  }) => {
    setDownloadError(false);
    const result = await documentExchangeDownloadDocumentAction(input);
    if (!result.success) {
      setDownloadError(true);
    }
  };

  if (isChecked && documentRequestItem.documents.length > 0) {
    return;
  }

  const documents = documentRequestItem.documents.map((doc) => {
    const { tags, ...rest } = doc;

    const label = tags.find((tag) => tag.value === "new")?.human;

    return {
      label,
      ...rest,
    };
  });

  const documentElementId = `document-${documentRequestItem.id}`;

  return (
    <VStack alignItems="stretch" gap={2} height="100%">
      {downloadError ? (
        <Banner type="error">{t("downloadError")}</Banner>
      ) : null}
      <DocumentRequest
        css={{ height: "100%" }}
        highlighted={highlightedDocumentId === documentElementId}
        financingCaseId={financingCaseId}
        documentRequest={{
          id: documentRequestItem.id,
          description: documentRequestItem.description,
          title: documentRequestItem.title,
          documents,
          required: documentRequestItem.required,
        }}
        id={`document-${documentRequestItem.id}`}
        disabled={!editable}
        acceptedTypes={documentRequestItem.contentTypes}
        refetch={() => documentExchangeRefetchAction(financingCaseId)}
        translations={{
          optional: t("optional"),
          error: t("error"),
          dropzone: t("dropzone"),
          acceptedTypes: t("acceptedTypes"),
          maxFileSize: t("maxFileSize"),
          processing: t("processing"),
          uploadedDocumentsTitle: t("uploadedDocumentsTitle"),
        }}
        deleteDocument={deleteDocument}
        uploadDocument={documentExchangeUploadAction}
        downloadDocument={handleDownloadDocument}
      />
    </VStack>
  );
}
