import { AdditionalInformationDefaultValues } from "@/features/propertyManagement/forms/additionalInformation/additionalInformationSchema";

export function getAdditionalInformationDefaultValues({
                                                          financingCaseId,
                                                      }: {
    financingCaseId: string;
}): AdditionalInformationDefaultValues {
    const defaultValues = {
        financingCaseId,
        propertyManagementExistingLiabilityInsurance: undefined,
        propertyManagementTaxId: "",
        recentForcedAuctions: undefined,
        maintenanceFeesArrearsInfo: {
            maintenanceFeesArrears: undefined,
            maintenanceFeesArrearsUnitCount: undefined,
        },
        buildingInsurance: undefined,
        naturalHazardsInsurance: undefined,
        options: undefined,
        legalNotificationBghConfirmed: undefined,
    } as const satisfies AdditionalInformationDefaultValues;

    return {
        ...defaultValues,
    }
}
