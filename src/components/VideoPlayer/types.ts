import { MediaCrossOrigin } from "@vidstack/react";

export interface VideoPlayerProps {
  className?: string;
  crossOrigin?: true | MediaCrossOrigin | null;
  height?: string;
  onVideoEnded?: VoidFunction;
  playsInline?: boolean;
  posterAlt: string;
  posterSrc: string;
  title: string;
  videoSrc: string;
  width?: string;
}
