import type { Meta, StoryObj } from "@storybook/react";

import { VideoCardProps } from "./types";
import VideoCard from "./videoCard";

// Define the metadata for the component
const meta: Meta<VideoCardProps> = {
  title: "Components/RecommendedVideoCard", // Storybook title
  component: VideoCard, // The component itself
  tags: ["autodocs"], // Optional: Enable autodocs for better documentation
  argTypes: {
    // Define controls for the props
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

// Define the template for the stories
type Story = StoryObj<VideoCardProps>;

// Default story
export const Default: Story = {
  args: {
    title: "Sample Video Title",
    organizerName: "Arbisoft",
    date: "2023-10-01",
    imgUrl: "/assets/images/temp-youtube-logo.webp",
  },
};

// Story with a long title
export const LongTitle: Story = {
  args: {
    ...Default.args,
    title: "This is a very long video title that should be truncated",
    width: "315px",
  },
};
