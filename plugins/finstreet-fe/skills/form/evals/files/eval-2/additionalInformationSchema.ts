import * as z from "@/lib/zod";
import { YesNoValidationSchema } from "@/shared/backend/models/validations/YesNoValidationSchema";
import { RequiredCheckboxValidationSchema } from "@/shared/backend/models/validations/RequiredCheckboxValidationSchema";
import { FormState, FormConfig } from "@finstreet/forms";
import { DeepPartial } from "react-hook-form";
import { TaxIDValidationSchema } from "@/shared/backend/models/validations/TaxIDValidationSchema";
import {DurationOptions} from "./options/durationOptions";

const MaintenanceArrearsInfoSchema = z
    .object({
        maintenanceFeesArrears: YesNoValidationSchema,
        maintenanceFeesArrearsUnitCount: z.coerce.number().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.maintenanceFeesArrears) {
            const maintenanceFeesArrearsUnitCountResult = z.coerce
                .number()
                .min(1)
                .safeParse(data.maintenanceFeesArrearsUnitCount);
            if (
                !maintenanceFeesArrearsUnitCountResult.success &&
                maintenanceFeesArrearsUnitCountResult.error.issues[0]
            ) {
                ctx.addIssue({
                    ...maintenanceFeesArrearsUnitCountResult.error.issues[0],
                    message: undefined,
                    path: ["maintenanceFeesArrearsUnitCount"],
                });
            }
        }
    });

export const additionalInformationSchema = z.object({
    propertyManagementExistingLiabilityInsurance: YesNoValidationSchema,
    propertyManagementTaxId: TaxIDValidationSchema,
    recentForcedAuctions: z.coerce.number().min(0),
    maintenanceFeesArrearsInfo: MaintenanceArrearsInfoSchema,
    buildingInsurance: YesNoValidationSchema,
    naturalHazardsInsurance: YesNoValidationSchema,
    legalNotificationBghConfirmed: RequiredCheckboxValidationSchema,
    durationOptions: z.enum(DurationOptions).optional(),
    financingCaseId: z.string(),
});

export type AdditionalInformationType = z.input<
    typeof additionalInformationSchema
>;
export type AdditionalInformationOutputType = z.output<
    typeof additionalInformationSchema
>;
export type AdditionalInformationFormState = FormState;
export type AdditionalInformationFormConfig = FormConfig<
    AdditionalInformationFormState,
    AdditionalInformationType,
    AdditionalInformationOutputType
>;

export type AdditionalInformationDefaultValues =
    DeepPartial<AdditionalInformationType>;
