"use client";

import React, { FC, useEffect, useRef } from "react";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { MediaPlayer, MediaProvider, useMediaState, Poster, Track, type MediaPlayerInstance, PlayButton } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import clsx from "clsx";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { VideoPlayerProps } from "./types";
import "./styles.css";

const VideoPlayer: FC<VideoPlayerProps> = ({
  captionsFile,
  className,
  crossOrigin = true,
  height,
  onVideoEnded,
  onWatchThreshold,
  playsInline = true,
  posterAlt,
  posterSrc,
  title,
  videoSrc,
  watchThresholdSeconds = 30,
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

  const accumulatedTimeRef = useRef(0);
  const hasCountedRef = useRef(false);

  useEffect(() => {
    if (!onWatchThreshold || hasCountedRef.current) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        accumulatedTimeRef.current += 1;
        if (accumulatedTimeRef.current >= watchThresholdSeconds) {
          hasCountedRef.current = true;
          onWatchThreshold();
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onWatchThreshold, watchThresholdSeconds]);

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
          {captionsFile && (
            <Track
              src={captionsFile}
              kind="subtitles"
              label="English"
              language="en"
              type={captionsFile.split(".").pop()?.toLowerCase() === "srt" ? "srt" : "vtt"}
              default
            />
          )}
        </MediaProvider>

        {isPaused && (
          <PlayButton className="vds-main-play-button">
            <PlayCircleIcon className="play-icon" />
          </PlayButton>
        )}

        {/* Layouts */}
        <DefaultVideoLayout icons={defaultLayoutIcons} noAudioGain slots={{ playbackMenuLoop: null }} />
      </MediaPlayer>
    </div>
  );
};

export default VideoPlayer;
