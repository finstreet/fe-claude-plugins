import { createFormFieldNames } from "@finstreet/forms/lib";
import { useExtracted } from "next-intl";
import { Button } from "@finstreet/ui/components/base/Button";
import { HStack } from "@styled-system/jsx";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { propertyItemsFormAction } from "./propertyItemsFormAction";
import {
  propertyItemsSchema,
  PropertyItemsFormState,
  PropertyItemsType,
  PropertyItemsOutputType,
  PropertyItemsDefaultValues,
  PropertyItemsFormConfig,
} from "./propertyItemsSchema";
import { usePropertyItemsFormFields } from "./usePropertyItemsFormFields";

export function usePropertyItemsFormConfig(
  defaultValues: PropertyItemsDefaultValues,
): PropertyItemsFormConfig {
  const t = useExtracted();
  const fields = usePropertyItemsFormFields();
  const router = useRouter();

  return {
    fields,
    defaultValues,
    schema: propertyItemsSchema,
    fieldNames: createFormFieldNames(fields),
    serverAction: propertyItemsFormAction,
    useErrorAction: () => {
      return (formState: PropertyItemsFormState) => {
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
            {t("Zurück")}
          </Button>
          <Button loading={isPending} type="submit" icon={<FaArrowRight />}>
            {t("Speichern")}
          </Button>
        </HStack>
      );
    },
  };
}
