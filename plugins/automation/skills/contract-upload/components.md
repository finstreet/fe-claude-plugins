# Contract Upload Components

Three components form the contract upload UI. They compose top-down: ContractsPageContent → ContractFileUpload + ContractActionButtons.

## ContractsPageContent

File: `src/features/contracts/components/ContractsPageContent.tsx`

The main content wrapper. Fetches live contract data via polling, maps contract groups to document cards with upload areas, and renders action buttons at the bottom.

### How It Works

1. **Receives server-fetched data** as `initialData` for both contracts and editor status
2. **Polls for updates** via `useContracts` hook — documents may be scanned asynchronously after upload
3. **Maps each contract group** to a section with title, description, document cards, and file upload
4. **Maps document status** to UI status via `mapDocumentStatus` helper
5. **Handles document deletion** inline — calls `deleteContractAction`, then invalidates queries and refetches document exchange
6. **Handles document editing** — navigates to the contract editor route

### Document Status Mapping

The `mapDocumentStatus` function converts backend scan status + signature field state into UI status:

| Backend `scanStatus` | `signatureFieldsAssigned` | UI Status | Translation Key |
|----------------------|--------------------------|-----------|----------------|
| `"clean"` | `true` | `"done"` | `scannedAndPrepared` |
| `"clean"` | `false` | `"partiallyDone"` | `scanned` |
| `"error"` | any | `"warning"` | `erroneousFile` |
| anything else | any | `"active"` | `scanning` |

### Template

```tsx
"use client";

import { ContractFileUpload } from "@/features/contracts/components/ContractFileUpload";
import documentExchangeRefetchAction from "@/features/documentExchange/common/actions/documentExchangeRefetchAction";
import { useContracts } from "@/shared/backend/models/contracts/hooks/useContracts";
import { GetContractsResponseType } from "@/shared/backend/models/contracts/schema";
import { useProduct } from "@/shared/context/product/productContext";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { Status } from "@finstreet/ui/components/base/TaskStatus";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { ContractDocument } from "@finstreet/ui/components/patterns/ContractDocument";
import { deleteContractAction } from "@/shared/backend/models/contracts/deleteContractAction";
import { VStack } from "@styled-system/jsx";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { EditorStatusResponseType } from "@/shared/backend/models/signature/schema";
import { ContractActionButtons } from "./ContractActionButtons";
import { useRouter } from "next/navigation";
import { routes } from "@/routes";

const mapDocumentStatus = (
  status: string,
  signatureFieldsAssigned: boolean,
): {
  status: Status;
  statusDescription:
    | "contractFileUpload.documentStatus.scannedAndPrepared"
    | "contractFileUpload.documentStatus.scanned"
    | "contractFileUpload.documentStatus.erroneousFile"
    | "contractFileUpload.documentStatus.scanning";
} => {
  switch (status) {
    case "clean":
      return signatureFieldsAssigned
        ? {
            status: "done",
            statusDescription:
              "contractFileUpload.documentStatus.scannedAndPrepared",
          }
        : {
            status: "partiallyDone",
            statusDescription: "contractFileUpload.documentStatus.scanned",
          };
    case "error":
      return {
        status: "warning",
        statusDescription: "contractFileUpload.documentStatus.erroneousFile",
      };
    default:
      return {
        status: "active",
        statusDescription: "contractFileUpload.documentStatus.scanning",
      };
  }
};

type ContractsPageContentProps = {
  contractsResponse: GetContractsResponseType;
  editorStatusResponse: EditorStatusResponseType;
  financingCaseId: string;
};

export const ContractsPageContent = ({
  contractsResponse,
  editorStatusResponse,
  financingCaseId,
}: ContractsPageContentProps) => {
  const t = useTranslations("signatureProcess.startSignatureProcess");
  const router = useRouter();
  const { product } = useProduct();
  const queryClient = useQueryClient();
  const { contracts } = useContracts({
    financingCaseId,
    initialData: contractsResponse,
    product,
  });

  return (
    <VStack alignItems="flex-start" gap={16} width={"100%"}>
      <Typography>{t("description")}</Typography>
      {contracts.map((contractGroup) => {
        return (
          <VStack
            alignItems="stretch"
            gap={4}
            width={"100%"}
            key={contractGroup.id}
          >
            <Headline as={"h2"}>
              <Typography color={"text.primary"}>
                {contractGroup.title}
              </Typography>
            </Headline>
            <Typography>{contractGroup.description}</Typography>

            {contractGroup.documents.map((document) => {
              const documentStatus = mapDocumentStatus(
                document.scanStatus,
                !!document.flags?.signatureFieldsAssigned,
              );

              return (
                <ContractDocument
                  key={document.id}
                  status={documentStatus.status}
                  statusDescription={t(documentStatus.statusDescription)}
                  editable={!!document.flags?.signatureFieldsEditable}
                  variant={"flat"}
                  onEdit={() => {
                    router.push(
                      routes.fsp[product].financingCase.contractEditor(
                        financingCaseId,
                        document.id,
                      ),
                    );
                  }}
                  title={document.filename}
                  translations={{
                    deleteDocument: t(
                      "contractFileUpload.documentActions.deleteDocument",
                    ),
                    editSignatures: t(
                      "contractFileUpload.documentActions.editSignatures",
                    ),
                    prepareSignatures: t(
                      "contractFileUpload.documentActions.prepareSignatures",
                    ),
                  }}
                  onDelete={async () => {
                    const deleteResponse = await deleteContractAction({
                      product,
                      financingCaseId,
                      contractId: document.id,
                    });

                    if (deleteResponse.success) {
                      await documentExchangeRefetchAction(financingCaseId);
                      await queryClient.invalidateQueries({
                        queryKey: ["contracts", financingCaseId],
                      });
                      await queryClient.invalidateQueries({
                        queryKey: ["editorStatus", financingCaseId],
                      });
                    }
                  }}
                />
              );
            })}

            <ContractFileUpload
              financingCaseId={financingCaseId}
              contractGroupId={contractGroup.id}
              acceptedTypes={contractGroup.contentTypes}
              product={product}
            />
          </VStack>
        );
      })}
      <ContractActionButtons
        initialData={editorStatusResponse}
        financingCaseId={financingCaseId}
      />
    </VStack>
  );
};
```

