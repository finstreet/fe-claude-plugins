"use server";

import {
    AdditionalInformationFormState,
    AdditionalInformationOutputType,
} from "@/features/propertyManagement/forms/additionalInformation/additionalInformationSchema";
import { handleFormRequestError } from "@/shared/backend/handleFormRequestError";
import { putAdditionalInformation } from "@/shared/backend/models/additionalInformation/server";
import { Portal } from "@/shared/types/Portal";
import { revalidatePath } from "next/cache";
import { getPortalSpecificHoaLoanOverviewRoute } from "@/shared/functions/getPortalSpecificHoaLoanOverviewRoute";

export async function additionalInformationFormAction(
    state: AdditionalInformationFormState,
    formData: AdditionalInformationOutputType,
): Promise<AdditionalInformationFormState> {
    console.log({ state, formData });

    return {
        error: null,
        message: null
    }
}
