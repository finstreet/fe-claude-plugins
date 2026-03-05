import { FormConfig } from "@finstreet/forms";
import { createFormFieldNames } from "@finstreet/forms/lib";
import { useTranslations } from "next-intl";
import { Button } from "@finstreet/ui/components/base/Button";
import { HStack } from "@styled-system/jsx";
import { referenceAccountFormAction } from "./referenceAccountFormAction";
import {
  referenceAccountFormSchema,
  UpdateReferenceAccountFormState,
  UpdateReferenceAccountOutputType,
  UpdateReferenceAccountType,
  UpdateReferenceAccountDefaultValues,
} from "./referenceAccountFormSchema";
import { useReferenceAccountFormFields } from "./useReferenceAccountFormFields";
import { useRouter } from "next/navigation";
import { Portal } from "@/shared/types/Portal";
import { dataTestIds } from "e2e/data/dataTestIds";

export function useReferenceAccountFormConfig(
  defaultValues: UpdateReferenceAccountDefaultValues
): FormConfig<
  UpdateReferenceAccountFormState,
  UpdateReferenceAccountType,
  UpdateReferenceAccountOutputType
> {
  const t = useTranslations("referenceAccount.updateReferenceAccountForm");
  const router = useRouter();
  const fields = useReferenceAccountFormFields();

  return {
    fields,
    defaultValues,
    schema: referenceAccountFormSchema,
    fieldNames: createFormFieldNames(fields),
    serverAction: referenceAccountFormAction,
    useErrorAction: () => {
      return (formState: UpdateReferenceAccountFormState) => {
        console.error(formState?.error);
      };
    },
    renderFormActions: (isPending: boolean) => {
      return (
        <HStack mt={12} justifyContent={"space-between"}>
          <Button
            type="button"
            onClick={() => {
              router.back();
            }}
          >
            {t("actions.cancel")}
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
