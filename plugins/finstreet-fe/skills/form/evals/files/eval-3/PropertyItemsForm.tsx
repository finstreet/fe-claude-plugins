"use client";

import { Form } from "@/shared/components/form/Form";
import { usePropertyItemsFormConfig } from "./usePropertyItemsFormConfig";
import { PropertyItemsFormFields } from "./PropertyItemsFormFields";
import { PropertyItemsDefaultValues } from "./propertyItemsSchema";

type PropertyItemsFormProps = {
  defaultValues: PropertyItemsDefaultValues;
};

export const PropertyItemsForm = ({
  defaultValues,
}: PropertyItemsFormProps) => {
  const config = usePropertyItemsFormConfig(defaultValues);

  return (
    <Form formConfig={config}>
      <PropertyItemsFormFields fieldNames={config.fieldNames} />
    </Form>
  );
};
