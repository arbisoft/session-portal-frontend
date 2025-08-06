import type { Metadata } from "next";

import VideoDetail from "@/features/VideoDetail";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sessions Portal",
  };
}

export default VideoDetail;
