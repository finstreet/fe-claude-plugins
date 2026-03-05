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

---

## Example: Modal Create Form (Legal Representative)

A modal form with Zustand store integration, `usePortal`/`useProduct`, `useSuccessAction` closing modal, `revalidatePath` + return (no redirect), and cancel button.

### Directory Structure

```
legalRepresentatives/
  ├── forms/
  │   ├── create/
  │   │   ├── CreateLegalRepresentativeForm.tsx
  │   │   └── useCreateLegalRepresentativeFormConfig.tsx
  │   ├── legalRepresentativeSchema.ts
  │   ├── useLegalRepresentativeFormFields.ts
  │   ├── legalRepresentativeFormAction.ts
  │   └── LegalRepresentativeFormFields.tsx
  └── modals/
      └── CreateLegalRepresentativeModal/
          ├── store.ts
          ├── modal.tsx
          └── OpenCreateLegalRepresentativeModalButton.tsx
```

### Zustand Modal Store

```typescript
// modals/CreateLegalRepresentativeModal/store.ts
import { create } from "zustand";

type CreateLegalRepresentativeModalData = {
  financingCaseId: string;
} | null;

interface CreateLegalRepresentativeModalStore {
  isOpen: boolean;
  data: CreateLegalRepresentativeModalData;
  setIsOpen: (isOpen: boolean) => void;
  setData: (data: CreateLegalRepresentativeModalData) => void;
}

export const useCreateLegalRepresentativeModal =
  create<CreateLegalRepresentativeModalStore>((set) => ({
    isOpen: false,
    data: null,
    setIsOpen: (isOpen) => set({ isOpen }),
    setData: (data) => set({ data, isOpen: true }),
  }));
```

### Schema

```typescript
// forms/legalRepresentativeSchema.ts
import * as z from "@/lib/zod";
import { FormConfig, FormState } from "@finstreet/forms";
import { DeepPartial } from "@finstreet/forms/rhf";

export const createLegalRepresentativeSchema = z.object({
  financingCaseId: z.trimmedString().min(1),
  soleSignatureAuthorized: z.boolean(),
  firstName: z.trimmedString().min(1).max(50),
  lastName: z.trimmedString().min(1).max(50),
  email: z.trimmedString().email(),
  phoneNumber: z.trimmedString().min(1),
});

export type CreateLegalRepresentativeType = z.input<typeof createLegalRepresentativeSchema>;
export type CreateLegalRepresentativeOutputType = z.output<typeof createLegalRepresentativeSchema>;
export type CreateLegalRepresentativeFormState = FormState;
export type CreateLegalRepresentativeFormConfig = FormConfig<
  CreateLegalRepresentativeFormState,
  CreateLegalRepresentativeType,
  CreateLegalRepresentativeOutputType
>;
```

### Form Action

```typescript
// forms/legalRepresentativeFormAction.ts
"use server";

import { createLegalRepresentative } from "@/shared/backend/models/legalRepresentatives/server";
import {
  CreateLegalRepresentativeFormState,
  CreateLegalRepresentativeOutputType,
} from "./legalRepresentativeSchema";
import { revalidatePath } from "next/cache";
import { routes } from "@/routes";
import { handleFormRequestError } from "@/shared/backend/handleFormRequestError";
import { Portal, Product } from "@/shared/types/Portal";

export async function createLegalRepresentativeAction(
  state: CreateLegalRepresentativeFormState,
  formData: CreateLegalRepresentativeOutputType,
  portal: Portal,
  product: Product,
): Promise<CreateLegalRepresentativeFormState> {
  const result = await createLegalRepresentative(product)({
    pathVariables: {
      financingCaseId: formData.financingCaseId,
    },
    payload: {
      soleSignatureAuthorized: formData.soleSignatureAuthorized,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    },
  });

  if (result.success) {
    revalidatePath(
      portal === "propertyManager"
        ? routes.propertyManager.loans.legalRepresentatives(formData.financingCaseId)
        : routes.operations.loans.legalRepresentatives(formData.financingCaseId),
    );
    return { error: null, message: null };
  } else {
    return handleFormRequestError(result.error);
  }
}
```

Key differences from a page form action:
- Extra `portal` and `product` parameters passed via closure
- `revalidatePath` + return (no `redirect`) — the modal closes via `useSuccessAction`
- Portal-conditional path revalidation

### useFormConfig

