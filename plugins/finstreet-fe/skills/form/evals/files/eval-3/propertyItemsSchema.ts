import * as z from "@/lib/zod";
import { PostalCodeValidationSchema } from "@/shared/backend/models/validations/PostalCodeValidationSchema";
import { FormState, FormConfig } from "@finstreet/forms";
import { DeepPartial } from "@finstreet/forms/rhf";
import { CustomErrorType } from "@/i18n/useTranslatedError";

const unitCountSchema = z
  .object({
    residential: z.coerce.number().int().min(0),
    commercial: z.coerce.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    const total = (data.residential ?? 0) + (data.commercial ?? 0);
    if (total < 4) {
      ctx.addIssue({
        code: "custom",
        path: ["residential"],
        params: { errorType: CustomErrorType.COMBINED_UNIT_COUNT_TOO_LOW },
      });
      ctx.addIssue({
        code: "custom",
        path: ["commercial"],
        params: { errorType: CustomErrorType.COMBINED_UNIT_COUNT_TOO_LOW },
      });
    }
  });

export const propertyItemsSchema = z.object({
  street: z.trimmedString().min(1).max(50),
  houseNumber: z.trimmedString().min(1).max(6),
  postalCode: PostalCodeValidationSchema,
  city: z.trimmedString().min(1).max(50),
  plotArea: z.coerce.number().min(1),
  constructionYear: z.coerce
    .number()
    .int()
    .min(0)
    .superRefine((val, ctx) => {
      if (val > new Date().getFullYear() + 10) {
        ctx.addIssue({
          code: "custom",
          params: {
            errorType: CustomErrorType.YEAR_TOO_FAR_IN_FUTURE,
            year: new Date().getFullYear() + 10,
          },
        });
      }
    }),
  unitCount: unitCountSchema,
  financingCaseId: z.trimmedString().min(1),
});

export type PropertyItemsType = z.input<typeof propertyItemsSchema>;
export type PropertyItemsOutputType = z.output<typeof propertyItemsSchema>;
export type PropertyItemsFormState = FormState;
export type PropertyItemsFormConfig = FormConfig<
  PropertyItemsFormState,
  PropertyItemsType,
  PropertyItemsOutputType
>;
export type PropertyItemsDefaultValues = DeepPartial<PropertyItemsType>;
