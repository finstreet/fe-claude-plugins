import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export function useUnitCountCrossValidation() {
  const { watch, trigger, getValues } = useFormContext();

  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name === "unitCount.residential") {
        if (getValues("unitCount.commercial") != null) {
          trigger("unitCount.commercial");
        }
      }
      if (name === "unitCount.commercial") {
        if (getValues("unitCount.residential") != null) {
          trigger("unitCount.residential");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, trigger, getValues]);
}
