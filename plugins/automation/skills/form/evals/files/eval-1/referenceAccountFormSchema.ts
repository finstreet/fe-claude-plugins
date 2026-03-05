import * as z from "@/lib/zod";
import { IbanValidationSchema } from "@/shared/backend/models/validations/IbanValidationSchema";
import { FormState, FormConfig } from "@finstreet/forms";
import { DeepPartial } from "react-hook-form";

export const referenceAccountFormSchema = z.object({
  financingCaseId: z.string().min(1),
  bankAccountOwner: z.trimmedString().min(1),
  iban: IbanValidationSchema,
});

export type UpdateReferenceAccountType = z.input<
  typeof referenceAccountFormSchema
>;
export type UpdateReferenceAccountOutputType = z.output<
  typeof referenceAccountFormSchema
>;
export type UpdateReferenceAccountFormState = FormState;
export type UpdateReferenceAccountFormConfig = FormConfig<
  UpdateReferenceAccountFormState,
  UpdateReferenceAccountType,
  UpdateReferenceAccountOutputType
>;
export type UpdateReferenceAccountDefaultValues =
  DeepPartial<UpdateReferenceAccountType>;
