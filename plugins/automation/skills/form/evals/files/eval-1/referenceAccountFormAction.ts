"use server";

import { updateReferenceAccount } from "@/shared/backend/models/referenceAccount/server";
import {
  UpdateReferenceAccountFormState,
  UpdateReferenceAccountOutputType,
} from "./referenceAccountFormSchema";
import { routes } from "@/routes";
import { revalidatePath } from "next/cache";
import { handleFormRequestError } from "@/shared/backend/handleFormRequestError";
import { redirect } from "next/navigation";
import { Portal } from "@/shared/types/Portal";

export async function referenceAccountFormAction(
  state: UpdateReferenceAccountFormState,
  formData: UpdateReferenceAccountOutputType,
): Promise<UpdateReferenceAccountFormState> {
  console.log({ state})

  return {
    error: null,
    message: null
  }
}
