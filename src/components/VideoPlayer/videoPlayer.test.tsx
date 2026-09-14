import React, { forwardRef, useImperativeHandle, HTMLAttributes } from "react";

import { sendGTMEvent } from "@next/third-parties/google";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as vidstackModuleOriginal from "@vidstack/react";

import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import { VideoPlayerProps } from "./types";
import VideoPlayer from "./videoPlayer";

jest.mock("@next/third-parties/google", () => ({
  sendGTMEvent: jest.fn(),
}));

jest.mock("next/dynamic", () => () => {
  const MockedComponent = (props: Record<string, unknown>) => {
    return <div {...props} />;
  };
  MockedComponent.displayName = "MockedDynamicComponent";
  return MockedComponent;
});

jest.mock("@mui/icons-material/PlayCircle", () => {
  const MockPlayCircleIcon = (props: Record<string, unknown>) => {
    return <div data-testid="play-circle-icon" {...props} />;
  };
  MockPlayCircleIcon.displayName = "MockPlayCircleIcon";
  return MockPlayCircleIcon;
});

jest.mock("@vidstack/react", () => {
  const mockSubscribe = jest.fn();
  const mockUseMediaState = jest.fn();
  let capturedMediaPlayerProps: Record<string, unknown> = {};

  const mockMediaPlayerInstance = {
    subscribe: mockSubscribe,
    play: jest.fn(),
    pause: jest.fn(),
    currentTime: 0,
    duration: 100,
    paused: true,
    ended: false,
    canPlay: true,
    error: null,
  };

  const MockedMediaPlayer = forwardRef<
    unknown,
    HTMLAttributes<HTMLDivElement> & {
      children?: React.ReactNode;
      className?: string;
      src?: string;
      title?: string;
    }
  >(({ children, className, src, title, ...props }, ref) => {
    useImperativeHandle(ref, () => mockMediaPlayerInstance);
    capturedMediaPlayerProps = props;

    return (
      <div data-testid="media-player" className={className} data-src={src} data-title={title}>
        {children}
      </div>
    );
  });

  MockedMediaPlayer.displayName = "MockedMediaPlayer";

  return {
    MediaPlayer: MockedMediaPlayer,
    MediaProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="media-provider">{children}</div>,
    Poster: ({ src, alt, className }: { src?: string; alt?: string; className?: string }) => (
      <img data-testid="poster" src={src || ""} alt={alt || ""} className={className} />
    ),
    PlayButton: ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
      <button data-testid="play-button" className={className} onClick={onClick}>
        {children}
      </button>
    ),
    useMediaState: mockUseMediaState,
    __mockSubscribe: mockSubscribe,
    __mockUseMediaState: mockUseMediaState,
    __mockMediaPlayerInstance: mockMediaPlayerInstance,
    __getMediaPlayerProps: () => capturedMediaPlayerProps,
  };
});

jest.mock("@vidstack/react/player/layouts/default", () => ({
  DefaultVideoLayout: ({ icons }: { icons: unknown }) => (
    <div data-testid="default-video-layout" data-icons={JSON.stringify(icons)} />
  ),
  defaultLayoutIcons: { play: "play-icon", pause: "pause-icon" },
}));

jest.mock("@vidstack/react/player/styles/default/theme.css", () => ({}));
jest.mock("@vidstack/react/player/styles/default/layouts/video.css", () => ({}));
jest.mock("./styles.css", () => ({}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock HTMLMediaElement methods
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  writable: true,
  value: jest.fn(),
});

