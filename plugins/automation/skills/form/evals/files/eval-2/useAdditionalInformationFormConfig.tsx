import { createFormFieldNames } from "@finstreet/forms/lib";
import { useTranslations } from "next-intl";
import { Button } from "@finstreet/ui/components/base/Button";
import { HStack } from "@styled-system/jsx";
import { FaArrowLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { additionalInformationFormAction } from "./additionalInformationFormAction";
import {
    additionalInformationSchema,
    AdditionalInformationFormState,
    AdditionalInformationDefaultValues,
    AdditionalInformationFormConfig,
} from "./additionalInformationSchema";
import { useAdditionalInformationFormFields } from "./useAdditionalInformationFormFields";
import { usePortal } from "@/shared/context/portal/portalContext";
import { useConfirmationModal } from "@/shared/components/ConfirmationModal/store";
import { ValidatedSubmitButton } from "@/shared/components/ValidatedSubmitButton/ValidatedSubmitButton";
import { usePortalSpecificHoaLoanOverviewRoute } from "@/shared/hooks/usePortalSpecificHoaLoanOverviewRoute";

export function useAdditionalInformationFormConfig(
    defaultValues: AdditionalInformationDefaultValues,
): AdditionalInformationFormConfig {
    const t = useTranslations("additionalInformation.form");
    const router = useRouter();
    const fields = useAdditionalInformationFormFields();

    return {
        fields,
        defaultValues,
        formId: "additionalInformation",
        schema: additionalInformationSchema,
        fieldNames: createFormFieldNames(fields),
        serverAction: additionalInformationFormAction,
        useErrorAction: () => {
            return (formState: AdditionalInformationFormState) => {
                console.error(formState?.error);
            };
        },
        renderFormActions: (isPending: boolean) => {
            return (
                <HStack mt={12} justifyContent={"space-between"}>
                    <Button
                        type="button"
                        variant="text"
                        icon={<FaArrowLeft />}
                        onClick={() => router.back()}
                    >
                        {t("actions.back")}
                    </Button>
                    <Button
                        loading={isPending}
                        type="submit"
                    >
                        {t("actions.submit")}
                    </Button>
                </HStack>
            );
        },
    };
}
