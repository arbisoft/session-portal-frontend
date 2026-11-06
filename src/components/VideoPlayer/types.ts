import { MediaCrossOrigin, MediaPlayerProps } from "@vidstack/react";

export interface VideoPlayerProps {
  captionsFile?: string;
  className?: string;
  controlsDelay?: number;
  crossOrigin?: true | MediaCrossOrigin | null;
  height?: string;
  keyTarget?: MediaPlayerProps["keyTarget"];
  onVideoEnded?: VoidFunction;
  onWatchThreshold?: () => void;
  playsInline?: boolean;
  posterAlt: string;
  posterSrc: string;
  title: string;
  videoSrc: string;
  videoType?: "video/mp4" | "video/webm" | "video/ogg";
  watchThresholdSeconds?: number;
  width?: string;
}