describe("VideoPlayer", () => {
  const defaultProps: VideoPlayerProps = {
    videoSrc: "https://example.com/video.mp4",
    title: "Test Video",
    posterSrc: "https://example.com/poster.jpg",
    posterAlt: "Test Poster",
  };

  const vidstackModule = jest.mocked(
    vidstackModuleOriginal as typeof vidstackModuleOriginal & {
      __mockSubscribe: jest.Mock;
      __mockUseMediaState: jest.Mock;
      __getMediaPlayerProps: () => Record<string, unknown>;
    }
  );

  const {
    __mockSubscribe: mockSubscribe,
    __mockUseMediaState: mockUseMediaState,
    __getMediaPlayerProps: getMediaPlayerProps,
  } = jest.mocked(vidstackModule);

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseMediaState.mockReturnValue(true);
    mockSubscribe.mockReturnValue(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the video player with default props", () => {
      render(<VideoPlayer {...defaultProps} />);

      expect(screen.getByTestId("media-player")).toBeInTheDocument();
      expect(screen.getByTestId("media-provider")).toBeInTheDocument();
      expect(screen.getByTestId("poster")).toBeInTheDocument();
      expect(screen.getByTestId("default-video-layout")).toBeInTheDocument();
    });

    it("renders with custom dimensions", () => {
      render(<VideoPlayer {...defaultProps} width="100%" height="500px" />);

      const container = screen.getByTestId("media-player").parentElement;
      expect(container).toHaveStyle({
        width: "100%",
        height: "500px",
      });
    });

    it("renders with custom className", () => {
      render(<VideoPlayer {...defaultProps} className="custom-player" />);

      const mediaPlayer = screen.getByTestId("media-player");
      expect(mediaPlayer).toHaveClass("player custom-player");
    });

    it("renders poster with correct src and alt", () => {
      render(<VideoPlayer {...defaultProps} />);

      const poster = screen.getByTestId("poster");
      expect(poster).toHaveAttribute("src", "https://example.com/poster.jpg");
      expect(poster).toHaveAttribute("alt", "Test Poster");
    });

    it("renders video with correct src and title", () => {
      render(<VideoPlayer {...defaultProps} />);

      const mediaPlayer = screen.getByTestId("media-player");
      expect(mediaPlayer).toHaveAttribute("data-src", "https://example.com/video.mp4");
      expect(mediaPlayer).toHaveAttribute("data-title", "Test Video");
    });
  });

  describe("Play/Pause Functionality", () => {
    it("shows play button when video is paused", () => {
      mockUseMediaState.mockReturnValue(true);

      render(<VideoPlayer {...defaultProps} />);

      expect(screen.getByTestId("play-button")).toBeInTheDocument();
      expect(screen.getByTestId("play-circle-icon")).toBeInTheDocument();
    });

    it("hides play button when video is playing", () => {
      mockUseMediaState.mockReturnValue(false);

      render(<VideoPlayer {...defaultProps} />);

      expect(screen.queryByTestId("play-button")).not.toBeInTheDocument();
    });

    it("handles play button click", () => {
      mockUseMediaState.mockReturnValue(true);

      render(<VideoPlayer {...defaultProps} />);

      const playButton = screen.getByTestId("play-button");
      fireEvent.click(playButton);

      expect(playButton).toBeInTheDocument();
    });
  });

  describe("Video State Management", () => {
    it("subscribes to media state changes on mount", () => {
      render(<VideoPlayer {...defaultProps} />);

      expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it("calls onVideoEnded when video ends", async () => {
      const onVideoEnded = jest.fn();

      render(<VideoPlayer {...defaultProps} onVideoEnded={onVideoEnded} />);

      const subscribeCallback = mockSubscribe.mock.calls[0][0];
      subscribeCallback({ ended: true });

      expect(onVideoEnded).toHaveBeenCalledTimes(1);
    });

    it("does not call onVideoEnded when video has not ended", () => {
      const onVideoEnded = jest.fn();

      render(<VideoPlayer {...defaultProps} onVideoEnded={onVideoEnded} />);

      const subscribeCallback = mockSubscribe.mock.calls[0][0];
      subscribeCallback({ ended: false });

      expect(onVideoEnded).not.toHaveBeenCalled();
    });

    it("does not call onVideoEnded when callback is not provided", () => {
      render(<VideoPlayer {...defaultProps} />);

      const subscribeCallback = mockSubscribe.mock.calls[0][0];

      expect(() => subscribeCallback({ ended: true })).not.toThrow();
    });
  });

  describe("Props Handling", () => {
    it("applies crossOrigin prop correctly", () => {
      render(<VideoPlayer {...defaultProps} crossOrigin={true} />);

      const mediaPlayer = screen.getByTestId("media-player");
      expect(mediaPlayer).toHaveAttribute("data-src", "https://example.com/video.mp4");
    });

    it("uses default width when not provided", () => {
      render(<VideoPlayer {...defaultProps} />);

      const container = screen.getByTestId("media-player").parentElement;
      expect(container).toHaveStyle({ width: "70%" });
    });

    it("handles missing poster props gracefully", () => {
      const propsWithoutPoster = {
        ...defaultProps,
        posterSrc: "",
        posterAlt: "",
      };

      render(<VideoPlayer {...propsWithoutPoster} />);

      const poster = screen.getByTestId("poster");
      expect(poster.getAttribute("src")).toBeNull();
      expect(poster).toHaveAttribute("alt", "");
    });
  });

  describe("useMediaState Hook", () => {
    it("calls useMediaState with correct parameters", () => {
      render(<VideoPlayer {...defaultProps} />);

      expect(mockUseMediaState).toHaveBeenCalledWith("paused", expect.any(Object));
    });

    it("updates play button visibility based on media state", () => {
      // Start with paused state
      mockUseMediaState.mockReturnValue(true);
      const { rerender } = render(<VideoPlayer {...defaultProps} />);

      expect(screen.getByTestId("play-button")).toBeInTheDocument();

      // Change to playing state
      mockUseMediaState.mockReturnValue(false);
      rerender(<VideoPlayer {...defaultProps} />);

      expect(screen.queryByTestId("play-button")).not.toBeInTheDocument();
    });
  });

  describe("Component Lifecycle", () => {
    it("cleans up subscription on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribe.mockReturnValue(unsubscribe);

      const { unmount } = render(<VideoPlayer {...defaultProps} />);

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it("updates subscription when onVideoEnded prop changes", () => {
      const onVideoEnded1 = jest.fn();
      const onVideoEnded2 = jest.fn();

      const { rerender } = render(<VideoPlayer {...defaultProps} onVideoEnded={onVideoEnded1} />);

      expect(mockSubscribe).toHaveBeenCalledTimes(1);

      rerender(<VideoPlayer {...defaultProps} onVideoEnded={onVideoEnded2} />);

      expect(mockSubscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling", () => {
    it("handles missing video source gracefully", () => {
      const propsWithoutSrc = {
        ...defaultProps,
        videoSrc: "",
      };

      expect(() => render(<VideoPlayer {...propsWithoutSrc} />)).not.toThrow();
    });

    it("handles component errors gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const invalidProps = {
        ...defaultProps,
        videoSrc: null as unknown as string,
      };

      expect(() => render(<VideoPlayer {...invalidProps} />)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("includes proper attributes for accessibility", () => {
      render(<VideoPlayer {...defaultProps} />);

      const mediaPlayer = screen.getByTestId("media-player");
      expect(mediaPlayer).toHaveAttribute("data-title", "Test Video");

      const poster = screen.getByTestId("poster");
      expect(poster).toHaveAttribute("alt", "Test Poster");
    });

    it("provides accessible play button", () => {
      mockUseMediaState.mockReturnValue(true);

      render(<VideoPlayer {...defaultProps} />);

      const playButton = screen.getByTestId("play-button");
      expect(playButton).toBeInTheDocument();
      expect(playButton.tagName).toBe("BUTTON");
    });
  });

  describe("Analytics tracking", () => {
    it("should track video_play on play", () => {
      render(<VideoPlayer {...defaultProps} />);
      (getMediaPlayerProps().onPlay as VoidFunction)();

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.VIDEO_PLAY,
        event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
        title: "Test Video",
      });
    });

    it("should track video_pause on pause", () => {
      render(<VideoPlayer {...defaultProps} />);
      (getMediaPlayerProps().onPause as VoidFunction)();

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.VIDEO_PAUSE,
        event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
        title: "Test Video",
      });
    });

    it("should track video_seek with the seeked time on seeked", () => {
      render(<VideoPlayer {...defaultProps} />);
      (getMediaPlayerProps().onSeeked as (time: number) => void)(42);

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.VIDEO_SEEK,
        event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
        title: "Test Video",
        current_time: 42,
      });
    });

    it("should track video_volume_change with volume and muted state", () => {
      render(<VideoPlayer {...defaultProps} />);
      (getMediaPlayerProps().onVolumeChange as (change: { volume: number; muted: boolean }) => void)({
        volume: 0.5,
        muted: false,
      });

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.VIDEO_VOLUME_CHANGE,
        event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
        title: "Test Video",
        volume: 0.5,
        muted: false,
      });
    });

    it("should track video_fullscreen_change with the fullscreen state", () => {
      render(<VideoPlayer {...defaultProps} />);
      (getMediaPlayerProps().onFullscreenChange as (fullscreen: boolean) => void)(true);

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.VIDEO_FULLSCREEN_CHANGE,
        event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
        title: "Test Video",
        fullscreen: true,
      });
    });

    it("should track video_playback_rate_change with the new rate", () => {
      render(<VideoPlayer {...defaultProps} />);
      (getMediaPlayerProps().onRateChange as (rate: number) => void)(1.5);

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.VIDEO_PLAYBACK_RATE_CHANGE,
        event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
        title: "Test Video",
        playback_rate: 1.5,
      });
    });

    it("should track video_play_error with the error message on play failure", () => {
      render(<VideoPlayer {...defaultProps} />);
      (getMediaPlayerProps().onPlayFail as (error: Error) => void)(new Error("playback failed"));

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.VIDEO_PLAY_ERROR,
        event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
        title: "Test Video",
        message: "playback failed",
      });
    });

    it("should track video_complete when the video ends", () => {
      render(<VideoPlayer {...defaultProps} />);
      const subscribeCallback = mockSubscribe.mock.calls[0][0];
      subscribeCallback({ ended: true });

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.VIDEO_COMPLETE,
        event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
        title: "Test Video",
      });
    });

    it("should fall back to posterAlt for the tracked title when title is empty", () => {
      render(<VideoPlayer {...defaultProps} title="" />);
      (getMediaPlayerProps().onPlay as VoidFunction)();

      expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({ title: "Test Poster" }));
    });
  });

  describe("TypeScript Type Safety", () => {
    it("accepts all valid VideoPlayerProps", () => {
      const validProps: VideoPlayerProps = {
        videoSrc: "test.mp4",
        title: "Test Video",
        posterSrc: "poster.jpg",
        posterAlt: "Test Poster",
        className: "custom-class",
        width: "100%",
        height: "400px",
        crossOrigin: true,
        playsInline: true,
        onVideoEnded: jest.fn(),
      };

      expect(() => render(<VideoPlayer {...validProps} />)).not.toThrow();
    });

    it("works with minimal required props", () => {
      const minimalProps: VideoPlayerProps = {
        videoSrc: "test.mp4",
        title: "Test Video",
        posterSrc: "poster.jpg",
        posterAlt: "Poster",
      };

      expect(() => render(<VideoPlayer {...minimalProps} />)).not.toThrow();
    });
  });
});
