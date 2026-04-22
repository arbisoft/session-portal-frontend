import type { Metadata } from "next";
import dynamic from "next/dynamic";

const VideoDetail = dynamic(() => import("@/features/VideoDetail"));

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sessions Portal",
  };
}

export default VideoDetail;
