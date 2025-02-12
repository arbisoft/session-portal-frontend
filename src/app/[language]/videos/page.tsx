import type { Metadata } from "next";

import VideosListingPage from "@/features/VideosListingPage";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "videos");

  return {
    title: t("title"),
  };
}

export default function Videos() {
  return <VideosListingPage />;
}
