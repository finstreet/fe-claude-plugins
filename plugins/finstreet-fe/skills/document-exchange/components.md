# Document Exchange Components

Three `"use client"` components form the document exchange UI. They compose top-down: PageContent → RequestGroup → RequestDisplay.

## DocumentExchangePageContent

File: `src/features/documentExchange/{portal}/components/DocumentExchangePageContent.tsx`

The main content wrapper. Sorts requests into groups, handles anchor-based scroll highlighting, and renders each group.

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentRequestItemType } from "@/shared/backend/models/common/DocumentRequestItem";
import { useSortRequestsByRequestGroup } from "@/features/documentExchange/useSortRequestsByRequestGroup";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { useTranslations } from "next-intl";
import { DocumentExchangeRequestGroup } from "@/features/documentExchange/{portal}/components/DocumentExchangeRequestGroup";
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
```

### FSP variant

The FSP version adds a `DocumentRelatedMessageModal` at the bottom (after `</PageContent>`):

```tsx
import { DocumentRelatedMessageModal } from "@/features/documentExchange/fsp/modals/documentRelatedMessage/DocumentRelatedMessageModal";

// ... at the end of the return, after </PageContent>:
<DocumentRelatedMessageModal />
```

## DocumentExchangeRequestGroup

File: `src/features/documentExchange/{portal}/components/DocumentExchangeRequestGroup.tsx`

A collapsible section that displays a group of document requests with progress stats ("X of Y required").

```tsx
"use client";

import { Box, HStack, VStack } from "@styled-system/jsx";
import { FaAngleDown } from "react-icons/fa6";
import { DocumentExchangeRequestDisplay } from "@/features/documentExchange/{portal}/components/DocumentExchangeRequestDisplay";
import {
  CollapsibleContent,
  CollapsibleToggle,
  Collapsible,
} from "@finstreet/ui/components/patterns/Collapsible";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { useTranslations } from "next-intl";
import { documentExchangeDeleteDocumentAction } from "@/features/documentExchange/common/actions/documentExchangeDeleteDocumentAction";
import { DocumentRequestItemType } from "@/shared/backend/models/common/DocumentRequestItem";

type Props = {
  requestGroup: {
    title: string;
    documents: Array<DocumentRequestItemType>;
    uploadedRequiredAmount: number;
    totalRequiredAmount: number;
    totalRequestAmount: number;
  };
  financingCaseId: string;
  editable?: boolean;
  itemsDeletable?: boolean;
  highlightedDocumentId?: string | null;
};

export const DocumentExchangeRequestGroup = ({
  requestGroup,
  financingCaseId,
  editable = true,
  itemsDeletable = false,
  highlightedDocumentId,
}: Props) => {
  const t = useTranslations("documentExchange.requestGroups");

  if (requestGroup.totalRequestAmount === 0) {
    return null;
  }

  return (
    <Box>
      <Collapsible startOpen>
        <CollapsibleToggle>
          <HStack paddingBottom={4}>
            <Box color={"text.primary"}>
              <FaAngleDown />
            </Box>
            <Typography color={"text.primary"}>
              {requestGroup.title}
            </Typography>
            <Typography color={"text.dark"}>
              {t("tag", {
                uploadedRequiredAmount: requestGroup.uploadedRequiredAmount,
                totalRequiredAmount: requestGroup.totalRequiredAmount,
              })}
            </Typography>
          </HStack>
        </CollapsibleToggle>
        <CollapsibleContent>
          <VStack gap={4} alignItems={"stretch"} p={1}>
            {requestGroup.documents.map((request) => {
              return (
                <DocumentExchangeRequestDisplay
                  documentRequestItem={request}
                  financingCaseId={financingCaseId}
                  editable={editable}
                  deleteDocument={
                    itemsDeletable
                      ? documentExchangeDeleteDocumentAction
                      : undefined
                  }
                  highlightedDocumentId={highlightedDocumentId}
                  key={request.id}
                />
              );
            })}
          </VStack>
        </CollapsibleContent>
      </Collapsible>
    </Box>
  );
};
```

### PM variant

The PM version uses `color={"text.light"}` instead of `color={"text.dark"}` for the tag progress text.

## DocumentExchangeRequestDisplay

File: `src/features/documentExchange/{portal}/components/DocumentExchangeRequestDisplay.tsx`

Individual document request card. Wraps `@finstreet/ui`'s `DocumentRequest` component with download error handling, hide-completed logic, and action callbacks.

### PM variant (simpler — no message functionality)

```tsx
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

type Props = {
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
}: Props) {
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
        id={documentElementId}
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
```

### FSP variant additions

The FSP version adds two things on top of the PM pattern:

1. **DocumentTags** — maps `tags` to a `<DocumentTags>` component in the documents array:

```tsx
import { DocumentTags } from "@/shared/components/DocumentTags";

// In the documents.map():
return {
  label,
  tags: <DocumentTags tags={tags} />,
  ...rest,
};
```

2. **sendMessage callback** — opens a message modal for a specific document:

```tsx
import { useDocumentRelatedMessageModal } from "@/features/documentExchange/fsp/modals/documentRelatedMessage/store";

// In the component:
const { setData: openMessageModal } = useDocumentRelatedMessageModal();

const sendMessage = (financingCaseId: string, documentId: string) => {
  const document = documentRequestItem.documents.find(
    (doc) => doc.id === documentId,
  );
  if (!document) return;

  openMessageModal({
    financingCaseId,
    documentId,
    documentRequestItemId: documentRequestItem.id,
    filename: document.filename,
    createdAt: document.createdAt,
  });
};

// On DocumentRequest:
sendMessage={editable ? sendMessage : undefined}
```

## DocumentRequest Props (from @finstreet/ui)

The `DocumentRequest` component from `@finstreet/ui` is the core UI element. Here are the props passed to it:

```typescript
{
  css: SystemStyleObject;
  highlighted: boolean;                    // anchor scroll highlight
  financingCaseId: string;
  documentRequest: {
    id: string;
    description: string;
    title: string;
    documents: Array<{...}>;               // mapped documents with label
    required: boolean;
  };
  id: string;                              // DOM element id for anchor
  disabled: boolean;                       // from editable flag
  acceptedTypes: string[];                 // MIME types
  sendMessage?: (id: string, docId: string) => void;  // FSP only
  refetch: () => void;
  translations: {
    optional: string;
    error: string;
    dropzone: string;
    acceptedTypes: string;
    maxFileSize: string;
    processing: string;
    uploadedDocumentsTitle: string;
  };
  deleteDocument?: (input: {...}) => Promise<void>;
  uploadDocument: (files: File[], fcId: string, reqId?: string) => Promise<...>;
  downloadDocument: (input: {...}) => Promise<void>;
}
```
