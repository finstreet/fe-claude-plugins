import { FormFieldsType } from "@finstreet/forms";
import { useTranslations } from "next-intl";
import { UpdateReferenceAccountType } from "./referenceAccountFormSchema";

export function useReferenceAccountFormFields(): FormFieldsType<UpdateReferenceAccountType> {
  const t = useTranslations("referenceAccount.updateReferenceAccountForm");

  return {
    financingCaseId: {
      type: "hidden",
    },
    bankAccountOwner: {
      type: "input",
      label: t("fields.bankAccountOwner.label"),
    },
    iban: {
      type: "input",
      label: t("fields.iban.label"),
    },
  };
}
