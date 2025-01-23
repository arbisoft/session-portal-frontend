import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import HomePage from "@/features/HomePage";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "home");

  return {
    title: t("title"),
  };
}

export default async function Home({ params }: Props) {
  const { t } = await getServerTranslation(params.language, "home");

  return <HomePage description={t("description")} />;
}
