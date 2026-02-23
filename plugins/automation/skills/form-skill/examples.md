# Complete Form Examples

## Example: Financing Details Form

A form with hidden ID, number inputs with currency suffix, selectable cards, and a yes-no radio group.

### Options

```typescript
// options/useUsagePurposeOptions.ts
import { useTranslations } from "next-intl";
import { FaHouse } from "react-icons/fa6";
import { IconType } from "react-icons";

export enum UsagePurposes {
  FACADE = "facade",
  ROOF = "roof",
  HEATING = "heating",
  WINDOWS = "windows",
  OTHER = "other",
}

const usagePurposeIcons: Record<UsagePurposes, IconType> = {
  facade: FaHouse,
  roof: FaHouse,
  heating: FaHouse,
  windows: FaHouse,
  other: FaHouse,
};

export function useUsagePurposeOptions() {
  const t = useTranslations("financingDetails.fields.usagePurpose.items");

  return Object.values(UsagePurposes).map((purpose) => ({
    label: t(purpose),
    id: purpose,
    icon: usagePurposeIcons[purpose],
  }));
}
```

### Schema

```typescript
// financingDetailsSchema.ts
import * as z from "@/lib/zod";
import { FormConfig, FormState } from "@finstreet/forms";
import { DeepPartial } from "@finstreet/forms/rhf";
import { YesNoValidationSchema } from "@finstreet/forms/customValidations";

export const financingDetailsSchema = z.object({
  financingCaseId: z.trimmedString().min(1),
  investmentAmount: z.coerce.number().min(1000).max(1000000000),
  maintenanceReserve: z.coerce.number().min(0),
  plannedSpecialContribution: z.coerce.number().min(0),
  usagePurposes: z.string().array().min(1),
  subCommunity: z.object({
    isSubCommunity: YesNoValidationSchema,
    subCommunitySelfAuthorized: YesNoValidationSchema.optional(),
  }),
});

export type FinancingDetailsType = z.input<typeof financingDetailsSchema>;
export type FinancingDetailsOutputType = z.output<typeof financingDetailsSchema>;
export type FinancingDetailsFormState = FormState;
export type FinancingDetailsFormConfig = FormConfig<FinancingDetailsFormState, FinancingDetailsType, FinancingDetailsOutputType>;
export type FinancingDetailsDefaultValues = DeepPartial<FinancingDetailsType>;
```

### useFormFields

```typescript
// useFinancingDetailsFormFields.ts
import { FormFieldsType } from "@finstreet/forms";
import { YesNoOptions } from "@finstreet/forms/customValidations";
import { useTranslations } from "next-intl";
import { FinancingDetailsType } from "./financingDetailsSchema";
import { useUsagePurposeOptions } from "./options/useUsagePurposeOptions";

export function useFinancingDetailsFormFields(): FormFieldsType<FinancingDetailsType> {
  const t = useTranslations("financingDetails.fields");
  const usagePurposeOptions = useUsagePurposeOptions();

  return {
    financingCaseId: {
      type: "hidden",
    },
    investmentAmount: {
      type: "number",
      label: t("investmentAmount.label"),
      suffix: "€",
    },
    maintenanceReserve: {
      type: "number",
      label: t("maintenanceReserve.label"),
      suffix: "€",
    },
    plannedSpecialContribution: {
      type: "number",
      label: t("plannedSpecialContribution.label"),
      suffix: "€",
    },
    usagePurposes: {
      type: "selectable-cards",
      label: t("usagePurposes.label"),
      selectType: "multiple",
      options: usagePurposeOptions,
    },
    subCommunity: {
      isSubCommunity: {
        type: "yes-no-radio-group",
        label: t("subCommunity.isSubCommunity.label"),
      },
      subCommunitySelfAuthorized: {
        type: "yes-no-radio-group",
        label: t("subCommunity.subCommunitySelfAuthorized.label"),
        renderCondition: (formValues) => {
          return formValues.subCommunity.isSubCommunity === YesNoOptions.YES;
        },
      },
    },
  };
}
```

### Form Action

```typescript
// financingDetailsFormAction.ts
"use server";

import { putFinancingDetails } from "@/shared/backend/models/financingDetails/server";
import {
  FinancingDetailsFormState,
  FinancingDetailsOutputType,
} from "./financingDetailsSchema";
import { handleFormRequestError } from "@/shared/backend/handleFormRequestError";

export async function financingDetailsFormAction(
  state: FinancingDetailsFormState,
  formData: FinancingDetailsOutputType,
): Promise<FinancingDetailsFormState> {
  const { financingCaseId } = formData;

  const result = await putFinancingDetails({
    pathVariables: { financingCaseId },
    payload: {
      investmentAmount: formData.investmentAmount.toString(),
      maintenanceReserve: formData.maintenanceReserve.toString(),
      plannedSpecialContribution: formData.plannedSpecialContribution.toString(),
      usagePurposes: formData.usagePurposes,
      subCommunity: formData.subCommunity.isSubCommunity,
      subCommunitySelfAuthorized: formData.subCommunity.subCommunitySelfAuthorized ?? null,
    },
  });

  if (result.success) {
    return {
      error: null,
      message: "Finanzierungsdetails wurden erfolgreich gespeichert.",
    };
  } else {
    return handleFormRequestError(result.error);
  }
}
```

### Default Values

