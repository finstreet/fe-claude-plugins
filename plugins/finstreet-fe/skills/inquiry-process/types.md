# Types File

File: `{Purpose}InquiryProcess.types.ts`

The types file defines the steps of the inquiry process as an enum. This enum is the single source of truth used across the ProgressBar, initial progress state, layout, and each form step.

## Template

```typescript
export enum {PURPOSE}InquiryProcessSteps {
  STEP_ONE = "stepOne",
  STEP_TWO = "stepTwo",
  STEP_THREE = "stepThree",
}
```

## Example

```typescript
// features/factoringInquiryProcess/FactoringInquiryProcess.types.ts

export enum FactoringInquiryProcessSteps {
  FACTORING_NEED = "factoringNeed",
  CONTACT_DATA = "contactData",
  COMPANY_DATA = "companyData",
  FACTORING_CONDITIONS = "factoringConditions",
}
```

## Rules

- Use SCREAMING_SNAKE_CASE for enum keys
- Use camelCase for enum values — these map to object keys in `ProgressBarState`
- The enum values must exactly match the keys used in the `ProgressBarState` object in `get{Purpose}InitialProgressState.ts`
- Add one entry per step in the inquiry process
