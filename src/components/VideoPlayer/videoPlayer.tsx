"use client";

import React, { FC, type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  type MediaPlayerInstance,
  type MediaVolumeChange,
  PlayButton,
  type VideoMimeType,
} from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import clsx from "clsx";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

import { VideoPlayerProps } from "./types";
import "./styles.css";

const DEFAULT_CONTROLS_DELAY_MS = 3000;
// The stream URL has no file extension, so vidstack cannot infer the format and needs the MIME type spelled out.
const DEFAULT_VIDEO_TYPE: VideoMimeType = "video/mp4";
// What the backend reports for a stored file, in the spelling vidstack accepts. Anything else falls back to MP4.
const SUPPORTED_VIDEO_TYPES: Record<string, VideoMimeType> = {
  "video/mp4": "video/mp4",
  "video/webm": "video/webm",
  "video/ogg": "video/ogg",
  "video/x-msvideo": "video/avi",
};
// The browser keeps retrying a failing stream (e.g. repeated 503s) without ever raising an error, so a load that has not
// produced a playable frame by now is reported to the user instead of spinning forever.
const STALL_TIMEOUT_MS = 20000;
const STALL_MESSAGE = "The video is taking too long to load.";
const ERROR_MESSAGE = "This video could not be loaded.";
// The settings trigger vidstack gives the root menu (submenu triggers are nested inside it and come later in the DOM).
const OPEN_MENU_TRIGGER_SELECTOR = ".vds-menu-button[aria-expanded='true']";

