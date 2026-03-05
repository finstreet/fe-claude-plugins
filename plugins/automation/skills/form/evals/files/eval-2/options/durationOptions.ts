import { useTranslations } from "next-intl";

export enum DurationOptions {
    UP_TO_2_YEARS = "up_to_2_years",
    UP_TO_3_YEARS = "up_to_3_years",
}

export function useDurationOptions() {
    const t = useTranslations(
        "durations",
    );

    return Object.values(DurationOptions).map((duration) => ({
        label: t(duration),
        value: duration,
    }));
}
