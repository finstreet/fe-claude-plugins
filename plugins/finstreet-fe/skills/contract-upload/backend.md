# Contract Upload Backend

The backend layer for contract upload consists of server actions for mutations and a React Query polling hook. The schema, server fetch functions, and client fetch functions are assumed to already exist (created via the `secure-fetch` skill or manually).

## Upload Server Action

File: `src/shared/backend/models/contracts/uploadContractAction.ts`

Server action that handles the multi-step upload process: checksum calculation → get signed URL from backend → upload file to Google Cloud Storage.

```ts
"use server";

import { directUploadContract } from "@/shared/backend/models/contracts/server";
import { Product } from "@/shared/types/Portal";
import { calculateFileChecksum } from "@/shared/utils/calculateFileChecksum";
import { uploadFileToGoogle } from "@/shared/utils/uploadFileToGoogle";

type UploadContractResult =
  | {
      success: false;
      error: {
        message?: string;
      };
    }
  | {
      success: true;
    };

export async function uploadContractAction({
  files,
  financingCaseId,
  documentRequestId,
  product,
}: {
  files: File[];
  financingCaseId: string;
  documentRequestId?: string;
  product: Product;
}): Promise<UploadContractResult> {
  for (const file of files) {
    const checksum = await calculateFileChecksum(file);

    if (documentRequestId) {
      const contractUploadResult = await directUploadContract(product)({
        pathVariables: { financingCaseId: financingCaseId },
        payload: {
          documentRequestId,
          blob: {
            filename: file.name,
            checksum: checksum,
            contentType: file.type,
            byteSize: file.size,
          },
        },
      });

      if (contractUploadResult.success) {
        const uploadUrl = contractUploadResult.data.blob.directUpload.url;
        const uploadHeaders =
          contractUploadResult.data.blob.directUpload.headers;

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
          success: contractUploadResult.success,
          error: { message: contractUploadResult.error.message },
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

### Upload Flow

1. **For each file** in the array:
   - Calculate SHA256 checksum via `calculateFileChecksum`
   - Call `directUploadContract` API — returns a signed Google Cloud Storage URL + headers
   - Upload the file to Google Cloud using the signed URL via `uploadFileToGoogle`
2. **Error handling**: returns on first failure — remaining files are not uploaded
3. **Returns** `{ success: true }` only if ALL files uploaded successfully

### Key Points

- `"use server"` directive — this is a Next.js server action
- Files are uploaded sequentially (loop), not in parallel
- The `documentRequestId` maps to the contract group — it tells the backend which group this file belongs to
- Reuses shared utilities: `calculateFileChecksum` and `uploadFileToGoogle`

## Delete Server Action

File: `src/shared/backend/models/contracts/deleteContractAction.ts`

Simple server action wrapper around the delete endpoint.

```ts
"use server";

import { deleteContract } from "@/shared/backend/models/contracts/server";
import { Product } from "@/shared/types/Portal";

export async function deleteContractAction({
  product,
  financingCaseId,
  contractId,
}: {
  product: Product;
  financingCaseId: string;
  contractId: string;
}) {
  return deleteContract(product)({
    pathVariables: { financingCaseId, contractId },
  });
}
```

## useContracts Hook

File: `src/shared/backend/models/contracts/hooks/useContracts.ts`

React Query hook that fetches contracts with smart polling — automatically polls every 5 seconds while documents are being scanned.

```ts
import { getContractsClient } from "@/shared/backend/models/contracts/client";
import { GetContractsResponseType } from "@/shared/backend/models/contracts/schema";
import { Product } from "@/shared/types/Portal";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useContracts({
  financingCaseId,
  initialData,
  product,
}: {
  financingCaseId: string;
  initialData: GetContractsResponseType;
  product: Product;
}) {
  const { data: contracts } = useQuery({
    queryKey: ["contracts", financingCaseId],
    queryFn: () =>
      getContractsClient(product)({
        pathVariables: {
          financingCaseId,
        },
      }),
    placeholderData: keepPreviousData,
    initialData,
    refetchInterval: (query) => {
      const hasDocumentScanning = query.state.data?.some((group) =>
        group.documents.some(
          (doc) =>
            (doc.scanStatus !== "clean" && doc.scanStatus !== "error") ||
            !doc.flags?.signatureFieldsEditable,
        ),
      );
      return hasDocumentScanning ? 5000 : false;
    },
    refetchOnWindowFocus: true,
  });

  return { contracts };
}
```

### Polling Logic

The hook polls every 5 seconds when ANY document matches either condition:
- `scanStatus` is neither `"clean"` nor `"error"` (still being processed)
- `signatureFieldsEditable` is falsy (fields not yet ready for editing)

Once all documents are clean and editable, polling stops (`refetchInterval: false`).

### Key Points

- Uses `keepPreviousData` to avoid UI flicker during refetches
- `initialData` comes from the server-side fetch in the page component
- Query key is `["contracts", financingCaseId]` — same key used for invalidation after upload/delete
- Uses the client fetch function (`getContractsClient`), not the server one
