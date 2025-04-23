import type { Metadata } from "next";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import FileUpload from "@/features/UploadVideo/uploadVideo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Upload a video - Sessions Portal",
  };
}

export default function UploadVideo() {
  return (
    <MainLayoutContainer isLeftSidebarVisible={false}>
      <FileUpload />
    </MainLayoutContainer>
  );
}
