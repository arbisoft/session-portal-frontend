import type { Metadata } from "next";

import VideoDetail from "@/features/VideoDetail";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "common");

  return {
    title: t("video_detail"),
  };
}

export default VideoDetail;
