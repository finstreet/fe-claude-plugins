"use server";

import {
  PropertyItemsFormState,
  PropertyItemsOutputType,
} from "./propertyItemsSchema";

export async function propertyItemsFormAction(
  state: PropertyItemsFormState,
  formData: PropertyItemsOutputType,
): Promise<PropertyItemsFormState> {
  console.log({ state, formData });
  return {
    error: null,
    message: null,
  };
}