### Key Points

- The outer `VStack` uses `gap={16}` between contract groups and `gap={4}` within each group
- Each contract group renders: `Headline` → description `Typography` → `ContractDocument` cards → `ContractFileUpload`
- `ContractActionButtons` appears once at the bottom, outside the group loop
- `onDelete` calls `deleteContractAction`, then syncs document exchange and invalidates both query caches
- `onEdit` navigates to the contract editor route — adapt `routes.fsp[product].financingCase.contractEditor(...)` to your project's route structure

## ContractDocument Props (from @finstreet/ui)

The `ContractDocument` component from `@finstreet/ui` renders a single uploaded document card with status, actions (edit/delete), and a filename.

```typescript
{
  status: Status;                    // "done" | "partiallyDone" | "warning" | "active"
  statusDescription: string;         // translated status text
  editable: boolean;                 // whether edit button is shown
  variant: "flat";                   // always "flat" in this context
  onEdit: () => void;                // navigate to contract editor
  title: string;                     // document.filename
  translations: {
    deleteDocument: string;
    editSignatures: string;
    prepareSignatures: string;
  };
  onDelete: () => Promise<void>;     // delete handler
}
```

## ContractFileUpload

File: `src/features/contracts/components/ContractFileUpload.tsx`

A file upload component rendered once per contract group. Wraps `@finstreet/ui`'s `FileInput` component with upload handling, error state, and cache invalidation.

### How It Works

1. **User selects files** via the `FileInput` dropzone
2. **Upload starts** inside a `useTransition` to track pending state
3. **Calls `uploadContractAction`** — server action that checksums files and uploads to Google Cloud via signed URL
4. **On completion** — invalidates contracts + editor status queries, refetches document exchange, clears the file input
5. **Error handling** — sets error strings if upload fails

### Template

```tsx
import { useState, useTransition } from "react";

import { UseFileUploadReturn } from "@ark-ui/react";
import { FileInput } from "@finstreet/ui/components/base/Form/FileInput";
import { useTranslations } from "next-intl";
import { Product } from "@/shared/types/Portal";
import documentExchangeRefetchAction from "@/features/documentExchange/common/actions/documentExchangeRefetchAction";
import { uploadContractAction } from "@/shared/backend/models/contracts/uploadContractAction";
import { useQueryClient } from "@tanstack/react-query";

export type UploadDocumentResult =
  | {
      success: false;
      error: {
        message?: string;
      };
    }
  | {
      success: true;
    };

export type ContractFileUploadProps = {
  financingCaseId: string;
  contractGroupId: string;
  acceptedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  product: Product;
};

export const ContractFileUpload = ({
  financingCaseId,
  contractGroupId,
  acceptedTypes,
  maxFileSize,
  maxFiles,
  product,
}: ContractFileUploadProps) => {
  const t = useTranslations(
    "signatureProcess.startSignatureProcess.contractFileUpload",
  );
  const queryClient = useQueryClient();
  const [isUploading, startUploadTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const refetch = () => documentExchangeRefetchAction(financingCaseId);
  const uploadDocument = (files: File[]) =>
    uploadContractAction({
      files,
      financingCaseId,
      documentRequestId: contractGroupId,
      product,
    });

  const hasErrors = errors.length > 0;

  const handleFileChange = async (
    acceptedFiles: File[],
    fileUpload: UseFileUploadReturn,
  ) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    startUploadTransition(async () => {
      setErrors([]);
      const result = await uploadDocument(acceptedFiles);

      if (!result.success) {
        setErrors(["upload_failed"]);
      }

      refetch();
      await queryClient.invalidateQueries({
        queryKey: ["contracts", financingCaseId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["editorStatus", financingCaseId],
      });

      fileUpload.clearFiles();
    });
  };

  return (
    <FileInput
      variant={"fullWidth"}
      showPreviewList={false}
      acceptedTypes={acceptedTypes}
      maxFileSize={maxFileSize}
      maxFiles={maxFiles}
      disabled={isUploading}
      onFileChange={handleFileChange}
      translations={{
        dropzone: isUploading ? t("processing") : t("dropzone"),
        acceptedTypes: t("acceptedTypes"),
        maxFileSize: t("maxFileSize"),
        processing: t("processing"),
      }}
    />
  );
};
```

