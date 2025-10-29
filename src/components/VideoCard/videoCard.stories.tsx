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
    variant: {
      control: "select",
      options: ["normal-card", "related-card", "featured-card", "search-card"],
      description: "The variant of the video card",
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
  thumbnail: faker.image.urlLoremFlickr({ width: 500, height: 500, category: "animals" }),
  title: "Sample Video Title",
  video_duration: "10:30",
  description: "This is a sample video description. It can be a long text that describes the video in detail.",
};

export const NormalCard: Story = {
  args: {
    data: mockVideoData,
    variant: "normal-card",
    width: "315px",
    href: "/videos/sample-video-title",
  },
};

export const RelatedCard: Story = {
  args: {
    ...NormalCard.args,
    variant: "related-card",
    width: "100%",
  },
};

export const FeaturedCard: Story = {
  args: {
    ...NormalCard.args,
    variant: "featured-card",
    width: "100%",
  },
};

export const SearchCard: Story = {
  args: {
    ...NormalCard.args,
    variant: "search-card",
    width: "100%",
  },
};

export const LongTitle: Story = {
  args: {
    ...NormalCard.args,
    data: {
      ...mockVideoData,
      title: "This is a very long video title that should be truncated after two lines",
    },
  },
};

export const NoThumbnail: Story = {
  args: {
    ...NormalCard.args,
    data: {
      ...mockVideoData,
      thumbnail: "",
    },
  },
};

export const CustomClassName: Story = {
  args: {
    ...NormalCard.args,
    className: "custom-video-card",
  },
};

export const VideoPreview: Story = {
  args: {
    ...NormalCard.args,
    data: {
      ...mockVideoData,
      video_file: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  },
};
