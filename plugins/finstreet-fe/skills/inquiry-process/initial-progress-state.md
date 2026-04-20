# Initial Progress State

File: `utils/get{Purpose}InitialProgressState.ts`

This function initializes the `ProgressBarState` for the `ProgressBarProvider` in the layout. Each key corresponds to a step enum value; the boolean indicates whether that step is already completed (i.e., has data from the backend).

## Template — No backend data (all steps start incomplete)

Use this when the layout does not fetch backend data:

```typescript
import { {Purpose}InquiryProcessSteps } from "@/features/{purpose}InquiryProcess/{Purpose}InquiryProcess.types";
import { ProgressBarState } from "@finstreet/forms/ProgressBar";

export function get{Purpose}InitialProgressState(): ProgressBarState<{Purpose}InquiryProcessSteps> {
  return {
    stepOne: false,
    stepTwo: false,
    stepThree: false,
  };
}
```

## Template — With backend data (steps pre-marked as complete)

Use this when the layout fetches existing inquiry data and some steps may already be filled:

```typescript
import { {Purpose}InquiryProcessSteps } from "@/features/{purpose}InquiryProcess/{Purpose}InquiryProcess.types";
import { Get{Purpose}InquiryResponseType } from "@/shared/backend/models/inquiry/schema";
import { ProgressBarState } from "@finstreet/forms/ProgressBar";

export function get{Purpose}InitialProgressState(
  inquiryData: Get{Purpose}InquiryResponseType,
): ProgressBarState<{Purpose}InquiryProcessSteps> {
  return {
    stepOne: inquiryData.details.stepOne !== null,
    stepTwo: inquiryData.details.stepTwo !== null,
    stepThree: inquiryData.details.stepThree !== null,
  };
}
```

## Example

```typescript
// features/factoringInquiryProcess/utils/getFactoringInitialProgressState.ts

import { FactoringInquiryProcessSteps } from "@/features/factoringInquiryProcess/FactoringInquiryProcess.types";
import { GetFactoringInquiryResponseType } from "@/shared/backend/models/inquiry/schema";
import { ProgressBarState } from "@finstreet/forms/ProgressBar";

export function getFactoringInitialProgressState(
  inquiryData: GetFactoringInquiryResponseType,
): ProgressBarState<FactoringInquiryProcessSteps> {
  return {
    factoringNeed: inquiryData.details.factoringNeed !== null,
    contactData: inquiryData.details.contactData !== null,
    companyData: inquiryData.details.companyData !== null,
    factoringConditions: inquiryData.details.factoringConditions !== null,
  };
}
```

## Rules

- The object keys must exactly match the enum **values** (camelCase), not the enum keys
- When no backend data is available, initialize all steps to `false`
- When backend data is available, check if the step's data object is non-null to determine completion
- The type parameter `ProgressBarState<{Purpose}InquiryProcessSteps>` ensures type safety
