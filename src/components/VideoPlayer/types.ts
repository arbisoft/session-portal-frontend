import { MediaCrossOrigin, MediaKeyTarget } from "@vidstack/react";

export interface VideoPlayerProps {
  captionsFile?: string;
  className?: string;
  controlsDelay?: number;
  crossOrigin?: true | MediaCrossOrigin | null;
  height?: string;
  keyTarget?: MediaKeyTarget;
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
