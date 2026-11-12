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
  /** Media type of the stream. The URL has no extension, so it cannot be inferred. Defaults to MP4. */
  videoType?: string;
  watchThresholdSeconds?: number;
  width?: string;
}
