import { AdditionalInformationType } from "@/features/propertyManagement/forms/additionalInformation/additionalInformationSchema";
import { FormFieldsType } from "@finstreet/forms";
import { YesNoOptions } from "@/shared/components/form/YesNoRadioGroup/options";
import { useExtracted } from "next-intl";
import { parseDate } from "@ark-ui/react";
import {useDurationOptions} from "./options/durationOptions";

export const useAdditionalInformationFormFields = (): FormFieldsType<AdditionalInformationType> => {
    const t = useExtracted();
    const durationOptions = useDurationOptions()

    return {
        propertyManagementExistingLiabilityInsurance: {
            type: "yes-no-radio-group",
            label: t("Besteht eine Haftpflichtversicherung für Ihre Hausverwaltung?"),
        },
        propertyManagementTaxId: {
            type: "input",
            label: t("Steuernummer"),
        },
        recentForcedAuctions: {
            type: "number",
            decimal: 0,
            label: t("Anzahl der Zwangsversteigerungen in den letzten 24 Monaten in der WEG"),
        },
        maintenanceFeesArrearsInfo: {
            maintenanceFeesArrears: {
                type: "yes-no-radio-group",
                label: t("Gibt es Hausgeldrückstände in der WEG?"),
            },
            maintenanceFeesArrearsUnitCount: {
                type: "number",
                decimal: 0,
                label: t("Wenn ja, wie viele Einheiten sind betroffen?"),
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
            label: t("Besteht eine Gebäudeversicherung für die WEG?"),
        },
        naturalHazardsInsurance: {
            type: "yes-no-radio-group",
            label: t("Besteht eine Elementarschadenversicherung für alle Objekte in der WEG?"),
        },
        legalNotificationBghConfirmed: {
            type: "checkbox",
            label: t("Hiermit wird bestätigt, dass die Eigentümer über die Haftung in Bezug auf das BGH Urteil vom Sep. 2015 aufgeklärt wurden."),
        },
        durationOptions: {
            type: "select" ,
            label: t("Dauer"),
            items: durationOptions,
        },
        financingCaseId: {
            type: "hidden",
        },
    };
};
