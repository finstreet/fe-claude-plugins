# Document Exchange Shared Utilities

These files are shared across all portals and products. They live at the feature root or in `common/`.

## Store (Zustand)

File: `src/features/documentExchange/store.ts`

Simple toggle for "hide completed requests" — used by the header switch and by `DocumentExchangeRequestDisplay` to conditionally hide cards.

```ts
import { create } from "zustand";

interface DocumentExchangeSwitchStore {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
}

export const useDocumentExchangeSwitch = create<DocumentExchangeSwitchStore>(
  (set) => ({
    isChecked: false,
    setIsChecked: (isChecked) => set({ isChecked }),
  }),
);
```

## Sorting Hook

File: `src/features/documentExchange/useSortRequestsByRequestGroup.ts`

Groups document requests into 4 categories based on the `requestGroup` field from the backend. Each category includes progress metrics.

```ts
import { DocumentRequestItemType } from "@/shared/backend/models/common/DocumentRequestItem";
import { useTranslations } from "next-intl";

enum requestGroup {
  WEG = "Dokumente zur WEG",
  PROPERTY_MANAGER = "Dokumente zur Hausverwaltung",
  RESOLUTION = "Dokumente zum geplanten Vorhaben",
}

export function useSortRequestsByRequestGroup({
  requests,
}: {
  requests: Array<DocumentRequestItemType>;
}) {
  const t = useTranslations("documentExchange.requestGroups");
  const documentsResolution: Array<DocumentRequestItemType> = [];
  const documentsWEG: Array<DocumentRequestItemType> = [];
  const documentsPropertyManager: Array<DocumentRequestItemType> = [];
  const documentsOther: Array<DocumentRequestItemType> = [];

  requests.forEach((request) => {
    switch (request.requestGroup) {
      case requestGroup.WEG:
        documentsWEG.push(request);
        break;
      case requestGroup.PROPERTY_MANAGER:
        documentsPropertyManager.push(request);
        break;
      case requestGroup.RESOLUTION:
        documentsResolution.push(request);
        break;
      default:
        documentsOther.push(request);
    }
  });

  return {
    resolution: {
      title: t("documentsForResolution.title"),
      documents: documentsResolution,
      totalRequestAmount: documentsResolution.length,
      uploadedRequiredAmount: documentsResolution.filter(
        (item) => item.required && item.documents.length > 0,
      ).length,
      totalRequiredAmount: documentsResolution.filter((item) => item.required)
        .length,
    },
    propertyManager: {
      title: t("documentsForPropertyManagement.title"),
      documents: documentsPropertyManager,
      totalRequestAmount: documentsPropertyManager.length,
      uploadedRequiredAmount: documentsPropertyManager.filter(
        (item) => item.required && item.documents.length > 0,
      ).length,
      totalRequiredAmount: documentsPropertyManager.filter(
        (item) => item.required,
      ).length,
    },
    weg: {
      title: t("documentsForWEG.title"),
      documents: documentsWEG,
      totalRequestAmount: documentsWEG.length,
      uploadedRequiredAmount: documentsWEG.filter(
        (item) => item.required && item.documents.length > 0,
      ).length,
      totalRequiredAmount: documentsWEG.filter((item) => item.required).length,
    },
    others: {
      title: t("documentsForOthers.title"),
      documents: documentsOther,
      totalRequestAmount: documentsOther.length,
      uploadedRequiredAmount: documentsOther.filter(
        (item) => item.required && item.documents.length > 0,
      ).length,
      totalRequiredAmount: documentsOther.filter((item) => item.required)
        .length,
    },
  };
}
```

## Loading Component

File: `src/features/documentExchange/common/components/DocumentExchangeLoading.tsx`

Skeleton placeholder shown while the page data loads. Used as `loading.tsx` in the route directory.

```tsx
import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { useTranslations } from "next-intl";
import { TextSkeleton } from "@finstreet/ui/components/base/Skeletons/TextSkeleton";
import { BoxSkeleton } from "@finstreet/ui/components/base/Skeletons/BoxSkeleton";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { VStack } from "@styled-system/jsx";

export default function DocumentExchangeLoading() {
  const t = useTranslations("documentExchange");

  return (
    <>
      <SubPageHeaderSkeleton title={t("title")} />
      <PageContent>
        <Typography>{t("description")}</Typography>
        <TextSkeleton lines={1} />
        <VStack gap={16} alignItems={"stretch"}>
          <BoxSkeleton width={"100%"} height={"250"} />
          <BoxSkeleton width={"100%"} height={"250"} />
          <BoxSkeleton width={"100%"} height={"250"} />
          <BoxSkeleton width={"100%"} height={"250"} />
          <BoxSkeleton width={"100%"} height={"250"} />
        </VStack>
      </PageContent>
    </>
  );
}
```

The route's `loading.tsx` re-exports this:
```tsx
export { default } from "@/features/documentExchange/common/components/DocumentExchangeLoading";
```