### Key Points

- Does NOT have `"use client"` directive — it's rendered inside `ContractsPageContent` which is already a client component
- Uses `useTransition` for non-blocking upload state (keeps UI responsive during upload)
- `FileInput` from `@finstreet/ui` uses `variant="fullWidth"` and `showPreviewList={false}`
- The `onFileChange` callback receives both the accepted files and the `fileUpload` instance (from `@ark-ui/react`) to call `clearFiles()` after upload
- Translation namespace is nested under `signatureProcess.startSignatureProcess.contractFileUpload`
- After upload: refetch document exchange → invalidate contracts query → invalidate editorStatus query → clear files

## ContractActionButtons

File: `src/features/contracts/components/ContractActionButtons.tsx`

Action buttons at the bottom of the contracts page. Shows a warning banner if the user cannot proceed, a back link, and a continue button.

### How It Works

1. **Polls editor status** via `useEditorStatus` hook to check if user can proceed
2. **Shows warning banner** if `editorStatus.userMayProceed` is false — displays the reason message
3. **Back button** — links to the financing case overview
4. **Continue button** — navigates to the next step in the signature process (e.g., signature assignment page). Some products may start signing directly instead — adapt `handleClick` to your product's flow.

### Template

```tsx
"use client";

import { routes } from "@/routes";
import { useEditorStatus } from "@/shared/backend/models/signature/hooks/useEditorStatus";
import { EditorStatusResponseType } from "@/shared/backend/models/signature/schema";
import { useProduct } from "@/shared/context/product/productContext";
import { Banner } from "@finstreet/ui/components/base/Banner";
import { Button } from "@finstreet/ui/components/base/Button";
import { Link } from "@finstreet/ui/components/base/Link";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { HStack, VStack } from "@styled-system/jsx";
import { dataTestIds } from "e2e/data/dataTestIds";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ContractActionButtonsProps = {
  initialData: EditorStatusResponseType;
  financingCaseId: string;
};

export const ContractActionButtons = ({
  initialData,
  financingCaseId,
}: ContractActionButtonsProps) => {
  const t = useTranslations("signatureProcess.startSignatureProcess");
  const router = useRouter();
  const { product } = useProduct();
  const { editorStatus } = useEditorStatus({
    financingCaseId,
    initialData,
    product,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>(false);

  const handleClick = () => {
    startTransition(async () => {
      // Default: navigate to signature assignment page
      // Adapt this logic per product — some products may start signing
      // directly via startSigningAction instead of going to assignment.
      router.push(
        routes.fsp[product].financingCase.assignSignatures(financingCaseId),
      );
    });
  };

  return (
    <VStack alignItems="stretch" gap={12} width={"100%"}>
      {!editorStatus?.userMayProceed ? (
        <Banner type="warning">{editorStatus?.reason?.message}</Banner>
      ) : null}
      <HStack justifyContent={"space-between"} width={"100%"}>
        <Link
          as="button"
          variant="text"
          href={routes.fsp[product].financingCase.overview(financingCaseId)}
          name={t("actions.back")}
        >
          {t("actions.back")}
        </Link>
        <VStack alignItems="flex-end" gap={4}>
          {error ? (
            <Typography color="text.error">
              {t("error")}
            </Typography>
          ) : null}
          <Button
            variant="primary"
            disabled={!editorStatus?.userMayProceed}
            onClick={handleClick}
            loading={isPending}
          >
            {t("actions.continue")}
          </Button>
        </VStack>
      </HStack>
    </VStack>
  );
};
```

