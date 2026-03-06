import { DynamicFormField } from "@/shared/components/form/DynamicFormField";
import { VStack } from "@styled-system/jsx";
import { AdditionalInformationType } from "./additionalInformationSchema";
import { FieldNamesType, FormFieldsType } from "@finstreet/forms";
import {
    Fieldset,
    FieldsetLegend,
} from "@finstreet/ui/components/base/Form/Fieldset";
import { useExtracted } from "next-intl";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { YesNoOptions } from "@/shared/components/form/YesNoRadioGroup/options";
import {
    Fields,
    FieldsHStack,
    FieldsHStackItem,
} from "@finstreet/ui/components/pageLayout/Fields";

type AdditionalInformationFormFieldsProps = {
    fieldNames: FieldNamesType<FormFieldsType<AdditionalInformationType>>;
};

export const AdditionalInformationFormFields = ({
                                                    fieldNames,
                                                }: AdditionalInformationFormFieldsProps) => {

    return (
        <Fields>
            <DynamicFormField
                fieldName={
                    fieldNames.propertyManagementExistingLiabilityInsurance
                }
            />
            <DynamicFormField fieldName={fieldNames.propertyManagementTaxId} />
            <DynamicFormField fieldName={fieldNames.recentForcedAuctions} />
            <DynamicFormField
                fieldName={
                    fieldNames.maintenanceFeesArrearsInfo.maintenanceFeesArrears
                }
            />
            <DynamicFormField
                fieldName={
                    fieldNames.maintenanceFeesArrearsInfo
                        .maintenanceFeesArrearsUnitCount
                }
            />
            <DynamicFormField fieldName={fieldNames.buildingInsurance} />
            <DynamicFormField fieldName={fieldNames.durationOptions} />
            <DynamicFormField fieldName={fieldNames.naturalHazardsInsurance} />
            <DynamicFormField
                fieldName={fieldNames.legalNotificationBghConfirmed}
            />
        </Fields>
    );
};
