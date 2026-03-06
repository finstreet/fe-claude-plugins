import { FormFieldsType } from "@finstreet/forms";
import { useExtracted } from "next-intl";
import { UpdateReferenceAccountType } from "./referenceAccountFormSchema";

export function useReferenceAccountFormFields(): FormFieldsType<UpdateReferenceAccountType> {
  const t = useExtracted();

  return {
    financingCaseId: {
      type: "hidden",
    },
    bankAccountOwner: {
      type: "input",
      label: t("Kontoinhaber"),
    },
    iban: {
      type: "input",
      label: t("IBAN"),
    },
  };
}
