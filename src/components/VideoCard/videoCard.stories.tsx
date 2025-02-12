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
    organizerName: {
      control: "text",
      description: "The organizer/creator of the video",
    },
    date: {
      control: "text",
      description: "The upload date of the video",
    },
    imgUrl: {
      control: "text",
      description: "The URL of the video thumbnail image",
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
    organizerName: "Arbisoft",
    date: "2023-10-01",
    imgUrl: "/assets/images/temp-youtube-logo.webp",
  },
};

export const LongTitle: Story = {
  args: {
    ...Default.args,
    title: "This is a very long video title that should be truncated",
    width: "315px",
  },
};
