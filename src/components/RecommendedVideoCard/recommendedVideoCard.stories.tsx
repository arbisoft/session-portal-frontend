import type { Meta, StoryObj } from "@storybook/react";

import { DEFAULT_THUMBNAIL } from "@/utils/constants";

import RecommendedVideoCard from "./recommendedVideoCard";
import { RecommendedVideoCardProps } from "./types";

// Define the metadata for the component
const meta: Meta<RecommendedVideoCardProps> = {
  title: "Components/RecommendedVideoCard", // Storybook title
  component: RecommendedVideoCard, // The component itself
  tags: ["autodocs"], // Optional: Enable autodocs for better documentation
  argTypes: {
    // Define controls for the props
    title: {
      control: "text",
      description: "The title of the video",
    },
    date: {
      control: "text",
      description: "The upload date of the video",
    },
    duration: {
      control: "text",
      description: "The duration of the video",
    },
    imgUrl: {
      control: "text",
      description: "The URL of the video thumbnail image",
    },
    width: {
      control: "text",
      description: "The width of the card (e.g., '100%', '300px')",
    },
  },
};

export default meta;

// Define the template for the stories
type Story = StoryObj<RecommendedVideoCardProps>;

// Default story
export const Default: Story = {
  args: {
    title: "Sample Video Title",
    date: "2023-10-01",
    duration: "10:30",
    imgUrl: DEFAULT_THUMBNAIL,
  },
};

// Story with a long title
export const LongTitle: Story = {
  args: {
    ...Default.args,
    title: "This is a very long video title that should be truncated",
    width: "240px",
  },
};
