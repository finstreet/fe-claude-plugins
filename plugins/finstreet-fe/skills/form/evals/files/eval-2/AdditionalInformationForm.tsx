"use client";

import { useAdditionalInformationFormConfig } from "@/features/propertyManagement/forms/additionalInformation/useAdditionalInformationFormConfig";
import { Form } from "@/shared/components/form/Form";
import { AdditionalInformationFormFields } from "@/features/propertyManagement/forms/additionalInformation/AdditionalInformationFormFields";
import { AdditionalInformationDefaultValues } from "@/features/propertyManagement/forms/additionalInformation/additionalInformationSchema";
import { ConfirmationModal } from "@/shared/components/ConfirmationModal/modal";

type AdditionalInformationFormProps = {
    defaultValues: AdditionalInformationDefaultValues;
};

export const AdditionalInformationForm = ({
                                              defaultValues,
                                          }: AdditionalInformationFormProps) => {
    const config = useAdditionalInformationFormConfig(
        defaultValues,
    );

    return (
        <Form formConfig={config}>
            <AdditionalInformationFormFields
                fieldNames={config.fieldNames}
            />
            <ConfirmationModal formId={config.formId!} />
        </Form>
    );
};