```tsx
// forms/create/useCreateLegalRepresentativeFormConfig.tsx
import { FormConfig } from "@finstreet/forms";
import { createFormFieldNames } from "@finstreet/forms/lib";
import { useTranslations } from "next-intl";
import { Button } from "@finstreet/ui/components/base/Button";
import { HStack } from "@styled-system/jsx";
import { createLegalRepresentativeAction } from "../legalRepresentativeFormAction";
import {
  createLegalRepresentativeSchema,
  CreateLegalRepresentativeFormState,
  CreateLegalRepresentativeOutputType,
  CreateLegalRepresentativeType,
} from "../legalRepresentativeSchema";
import { useLegalRepresentativeFormFields } from "../useLegalRepresentativeFormFields";
import { useCreateLegalRepresentativeModal } from "@/features/legalRepresentatives/modals/CreateLegalRepresentativeModal/store";
import { usePortal } from "@/shared/context/portal/portalContext";
import { useProduct } from "@/shared/context/product/productContext";

interface UseCreateLegalRepresentativeFormConfigProps {
  financingCaseId: string;
}

export function useCreateLegalRepresentativeFormConfig({
  financingCaseId,
}: UseCreateLegalRepresentativeFormConfigProps): FormConfig<
  CreateLegalRepresentativeFormState,
  CreateLegalRepresentativeType,
  CreateLegalRepresentativeOutputType
> {
  const t = useTranslations("legalRepresentatives.form");
  const fields = useLegalRepresentativeFormFields();
  const { setIsOpen } = useCreateLegalRepresentativeModal();
  const { portal } = usePortal();
  const { product } = useProduct();

  return {
    fields,
    defaultValues: {
      financingCaseId,
      soleSignatureAuthorized: false,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
    schema: createLegalRepresentativeSchema,
    fieldNames: createFormFieldNames(fields),
    serverAction: (state, formData) =>
      createLegalRepresentativeAction(state, formData, portal, product),
    useSuccessAction: () => {
      return (formState: CreateLegalRepresentativeFormState) => {
        setIsOpen(false);
      };
    },
    useErrorAction: () => {
      return (formState: CreateLegalRepresentativeFormState) => {
        console.error(formState?.error);
      };
    },
    renderFormActions: (isPending: boolean) => {
      return (
        <HStack mt={12} justifyContent={"flex-end"}>
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            variant="text"
          >
            {t("actions.cancel")}
          </Button>
          <Button loading={isPending} type="submit">
            {t("actions.submit")}
          </Button>
        </HStack>
      );
    },
  };
}
```

Key differences from a page formConfig:
- Gets `setIsOpen` from Zustand modal store
- `serverAction` wraps the action in a closure to pass `portal` and `product`
- `useSuccessAction` calls `setIsOpen(false)` to close the modal
- Cancel button calls `setIsOpen(false)`
- Default values defined inline (no separate `getDefaultValues` file needed for create-only modals)

### Form Component

```tsx
// forms/create/CreateLegalRepresentativeForm.tsx
"use client";

import { Form } from "@/shared/components/form/Form";
import { LegalRepresentativeFormFields } from "../LegalRepresentativeFormFields";
import { useCreateLegalRepresentativeFormConfig } from "./useCreateLegalRepresentativeFormConfig";

type CreateLegalRepresentativeFormProps = {
  financingCaseId: string;
};

export const CreateLegalRepresentativeForm = ({
  financingCaseId,
}: CreateLegalRepresentativeFormProps) => {
  const config = useCreateLegalRepresentativeFormConfig({ financingCaseId });

  return (
    <Form formConfig={config}>
      <LegalRepresentativeFormFields fieldNames={config.fieldNames} />
    </Form>
  );
};
```

### Modal Component

```tsx
// modals/CreateLegalRepresentativeModal/modal.tsx
"use client";

import {
  Modal,
  ModalContent,
  ModalTitle,
} from "@finstreet/ui/components/patterns/Modal";
import { useCreateLegalRepresentativeModal } from "./store";
import { CreateLegalRepresentativeForm } from "@/features/legalRepresentatives/forms/create/CreateLegalRepresentativeForm";
import { useTranslations } from "next-intl";

export const CreateLegalRepresentativeModal = () => {
  const { isOpen, data, setIsOpen } = useCreateLegalRepresentativeModal();
  const t = useTranslations("legalRepresentatives.modals.create");

  if (!data) {
    return null;
  }

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalTitle>{t("title")}</ModalTitle>
      <ModalContent>
        <CreateLegalRepresentativeForm financingCaseId={data.financingCaseId} />
      </ModalContent>
    </Modal>
  );
};
```

### Open Modal Button

```tsx
// modals/CreateLegalRepresentativeModal/OpenCreateLegalRepresentativeModalButton.tsx
"use client";

import { useCreateLegalRepresentativeModal } from "./store";
import { Button } from "@finstreet/ui/components/base/Button";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
};

export const OpenCreateLegalRepresentativeModalButton = ({
  financingCaseId,
}: Props) => {
  const { setData } = useCreateLegalRepresentativeModal();
  const t = useTranslations("legalRepresentatives.buttons");

  return (
    <Button onClick={() => setData({ financingCaseId })}>
      {t("createLegalRepresentative")}
    </Button>
  );
};
```

The modal pattern summary:
1. **Store** (`store.ts`): Zustand store with `isOpen`, `data`, `setIsOpen`, `setData` — calling `setData` auto-opens
2. **Action** (`formAction.ts`): Extra `portal`/`product` params, `revalidatePath` + return (no redirect)
3. **Config** (`useFormConfig.tsx`): `setIsOpen` from store, `useSuccessAction` closes modal, serverAction closure
4. **Form** (`Form.tsx`): Standard `"use client"` wrapper — no differences from page forms
5. **Modal** (`modal.tsx`): Guards with `if (!data) return null`, wraps form in `<Modal>` / `<ModalContent>`
6. **Button** (`Button.tsx`): Calls `setData({...})` to open modal with payload
