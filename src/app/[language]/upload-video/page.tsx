import type { Metadata } from "next";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import FileUpload from "@/features/UploadVideo/uploadVideo";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "upload-video");

  return {
    title: t("title"),
  };
}

export default function UploadVideo() {
  return (
    <MainLayoutContainer isLeftSidebarVisible={false}>
      <FileUpload />
    </MainLayoutContainer>
  );
}
