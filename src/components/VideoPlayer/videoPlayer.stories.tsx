import type { Meta, StoryObj } from "@storybook/react";
import VideoPlayer from "./videoPlayer";
import { VideoPlayerProps } from "./types";

const meta: Meta<VideoPlayerProps> = {
  title: "Components/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs"],
  argTypes: {
    crossOrigin: {
      control: {
        type: "select",
        options: [true, "anonymous", "use-credentials", null, undefined],
      },
      description:
        "Defines how the media element handles cross-origin requests, thereby enabling the configuration of the CORS requests for the element's fetched data.",
    },
    height: {
      control: "text",
      description: "The height of the video player (e.g., '300px', '100%')",
    },
    playsInline: {
      control: "boolean",
      description:
        'Whether the video is to be played "inline", that is within the element\'s playback area. Note that setting this to false does not imply that the video will always be played in fullscreen. Depending on the provider, changing this prop may cause the player to completely reset.',
    },
    posterAlt: {
      control: "text",
      description:
        "♿ ARIA: Provides alternative information for a poster image if a user for some reason cannot view it.",
    },
    posterSrc: {
      control: "text",
      description: "The URL of the video poster image",
    },
    title: {
      control: "text",
      description: "The title of the video",
    },
    videoSrc: {
      control: "text",
      description: "The URL of the video source",
    },
    width: {
      control: "text",
      description: "The width of the video player (e.g., '70%', '500px')",
    },
    onVideoEnded: {
      action: "videoEnded",
      description: "Callback function triggered when the video ends",
    },
    className: {
      control: "text",
      description: "Additional CSS class for the video player",
    },
  },
};

export default meta;

// Define the template for the stories
type Story = StoryObj<VideoPlayerProps>;

// Default story
export const Default: Story = {
  args: {
    crossOrigin: true,
    height: "200px",
    playsInline: true,
    width: "70%",
    title: "Sprite Fight",
    videoSrc: "https://files.vidstack.io/sprite-fight/720p.mp4",
    posterSrc: "https://files.vidstack.io/sprite-fight/poster.webp",
    posterAlt:
      "Girl walks into campfire with gnomes surrounding her friend ready for their next meal!",
  },
};

// Story with a custom height and width
export const CustomSize: Story = {
  args: {
    ...Default.args,
    height: "400px",
    width: "90%",
  },
};

// Story with no poster image
export const NoPoster: Story = {
  args: {
    ...Default.args,
    posterSrc: "",
  },
};

// Story with a different video source
export const DifferentVideo: Story = {
  args: {
    ...Default.args,
    videoSrc:
      "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  },
};

// Story with a custom class name
export const CustomClassName: Story = {
  args: {
    ...Default.args,
    className: "custom-player",
  },
};

// Story with an onVideoEnded callback
export const WithVideoEndedCallback: Story = {
  args: {
    ...Default.args,
    onVideoEnded: () => {
      console.log("Video ended!");
    },
  },
};
