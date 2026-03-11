import { PropertyItemsType } from "./propertyItemsSchema";
import { FieldNamesType, FormFieldsType } from "@finstreet/forms";
import { DynamicFormField } from "@/shared/components/form/DynamicFormField";
import {
  Fields,
  FieldsHStack,
  FieldsHStackItem,
} from "@finstreet/ui/components/pageLayout/Fields";
import { useUnitCountCrossValidation } from "./hooks/useUnitCountCrossValidation";

type PropertyItemsFormFieldsProps = {
  fieldNames: FieldNamesType<FormFieldsType<PropertyItemsType>>;
};

export const PropertyItemsFormFields = ({
  fieldNames,
}: PropertyItemsFormFieldsProps) => {
  useUnitCountCrossValidation();

  return (
    <Fields>
      <FieldsHStack>
        <FieldsHStackItem span={8}>
          <DynamicFormField fieldName={fieldNames.street} />
        </FieldsHStackItem>
        <FieldsHStackItem span={4}>
          <DynamicFormField fieldName={fieldNames.houseNumber} />
        </FieldsHStackItem>
      </FieldsHStack>
      <FieldsHStack>
        <FieldsHStackItem span={4}>
          <DynamicFormField fieldName={fieldNames.postalCode} />
        </FieldsHStackItem>
        <FieldsHStackItem span={8}>
          <DynamicFormField fieldName={fieldNames.city} />
        </FieldsHStackItem>
      </FieldsHStack>
      <DynamicFormField fieldName={fieldNames.plotArea} />
      <DynamicFormField fieldName={fieldNames.constructionYear} />
      <FieldsHStack>
        <FieldsHStackItem span={6}>
          <DynamicFormField fieldName={fieldNames.unitCount.residential} />
        </FieldsHStackItem>
        <FieldsHStackItem span={6}>
          <DynamicFormField fieldName={fieldNames.unitCount.commercial} />
        </FieldsHStackItem>
      </FieldsHStack>
    </Fields>
  );
};
