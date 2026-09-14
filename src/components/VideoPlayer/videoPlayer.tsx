"use client";

import React, { FC, useEffect, useRef } from "react";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import {
  MediaPlayer,
  MediaProvider,
  useMediaState,
  Poster,
  type MediaPlayerInstance,
  type MediaVolumeChange,
  PlayButton,
} from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import clsx from "clsx";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

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
  const videoLabel = title || posterAlt;

  useEffect(() => {
    // Subscribe to state updates.
    return player.current!.subscribe(({ ended }) => {
      if (ended) {
        trackEvent(GA_EVENTS.VIDEO_COMPLETE, ANALYTICS_CATEGORY.VIDEO_PLAYER, { title: videoLabel });
        if (onVideoEnded) {
          onVideoEnded();
        }
      }
    });
  }, [onVideoEnded, videoLabel]);

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
