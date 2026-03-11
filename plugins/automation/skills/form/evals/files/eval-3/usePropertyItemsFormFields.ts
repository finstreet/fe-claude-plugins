import { FormFieldsType } from "@finstreet/forms";
import { useExtracted } from "next-intl";
import { PropertyItemsType } from "./propertyItemsSchema";

export function usePropertyItemsFormFields(): FormFieldsType<PropertyItemsType> {
  const t = useExtracted();

  return {
    street: {
      type: "input",
      label: t("Straße"),
    },
    houseNumber: {
      type: "input",
      label: t("Hausnummer"),
    },
    postalCode: {
      type: "input",
      label: t("Postleitzahl"),
    },
    city: {
      type: "input",
      label: t("Stadt"),
    },
    plotArea: {
      type: "number",
      label: t("Grundstücksfläche"),
      decimal: 2,
      suffix: "m²",
    },
    constructionYear: {
      type: "number",
      label: t("Baujahr"),
      formatNumber: false,
      decimal: 0,
    },
    unitCount: {
      residential: {
        type: "number",
        label: t("Wohneinheiten"),
        decimal: 0,
      },
      commercial: {
        type: "number",
        label: t("Gewerbeeinheiten"),
        decimal: 0,
      },
    },
    financingCaseId: {
      type: "hidden",
    },
  };
}
