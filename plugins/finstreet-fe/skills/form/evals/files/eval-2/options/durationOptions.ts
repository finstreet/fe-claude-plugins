import { useExtracted } from "next-intl";

export enum DurationOptions {
    UP_TO_2_YEARS = "up_to_2_years",
    UP_TO_3_YEARS = "up_to_3_years",
}

export function useDurationOptions() {
    const t = useExtracted();

    return [
        { label: t("Bis zu 2 Jahre"), value: DurationOptions.UP_TO_2_YEARS },
        { label: t("Bis zu 3 Jahre"), value: DurationOptions.UP_TO_3_YEARS },
    ];
}
