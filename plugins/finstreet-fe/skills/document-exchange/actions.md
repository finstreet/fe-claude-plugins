# Document Exchange Actions

Four server/client actions handle document operations. They live in `src/features/documentExchange/common/actions/` and are shared across portals. When creating a new product variant, only the `revalidatePath` routes need adjusting.

## Upload Action

File: `src/features/documentExchange/common/actions/documentExchangeUploadAction.ts`

Handles multi-file upload: calculates checksum → gets direct upload URL from backend → uploads to Google Cloud Storage.

```ts
"use server";

import { uploadDocument } from "@/shared/backend/models/documentUpload/server";
import { calculateFileChecksum } from "@/shared/utils/calculateFileChecksum";
import { uploadFileToGoogle } from "@/shared/utils/uploadFileToGoogle";

type uploadDocumentResult =
  | {
      success: false;
      error: {
        message?: string;
      };
    }
  | {
      success: true;
    };

export async function documentExchangeUploadAction(
  files: File[],
  financingCaseId: string,
  documentRequestId?: string,
): Promise<uploadDocumentResult> {
  for (const file of files) {
    const checksum = await calculateFileChecksum(file);

    if (documentRequestId) {
      const fileUploadResult = await uploadDocument({
        pathVariables: { financingCaseId },
        payload: {
          documentRequestId,
          blob: {
            filename: file.name,
            checksum,
            contentType: file.type,
            byteSize: file.size,
          },
        },
      });

      if (fileUploadResult.success) {
        const uploadUrl = fileUploadResult.data.blob.directUpload.url;
        const uploadHeaders = fileUploadResult.data.blob.directUpload.headers;

        const uploadResult = await uploadFileToGoogle({
          file,
          directUploadUrl: uploadUrl,
          headers: uploadHeaders,
        });

        if (!uploadResult.success) {
          return {
            success: uploadResult.success,
            error: { message: uploadResult.message },
          };
        }
      } else {
        return {
          success: fileUploadResult.success,
          error: { message: fileUploadResult.error.message },
        };
      }
    } else {
      return {
        success: false,
        error: { message: "No documentRequestId provided!" },
      };
    }
  }

  return { success: true };
}
```

## Download Action

File: `src/features/documentExchange/common/actions/documentExchangeDownloadDocumentAction.ts`

Client-side action that fetches a download URL and opens it in a new tab.

```ts
import { getDocumentDownload } from "@/shared/backend/models/documentDownload/server";

export async function documentExchangeDownloadDocumentAction({
  financingCaseId,
  documentId,
}: {
  financingCaseId: string;
  documentId: string;
}): Promise<{ success: boolean }> {
  const documentDownloadResponse = await getDocumentDownload({
    pathVariables: {
      financingCaseId,
      documentId,
    },
  });

  if (documentDownloadResponse.success) {
    window.open(documentDownloadResponse.data.downloadUrl, "_blank");
    return { success: true };
  }

  return { success: false };
}
```

## Delete Action

File: `src/features/documentExchange/common/actions/documentExchangeDeleteDocumentAction.ts`

Server action that deletes a document and revalidates the page cache.

```ts
"use server";

import { deleteDocument } from "@/shared/backend/models/documentDelete/server";
import { revalidatePath } from "next/cache";
import { routes } from "@/routes";

export async function documentExchangeDeleteDocumentAction({
  financingCaseId,
  documentId,
}: {
  financingCaseId: string;
  documentId: string;
}) {
  const deleteDocumentResponse = await deleteDocument({
    pathVariables: {
      financingCaseId,
      documentId,
    },
  });

  if (deleteDocumentResponse.success) {
    // TODO: adjust route for your product
    revalidatePath(routes.{role}.{product}.financingCase.documents(financingCaseId));
  }

  return;
}
```

**Note:** The `revalidatePath` route must match the product's document page route. Existing implementations use `routes.fsp.hoaLoan.financingCase.documents(...)`.

## Refetch Action

File: `src/features/documentExchange/common/actions/documentExchangeRefetchAction.ts`

Server action that revalidates the page path after an upload — called by the `DocumentRequest` component's `refetch` prop.

```ts
"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/routes";

export default async function documentExchangeRefetchAction(
  financingCaseId: string,
) {
  // TODO: adjust route for your product
  revalidatePath(routes.{role}.{product}.financingCase.documents(financingCaseId));
}
```

**Note:** Same as delete — the route must be adjusted for each product/portal variant.

## When Creating a New Product

The upload and download actions are product-agnostic (they use `financingCaseId` path variables). Only the **delete** and **refetch** actions need adjustment because they call `revalidatePath` with a product-specific route.

If the existing actions already cover your product's route, reuse them as-is. If not, either:
1. Add the new route to the existing action (if it makes sense)
2. Create a product-specific wrapper that calls the shared logic and revalidates the correct path
