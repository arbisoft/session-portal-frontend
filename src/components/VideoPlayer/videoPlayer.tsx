"use client";

import React, { FC } from "react";
import { useEffect, useRef } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { Poster, type MediaPlayerInstance } from "@vidstack/react";

import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { VideoPlayerProps } from "./types";
import "./styles.css";

const VideoPlayer: FC<VideoPlayerProps> = ({
  className,
  crossOrigin = true,
  height = "300px",
  onVideoEnded,
  playsInline = true,
  posterAlt,
  posterSrc,
  title,
  videoSrc,
  width = "70%",
}) => {
  const player = useRef<MediaPlayerInstance>(null);

  useEffect(() => {
    // Subscribe to state updates.
    return player.current!.subscribe(({ ended }) => {
      if (onVideoEnded && ended) {
        onVideoEnded();
      }
    });
  }, [onVideoEnded]);

  return (
    <div style={{ width, height }}>
      <MediaPlayer
        className={["player", className ?? ""].join()}
        crossOrigin={crossOrigin}
        playsInline={playsInline}
        ref={player}
        src={videoSrc}
        title={title}
      >
        <MediaProvider>
          <Poster className="vds-poster" src={posterSrc} alt={posterAlt} />
        </MediaProvider>

        {/* Layouts */}
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
};

export default VideoPlayer;
