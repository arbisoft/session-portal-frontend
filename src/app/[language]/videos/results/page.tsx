import type { Metadata } from "next";

import SearchResultsPage from "@/features/SearchResultsPage";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "videos");

  return {
    title: t("search_title"),
  };
}

export default function Results() {
  return <SearchResultsPage />;
}