const VideoPlayer: FC<VideoPlayerProps> = ({
  captionsFile,
  className,
  controlsDelay = DEFAULT_CONTROLS_DELAY_MS,
  crossOrigin = true,
  height,
  keyTarget = "document",
  onVideoEnded,
  onWatchThreshold,
  playsInline = true,
  posterAlt,
  posterSrc,
  title,
  videoSrc,
  videoType,
  watchThresholdSeconds = 30,
  width = "70%",
}) => {
  const player = useRef<MediaPlayerInstance>(null);
  const videoLabel = title || posterAlt;
  const resolvedVideoType = (videoType && SUPPORTED_VIDEO_TYPES[videoType]) || DEFAULT_VIDEO_TYPE;

  // Not useMediaState: it reads player.current during the first render (still null), so it binds to vidstack's static
  // initial store and never sees playback start. The subscription below is created after mount.
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMediaError, setHasMediaError] = useState(false);
  const [hasStalled, setHasStalled] = useState(false);
  // Bumping the key remounts the player, which discards the failed request and starts a fresh load.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Subscribe to state updates.
    return player.current!.subscribe(({ canPlay = true, ended, error = null, paused, waiting = false }) => {
      setIsPaused(paused);
      setHasMediaError(!!error);
      setIsLoading(!error && !canPlay && (!paused || waiting));
      if (ended) {
        trackEvent(GA_EVENTS.VIDEO_COMPLETE, ANALYTICS_CATEGORY.VIDEO_PLAYER, { title: videoLabel });
        if (onVideoEnded) {
          onVideoEnded();
        }
      }
    });
  }, [onVideoEnded, videoLabel, attempt]);

  useEffect(() => {
    if (!isLoading) {
      setHasStalled(false);
      return undefined;
    }
    const timeout = setTimeout(() => {
      setHasStalled(true);
      trackEvent(GA_EVENTS.VIDEO_PLAY_ERROR, ANALYTICS_CATEGORY.VIDEO_PLAYER, { title: videoLabel, message: "load_timeout" });
    }, STALL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isLoading, videoLabel]);

  const hasFailed = hasMediaError || hasStalled;
  const shouldShowPlayButton = isPaused && !isLoading && !hasFailed;

  const handleRetry = () => {
    setHasMediaError(false);
    setHasStalled(false);
    setIsLoading(false);
    setAttempt((previous) => previous + 1);
  };

  // Vidstack closes a menu on Escape only while focus is inside its items; opening it by mouse leaves focus on the trigger.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    const trigger = event.currentTarget.querySelector(OPEN_MENU_TRIGGER_SELECTOR);
    const menuId = trigger?.getAttribute("aria-controls");
    document.getElementById(menuId ?? "")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  };

  const accumulatedTimeRef = useRef(0);
  const hasCountedRef = useRef(false);

  useEffect(() => {
    if (!onWatchThreshold || isPaused || hasCountedRef.current) return;

    const interval = setInterval(() => {
      accumulatedTimeRef.current += 1;
      if (accumulatedTimeRef.current >= watchThresholdSeconds) {
        hasCountedRef.current = true;
        trackEvent(GA_EVENTS.VIDEO_WATCH_THRESHOLD, ANALYTICS_CATEGORY.VIDEO_PLAYER, {
          title: videoLabel,
          threshold_seconds: watchThresholdSeconds,
        });
        onWatchThreshold();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onWatchThreshold, videoLabel, watchThresholdSeconds]);

  return (
    <div style={{ width, height }} onKeyDown={handleKeyDown}>
      <MediaPlayer
        key={attempt}
        autoPlay={attempt > 0}
        className={clsx("player", className)}
        controlsDelay={controlsDelay}
        keyTarget={keyTarget}
        crossOrigin={crossOrigin}
        playsInline={playsInline}
        ref={player}
        src={videoSrc ? { src: videoSrc, type: resolvedVideoType } : videoSrc}
        title={title}
        onPlay={() => trackEvent(GA_EVENTS.VIDEO_PLAY, ANALYTICS_CATEGORY.VIDEO_PLAYER, { title: videoLabel })}
        onPause={() => trackEvent(GA_EVENTS.VIDEO_PAUSE, ANALYTICS_CATEGORY.VIDEO_PLAYER, { title: videoLabel })}
        onSeeked={(currentTime: number) =>
          trackEvent(GA_EVENTS.VIDEO_SEEK, ANALYTICS_CATEGORY.VIDEO_PLAYER, { title: videoLabel, current_time: currentTime })
        }
        onVolumeChange={(volumeChange: MediaVolumeChange) =>
          trackEvent(GA_EVENTS.VIDEO_VOLUME_CHANGE, ANALYTICS_CATEGORY.VIDEO_PLAYER, {
            title: videoLabel,
            volume: volumeChange.volume,
            muted: volumeChange.muted,
          })
        }
        onFullscreenChange={(fullscreen: boolean) =>
          trackEvent(GA_EVENTS.VIDEO_FULLSCREEN_CHANGE, ANALYTICS_CATEGORY.VIDEO_PLAYER, { title: videoLabel, fullscreen })
        }
        onRateChange={(playbackRate: number) =>
          trackEvent(GA_EVENTS.VIDEO_PLAYBACK_RATE_CHANGE, ANALYTICS_CATEGORY.VIDEO_PLAYER, {
            title: videoLabel,
            playback_rate: playbackRate,
          })
        }
        onPlayFail={(error: Error) =>
          trackEvent(GA_EVENTS.VIDEO_PLAY_ERROR, ANALYTICS_CATEGORY.VIDEO_PLAYER, { title: videoLabel, message: error.message })
        }
      >
        <MediaProvider>
          <Poster className="vds-poster" src={posterSrc} alt={posterAlt} />
          {captionsFile && (
            <Track
              src={captionsFile}
              kind="subtitles"
              label="English"
              language="en"
              type={captionsFile.split(/[?#]/)[0].toLowerCase().endsWith(".srt") ? "srt" : "vtt"}
              default
            />
          )}
        </MediaProvider>

        {isLoading && !hasFailed && (
          <div className="player-status" role="status" aria-live="polite">
            <CircularProgress size={48} aria-label="Loading video" />
          </div>
        )}

        {hasFailed && (
          <div className="player-status player-status--error" role="alert">
            <p>{hasMediaError ? ERROR_MESSAGE : STALL_MESSAGE}</p>
            <Button variant="contained" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}

        {shouldShowPlayButton && (
          <PlayButton className="vds-main-play-button">
            <PlayCircleIcon className="play-icon" />
          </PlayButton>
        )}

        {/* Layouts */}
        {/* noModal keeps menus next to their icon inside the player; the small-layout default is a sheet portaled to <body> */}
        <DefaultVideoLayout icons={defaultLayoutIcons} noAudioGain noModal />
      </MediaPlayer>
    </div>
  );
};

export default VideoPlayer;