```typescript
// getFinancingDetailsDefaultValues.ts
import { FinancingDetailsDefaultValues } from "./financingDetailsSchema";
import { FinancingDetailsResponse } from "@/shared/backend/models/financingDetails";

export function getFinancingDetailsDefaultValues({
  financingCaseId,
  backendValues,
}: {
  financingCaseId: string;
  backendValues?: FinancingDetailsResponse;
}) {
  const defaultValues = {
    financingCaseId,
    investmentAmount: undefined,
    maintenanceReserve: undefined,
    plannedSpecialContribution: undefined,
    usagePurposes: undefined,
    subCommunity: {
      isSubCommunity: undefined,
      subCommunitySelfAuthorized: undefined,
    },
  } as const satisfies FinancingDetailsDefaultValues;

  if (!backendValues) {
    return defaultValues;
  }

  return {
    ...defaultValues,
    investmentAmount: backendValues.investmentAmount,
    maintenanceReserve: backendValues.maintenanceReserve,
    plannedSpecialContribution: backendValues.plannedSpecialContribution,
    usagePurposes: backendValues.usagePurposes ?? defaultValues.usagePurposes,
    subCommunity: {
      isSubCommunity: backendValues.subCommunity ?? defaultValues.subCommunity.isSubCommunity,
      subCommunitySelfAuthorized: backendValues.subCommunitySelfAuthorized ?? defaultValues.subCommunity.subCommunitySelfAuthorized,
    },
  };
}
```

### useFormConfig

```tsx
// useFinancingDetailsFormConfig.tsx
import { FormConfig } from "@finstreet/forms";
import { createFormFieldNames } from "@finstreet/forms/lib";
import { useTranslations } from "next-intl";
import { Button } from "@finstreet/ui/components/base/Button";
import { HStack } from "@styled-system/jsx";
import { FaArrowRight } from "react-icons/fa6";
import { financingDetailsFormAction } from "./financingDetailsFormAction";
import {
  financingDetailsSchema,
  FinancingDetailsFormState,
  FinancingDetailsOutputType,
  FinancingDetailsType,
  FinancingDetailsDefaultValues,
} from "./financingDetailsSchema";
import { useFinancingDetailsFormFields } from "./useFinancingDetailsFormFields";

export function useFinancingDetailsFormConfig(
  defaultValues: FinancingDetailsDefaultValues,
): FormConfig<FinancingDetailsFormState, FinancingDetailsType, FinancingDetailsOutputType> {
  const t = useTranslations("buttons");
  const fields = useFinancingDetailsFormFields();

  return {
    fields,
    defaultValues,
    schema: financingDetailsSchema,
    fieldNames: createFormFieldNames(fields),
    serverAction: financingDetailsFormAction,
    useErrorAction: () => {
      return (formState: FinancingDetailsFormState) => {
        console.error(formState?.error);
      };
    },
    renderFormActions: (isPending: boolean) => {
      return (
        <HStack mt={12} justifyContent={"space-between"}>
          <Button loading={isPending} type="submit" icon={<FaArrowRight />}>
            {t("next")}
          </Button>
        </HStack>
      );
    },
  };
}
```

### FormFields Component

```tsx
// FinancingDetailsFormFields.tsx
import { FinancingDetailsType } from "./financingDetailsSchema";
import { FieldNamesType, FormFieldsType } from "@finstreet/forms";
import { DynamicFormField } from "@/shared/components/form/DynamicFormField";
import { Fields } from "@finstreet/ui/components/pageLayout/Fields";

type FinancingDetailsFormFieldsProps = {
  fieldNames: FieldNamesType<FormFieldsType<FinancingDetailsType>>;
};

export const FinancingDetailsFormFields = ({
  fieldNames,
}: FinancingDetailsFormFieldsProps) => {
  return (
    <Fields>
      <DynamicFormField fieldName={fieldNames.investmentAmount} />
      <DynamicFormField fieldName={fieldNames.maintenanceReserve} />
      <DynamicFormField fieldName={fieldNames.plannedSpecialContribution} />
      <DynamicFormField fieldName={fieldNames.usagePurposes} />
      <DynamicFormField fieldName={fieldNames.subCommunity.isSubCommunity} />
      <DynamicFormField fieldName={fieldNames.subCommunity.subCommunitySelfAuthorized} />
    </Fields>
  );
};
```

### Form Component

```tsx
// FinancingDetailsForm.tsx
"use client";

import { Form } from "@/shared/components/form/Form";
import { useFinancingDetailsFormConfig } from "./useFinancingDetailsFormConfig";
import { FinancingDetailsFormFields } from "./FinancingDetailsFormFields";
import { FinancingDetailsDefaultValues } from "./financingDetailsSchema";
import { Validity } from "@finstreet/forms/ProgressBar";
import { HoaInquiryProcessSteps } from "@/features/hoaInquiryProcess/hoaInquiryProcess.types";

type FinancingDetailsFormProps = {
  defaultValues: FinancingDetailsDefaultValues;
};

export const FinancingDetailsForm = ({ defaultValues }: FinancingDetailsFormProps) => {
  const config = useFinancingDetailsFormConfig(defaultValues);

  return (
    <Form formConfig={config}>
      <FinancingDetailsFormFields fieldNames={config.fieldNames} />
      <Validity<HoaInquiryProcessSteps>
        stepId={HoaInquiryProcessSteps.FINANCING_DETAILS}
      />
    </Form>
  );
};
```
