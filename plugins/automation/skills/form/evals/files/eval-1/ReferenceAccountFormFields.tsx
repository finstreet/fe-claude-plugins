import { UpdateReferenceAccountType } from "./referenceAccountFormSchema";
import { FieldNamesType, FormFieldsType } from "@finstreet/forms";
import { DynamicFormField } from "@/shared/components/form/DynamicFormField";
import { Fieldset } from "@finstreet/ui/components/base/Form/Fieldset";
import { Fields } from "@finstreet/ui/components/pageLayout/Fields";

type UpdateReferenceAccountFormFieldsProps = {
  fieldNames: FieldNamesType<FormFieldsType<UpdateReferenceAccountType>>;
};

export const ReferenceAccountFormFields = ({
  fieldNames,
}: UpdateReferenceAccountFormFieldsProps) => {
  return (
      <Fields>
        <DynamicFormField fieldName={fieldNames.bankAccountOwner} />
        <DynamicFormField fieldName={fieldNames.iban} />
      </Fields>
  );
};
