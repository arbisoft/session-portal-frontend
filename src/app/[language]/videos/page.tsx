import type { Metadata } from "next";

import VideosPage from "@/features/VideosPage";
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
  return <VideosPage />;
}
