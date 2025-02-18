import type { Meta, StoryObj } from "@storybook/react";

import { VideoCardProps } from "./types";
import VideoCard from "./videoCard";

const meta: Meta<VideoCardProps> = {
  title: "Components/RecommendedVideoCard",
  component: VideoCard,
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "The title of the video",
    },
    workstream_id: {
      control: "text",
      description: "The organizer/creator of the video",
    },
    event_time: {
      control: "text",
      description: "The upload date of the video",
    },
    thumbnail: {
      control: "text",
      description: "The URL of the video thumbnail image",
    },
    tags: {
      control: "object",
      description: "The tags available in the video",
    },
    width: {
      control: "text",
      description: "The width of the card (e.g., '100%', '315px')",
    },
  },
};

export default meta;

type Story = StoryObj<VideoCardProps>;

export const Default: Story = {
  args: {
    title: "Sample Video Title",
    workstream_id: "Arbisoft",
    event_time: "2023-10-01",
    thumbnail: "/assets/images/temp-youtube-logo.webp",
    tags: ["Workshop", "Ollama", "AI"],
  },
};

export const LongTitle: Story = {
  args: {
    ...Default.args,
    title: "This is a very long video title that should be truncated",
    width: "315px",
  },
};
