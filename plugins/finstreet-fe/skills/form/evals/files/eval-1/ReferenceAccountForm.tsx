"use client";

import { Form } from "@/shared/components/form/Form";
import { useReferenceAccountFormConfig } from "./useReferenceAccountFormConfig";
import { ReferenceAccountFormFields } from "./ReferenceAccountFormFields";
import { UpdateReferenceAccountDefaultValues } from "./referenceAccountFormSchema";

type UpdateReferenceAccountFormProps = {
  defaultValues: UpdateReferenceAccountDefaultValues;
};

export const ReferenceAccountForm = ({
  defaultValues,
}: UpdateReferenceAccountFormProps) => {
  const config = useReferenceAccountFormConfig(
    defaultValues
  );

  return (
    <Form formConfig={config}>
      <ReferenceAccountFormFields
        fieldNames={config.fieldNames}
      />
    </Form>
  );
};
