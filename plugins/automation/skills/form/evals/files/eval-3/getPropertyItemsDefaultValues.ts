import { PropertyItemsDefaultValues } from "./propertyItemsSchema";

export function getPropertyItemsDefaultValues({
  financingCaseId,
}: {
  financingCaseId: string;
}): PropertyItemsDefaultValues {
  const defaultValues = {
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    plotArea: undefined,
    constructionYear: undefined,
    unitCount: {
      residential: undefined,
      commercial: undefined,
    },
    financingCaseId,
  } as const satisfies PropertyItemsDefaultValues;

  return {
    ...defaultValues,
  };
}
