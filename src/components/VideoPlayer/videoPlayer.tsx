"use client";

import React, { FC, useEffect, useRef } from "react";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { MediaPlayer, MediaProvider, useMediaState, Poster, type MediaPlayerInstance, PlayButton } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import clsx from "clsx";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { VideoPlayerProps } from "./types";
import "./styles.css";

const VideoPlayer: FC<VideoPlayerProps> = ({
  className,
  crossOrigin = true,
  height,
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

  const isPaused = useMediaState("paused", player);

  return (
    <div style={{ width, height }}>
      <MediaPlayer
        className={clsx("player", className)}
        crossOrigin={crossOrigin}
        playsInline={playsInline}
        ref={player}
        src={videoSrc}
        title={title}
      >
        <MediaProvider>
          <Poster className="vds-poster" src={posterSrc} alt={posterAlt} />
        </MediaProvider>

        {isPaused && (
          <PlayButton className="vds-main-play-button">
            <PlayCircleIcon className="play-icon" />
          </PlayButton>
        )}

        {/* Layouts */}
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
};

export default VideoPlayer;