### Key Points

- Has `"use client"` directive
- Uses `useEditorStatus` hook which polls every 5s while `userMayProceed` is false
- The `useEditorStatus` hook automatically stops polling once the user can proceed
- Warning banner shows `editorStatus.reason.message` — a human-readable string from the backend explaining why the user cannot proceed (e.g., documents still scanning, signature fields not assigned)
- Back link uses `Link` component with `as="button"` and `variant="text"`
- Add `data-testid` attributes from `dataTestIds` as appropriate for your product's e2e tests
- Adapt `handleClick` to your product: the default navigates to `assignSignatures`, but some products may call `startSigningAction` directly and navigate to the overview on success
- Adapt route paths (`routes.fsp[product].financingCase.*`) to match your project's route structure

## ContractsLoading

File: `src/features/contracts/components/ContractsLoading.tsx`

Skeleton placeholder shown while server data loads.

```tsx
import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { useTranslations } from "next-intl";
import { HStack, VStack } from "@styled-system/jsx";
import { BoxSkeleton } from "@finstreet/ui/components/base/Skeletons/BoxSkeleton";

export default function ContractsLoading() {
  const t = useTranslations("signatureProcess.startSignatureProcess");

  return (
    <>
      <SubPageHeaderSkeleton title={t("title")} />
      <PageContent>
        <VStack gap={8} alignItems={"stretch"}>
          <Typography>{t("description")}</Typography>
          <VStack gap={4} width={"100%"}>
            <BoxSkeleton width={"100%"} height={230} />
            <BoxSkeleton width={"100%"} height={230} />
          </VStack>
          <HStack justifyContent={"space-between"}>
            <BoxSkeleton width={"200px"} height={15}></BoxSkeleton>
            <BoxSkeleton width={"200px"} height={15}></BoxSkeleton>
          </HStack>
        </VStack>
      </PageContent>
    </>
  );
}
```

### Key Points

- Default export (used as `loading.tsx` re-export)
- Shows `SubPageHeaderSkeleton` with the page title
- Two `BoxSkeleton` blocks (height 230) represent the contract groups + file upload areas
- Bottom `HStack` with two small skeletons represents the back/continue buttons

## Page Pattern

The route page is a server component that fetches three pieces of data and composes the header + content.

```tsx
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
import { getContracts } from "@/shared/backend/models/contracts/server";
import {
  getEditorStatus,
  getSigningHeader,
} from "@/shared/backend/models/signature/server";
import { Constants } from "@/shared/utils/constants";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContractsPageContent } from "@/features/contracts/components/ContractsPageContent";
import { FspFinancingCaseOverviewSubPageHeader } from "@/layouts/fsp/FspFinancingCaseOverviewSubPageHeader";

export const metadata: Metadata = {
  title: `${Constants.companyName} - Signaturprozess`,
};

type Props = {
  params: Promise<{
    financingCaseId: string;
  }>;
};

export default async function FSPFinancingCaseSignatureProcessPage({
  params,
}: Props) {
  const { financingCaseId } = await params;
  const t = await getTranslations("signatureProcess.startSignatureProcess");
  const contractsResponse = await fetchWithErrorHandling(() =>
    getContracts("{product}")({
      pathVariables: { financingCaseId },
    }),
  );

  const signingHeaderResponse = await fetchWithErrorHandling(() =>
    getSigningHeader("{product}")({
      pathVariables: { financingCaseId },
    }),
  );

  const editorStatusResponse = await fetchWithErrorHandling(() =>
    getEditorStatus("{product}")({
      pathVariables: { financingCaseId },
    }),
  );

  return (
    <>
      <FspFinancingCaseOverviewSubPageHeader
        title={t("title")}
        financingCaseId={financingCaseId}
        header={signingHeaderResponse.header}
      />
      <PageContent>
        <ContractsPageContent
          contractsResponse={contractsResponse}
          editorStatusResponse={editorStatusResponse}
          financingCaseId={financingCaseId}
        />
      </PageContent>
    </>
  );
}
```

### Loading Page (route `loading.tsx`)

```tsx
import ContractsLoading from "@/features/contracts/components/ContractsLoading";

export default function FSPFinancingCaseSignatureProcessLoading() {
  return <ContractsLoading />;
}
```

### Key Points

- Replace `"{product}"` with the actual product string for your use case
- The page fetches 3 things: contracts, signing header, editor status
- All 3 use `fetchWithErrorHandling` wrapper
- All 3 backend functions are parameterized by product string
- `ContractsPageContent` is wrapped in `<PageContent>` at the page level
- Adapt the sub-page header component to match your project's header pattern
