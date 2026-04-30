import { MediaCrossOrigin } from "@vidstack/react";

export interface VideoPlayerProps {
  captionsFile?: string;
  className?: string;
  crossOrigin?: true | MediaCrossOrigin | null;
  height?: string;
  onVideoEnded?: VoidFunction;
  onWatchThreshold?: () => void;
  playsInline?: boolean;
  posterAlt: string;
  posterSrc: string;
  title: string;
  videoSrc: string;
  watchThresholdSeconds?: number;
  width?: string;
}