## Backend Schema

File: `src/shared/backend/models/documentExchange/schema.ts`

```ts
import * as z from "@/lib/zod";
import { DocumentRequestItemSchema } from "@/shared/backend/models/common/DocumentRequestItem";
import { DocumentRequestFlagsSchema } from "@/shared/backend/models/common/DocumentRequestFlagsSchema";
import { PropertyManagerSubPageHeaderSchema } from "@/shared/backend/models/common/PropertyManagerSubPageHeaderSchema";

export const RequestsWithDocumentsPathVariablesSchema = z.object({
  financingCaseId: z.string(),
});

export const GetRequestsWithDocumentsResponseSchema = z.object({
  header: PropertyManagerSubPageHeaderSchema,
  flags: DocumentRequestFlagsSchema,
  documentRequests: z.array(DocumentRequestItemSchema),
});
```

## Backend Server

File: `src/shared/backend/models/documentExchange/server.ts`

```ts
import {
  GetRequestsWithDocumentsResponseSchema,
  RequestsWithDocumentsPathVariablesSchema,
} from "@/shared/backend/models/documentExchange/schema";
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createServerFetchFunction } from "@/shared/backend/createServerFetchFunction";

const getRequestsWithDocumentsConfig = {
  protected: true,
  method: "GET",
  path: "/financing_cases/{financingCaseId}/document_exchange/requests_with_documents",
  pathVariablesSchema: RequestsWithDocumentsPathVariablesSchema,
  resultSchema: GetRequestsWithDocumentsResponseSchema,
} satisfies EndpointConfig;

export const getRequestsWithDocuments = createServerFetchFunction(
  getRequestsWithDocumentsConfig,
);
```

## Page Header Pattern

Each portal has its own header that wraps a base header with a "hide completed requests" switch.

### FSP Header

File: `src/layouts/fsp/FspFinancingCaseOverviewDocumentExchangePageHeader.tsx`

```tsx
"use client";

import { Switch } from "@finstreet/ui/components/base/Form/Switch";
import { PageHeaderActions } from "@finstreet/ui/components/pageLayout/PageHeader";
import { PropertyManagerSubPageHeaderType } from "@/shared/backend/models/common/PropertyManagerSubPageHeaderSchema";
import { useTranslations } from "next-intl";
import { useDocumentExchangeSwitch } from "@/features/documentExchange/store";
import { FspFinancingCaseOverviewSubPageHeader } from "@/layouts/fsp/FspFinancingCaseOverviewSubPageHeader";

type Props = {
  title: string;
  financingCaseId: string;
  header: PropertyManagerSubPageHeaderType;
};

export const FspFinancingCaseOverviewDocumentExchangePageHeader = ({
  title,
  financingCaseId,
  header,
}: Props) => {
  const t = useTranslations("documentExchange.subHeader.actions");
  const { isChecked, setIsChecked } = useDocumentExchangeSwitch();

  const actionComponent = (
    <PageHeaderActions>
      <Switch
        onClick={() => setIsChecked(!isChecked)}
        checked={isChecked}
        label={t("hideCompletedRequests")}
      />
    </PageHeaderActions>
  );

  return (
    <FspFinancingCaseOverviewSubPageHeader
      title={title}
      financingCaseId={financingCaseId}
      header={header}
      actionComponent={actionComponent}
    />
  );
};
```

### PM Header

Same pattern, but wraps `PropertyManagementCaseDetailsPageSubHeader` instead.

## Page Pattern

The route page is a server component that fetches data and renders the header + content.

```tsx
import { Metadata } from "next";
import { Constants } from "@/shared/utils/constants";
import { getTranslations } from "next-intl/server";
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
import { getRequestsWithDocuments } from "@/shared/backend/models/documentExchange/server";
import { DocumentExchangePageContent } from "@/features/documentExchange/{portal}/components/DocumentExchangePageContent";
import { {PortalHeader} } from "@/layouts/{portal}/{PortalHeader}";

export const metadata: Metadata = {
  title: `Dokumente | ${Constants.companyName}`,
};

type Props = {
  params: Promise<{ financingCaseId: string }>;
};

export default async function {Product}{Portal}DocumentsPage({
  params,
}: Props) {
  const { financingCaseId } = await params;
  const t = await getTranslations("documentExchange");
  const requestsWithDocumentsResponse = await fetchWithErrorHandling(() =>
    getRequestsWithDocuments({ pathVariables: { financingCaseId } }),
  );

  return (
    <>
      <{PortalHeader}
        title={t("title")}
        financingCaseId={financingCaseId}
        header={requestsWithDocumentsResponse.header}
      />
      <DocumentExchangePageContent
        financingCaseId={financingCaseId}
        documentRequests={requestsWithDocumentsResponse.documentRequests}
        itemsDeletable={requestsWithDocumentsResponse.flags.editable}
        editable={requestsWithDocumentsResponse.flags.editable}
      />
    </>
  );
}
```
