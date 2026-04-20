# Layout File

File: `{routePath}/layout.tsx`

The layout wraps all inquiry process steps with a `ProgressBarProvider` and renders the `{Purpose}ProgressBar` alongside the step content (`children`). The exact file path comes from the routes determined earlier (not inside the feature directory).

## Template — No backend request

Use when no existing inquiry data needs to be loaded to determine progress state:

```tsx
import {
  FormLayout,
  FormLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/FormLayout";
import { Box } from "@styled-system/jsx";
import { ProgressBarProvider } from "@finstreet/forms/ProgressBar";
import { Panel } from "@finstreet/ui/components/base/Panel";
import { get{Purpose}InitialProgressState } from "@/features/{purpose}InquiryProcess/utils/get{Purpose}InitialProgressState";
import { {Purpose}ProgressBar } from "@/features/{purpose}InquiryProcess/components/{Purpose}ProgressBar";
import { {Purpose}InquiryProcessSteps } from "@/features/{purpose}InquiryProcess/{Purpose}InquiryProcess.types";

type {Purpose}InquiryLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ inquiryId: string }>;
};

export default async function {Purpose}InquiryLayout({
  children,
  params,
}: {Purpose}InquiryLayoutProps) {
  const { inquiryId } = await params;

  const initialProgressState = get{Purpose}InitialProgressState();

  return (
    <ProgressBarProvider<{Purpose}InquiryProcessSteps>
      initialState={initialProgressState}
    >
      <Box mt={12} mb={24}>
        <FormLayout>
          <Area gridArea="form">
            <Panel
              variant="invisible"
              css={{
                borderRight: { base: "none", lg: "light" },
                borderRadius: 0,
                paddingTop: 3,
                paddingX: { base: 4, lg: 8 },
              }}
            >
              {children}
            </Panel>
          </Area>
          <Area gridArea="progress">
            <{Purpose}ProgressBar />
          </Area>
        </FormLayout>
      </Box>
    </ProgressBarProvider>
  );
}
```

## Template — With backend request

Use when the layout must fetch existing inquiry data to pre-mark completed steps:

```tsx
import {
  FormLayout,
  FormLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/FormLayout";
import { Box } from "@styled-system/jsx";
import { ProgressBarProvider } from "@finstreet/forms/ProgressBar";
import { Panel } from "@finstreet/ui/components/base/Panel";
import { get{Purpose}InitialProgressState } from "@/features/{purpose}InquiryProcess/utils/get{Purpose}InitialProgressState";
import { {Purpose}ProgressBar } from "@/features/{purpose}InquiryProcess/components/{Purpose}ProgressBar";
import { {Purpose}InquiryProcessSteps } from "@/features/{purpose}InquiryProcess/{Purpose}InquiryProcess.types";
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
import { request } from "{requestPath}";

type {Purpose}InquiryLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ inquiryId: string }>;
};

export default async function {Purpose}InquiryLayout({
  children,
  params,
}: {Purpose}InquiryLayoutProps) {
  const { inquiryId } = await params;

  const inquiryData = await fetchWithErrorHandling(() =>
    request({
      pathVariables: {
        id: inquiryId,
      },
    }),
  );

  const initialProgressState = get{Purpose}InitialProgressState(inquiryData);

  return (
    <ProgressBarProvider<{Purpose}InquiryProcessSteps>
      initialState={initialProgressState}
    >
      <Box mt={12} mb={24}>
        <FormLayout>
          <Area gridArea="form">
            <Panel p={{ base: 4, lg: 8 }}>{children}</Panel>
          </Area>
          <Area gridArea="progress">
            <{Purpose}ProgressBar />
          </Area>
        </FormLayout>
      </Box>
    </ProgressBarProvider>
  );
}
```

## Backend request usage

The `fetchWithErrorHandling` convenience function handles error cases (401 → login redirect, 403 → not allowed, 404 → not found, other → throws). Import the request function from the server module:

```typescript
import { fetchWithErrorHandling } from "@/shared/backend/fetchWithErrorHandling";
import { get{Purpose}Inquiry } from "@/shared/backend/models/{purpose}/server";

const inquiryData = await fetchWithErrorHandling(() =>
  get{Purpose}Inquiry({
    pathVariables: { id: inquiryId },
  }),
);
```

See the secure-fetch library for how request functions are created — they always return `{ success: true, data }` or `{ success: false, error }`.

## Rules

- This is a Server Component (`async function`) — no `'use client'` directive
- `params` must be awaited (Next.js App Router)
- `ProgressBarProvider` must wrap the entire layout content
- `{Purpose}InquiryProcessSteps` is the generic type parameter for `ProgressBarProvider`
- The `{Purpose}ProgressBar` is placed in the `gridArea="progress"` area
- `children` (the current step page) goes in `gridArea="form"` inside a `Panel`
- Only import `fetchWithErrorHandling` if the layout actually needs to fetch data
