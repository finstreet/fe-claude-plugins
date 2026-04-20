import { ReferenceAccountDefaultValues } from "./referenceAccountSchema";

export function getReferenceAccountDefaultValues({
                                                   financingCaseId,
                                                 }: {
  financingCaseId: string;
}) {
  const defaultValues = {
    financingCaseId,
    bankAccountOwner: "",
    iban: "",
  } as const satisfies ReferenceAccountDefaultValues;

  return defaultValues;
}
