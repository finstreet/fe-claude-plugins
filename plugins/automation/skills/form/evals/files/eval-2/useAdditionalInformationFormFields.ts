import { AdditionalInformationType } from "@/features/propertyManagement/forms/additionalInformation/additionalInformationSchema";
import { FormFieldsType } from "@finstreet/forms";
import { YesNoOptions } from "@/shared/components/form/YesNoRadioGroup/options";
import { useTranslations } from "next-intl";
import { parseDate } from "@ark-ui/react";
import {useDurationOptions} from "./options/durationOptions";

export const useAdditionalInformationFormFields = (): FormFieldsType<AdditionalInformationType> => {
    const t = useTranslations("additionalInformation.form");
    const durationOptions = useDurationOptions()

    return {
        propertyManagementExistingLiabilityInsurance: {
            type: "yes-no-radio-group",
            label: t("fields.propertyManagementExistingLiabilityInsurance.label"),
        },
        propertyManagementTaxId: {
            type: "input",
            label: t("fields.propertyManagementTaxId.label"),
        },
        recentForcedAuctions: {
            type: "number",
            decimal: 0,
            label: t("fields.recentForcedAuctions.label"),
        },
        maintenanceFeesArrearsInfo: {
            maintenanceFeesArrears: {
                type: "yes-no-radio-group",
                label: t(
                    "fields.maintenanceFeesArrearsInfo.maintenanceFeesArrears.label",
                ),
            },
            maintenanceFeesArrearsUnitCount: {
                type: "number",
                decimal: 0,
                label: t(
                    "fields.maintenanceFeesArrearsInfo.maintenanceFeesArrearsUnitCount.label",
                ),
                renderCondition: (formValues) => {
                    return (
                        formValues.maintenanceFeesArrearsInfo.maintenanceFeesArrears ===
                        YesNoOptions.YES
                    );
                },
            },
        },
        buildingInsurance: {
            type: "yes-no-radio-group",
            label: t("fields.buildingInsurance.label"),
        },
        naturalHazardsInsurance: {
            type: "yes-no-radio-group",
            label: t("fields.naturalHazardsInsurance.label"),
        },
        legalNotificationBghConfirmed: {
            type: "checkbox",
            label: t("fields.legalNotificationBghConfirmed.label"),
        },
        durationOptions: {
            type: "select" ,
            label: t("fields.durationOptions.label"),
            items: durationOptions,
        },
        financingCaseId: {
            type: "hidden",
        },
    };
};
