import { faker } from "@faker-js/faker";
import type { Meta, StoryObj } from "@storybook/react";

import { VideoCardProps } from "./types";
import VideoCard from "./videoCard";

const meta: Meta<VideoCardProps> = {
  title: "Components/VideoCard",
  component: VideoCard,
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS class for the video card",
    },
    data: {
      control: "object",
      description: "The video data including title, organizer, event time, thumbnail, and duration",
    },
    onClick: {
      action: "clicked",
      description: "Callback function triggered when the video card is clicked",
    },
    width: {
      control: "text",
      description: "The width of the video card (e.g., '315px', '100%')",
    },
  },
};

export default meta;

type Story = StoryObj<VideoCardProps>;

const mockVideoData = {
  event_time: "2023-10-01 14:30",
  organizer: "Sample Organizer",
  thumbnail: faker.image.urlLoremFlickr(),
  title: "Sample Video Title",
  video_duration: "10:30",
};

export const Default: Story = {
  args: {
    data: mockVideoData,
    width: "315px",
  },
};

export const CustomWidth: Story = {
  args: {
    ...Default.args,
    width: "400px",
  },
};

export const LongTitle: Story = {
  args: {
    ...Default.args,
    data: {
      ...mockVideoData,
      title: "This is a very long video title that should be truncated after two lines",
    },
  },
};

export const NoThumbnail: Story = {
  args: {
    ...Default.args,
    data: {
      ...mockVideoData,
      thumbnail: "",
    },
  },
};

export const CustomClassName: Story = {
  args: {
    ...Default.args,
    className: "custom-video-card",
  },
};
