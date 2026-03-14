import { ListLoading } from "@/shared/components/ListLoading";
import { getTranslations } from "next-intl/server";

export default async function AdminMembersLoading() {
  const t = await getTranslations("members");
  return <ListLoading title={t("title")} />;
}
