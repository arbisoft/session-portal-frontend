import { faker } from "@faker-js/faker";
import type { Meta, StoryObj } from "@storybook/react";

import ReadMore from "./readMore";
import { ReadMoreProps } from "./types";

const meta: Meta<ReadMoreProps> = {
  title: "Components/ReadMore",
  component: ReadMore,
  tags: ["autodocs"],
  argTypes: {
    amountOfWords: {
      control: "number",
      description: "The number of words to show before truncating the text",
    },
    className: {
      control: "text",
      description: "Additional CSS class for the component",
    },
    showLessText: {
      control: "text",
      description: "Text to display for the 'Show Less' button",
    },
    showMoreText: {
      control: "text",
      description: "Text to display for the 'Show More' button",
    },
    text: {
      control: "text",
      description: "The full text to display",
    },
  },
};

export default meta;

type Story = StoryObj<ReadMoreProps>;

export const Default: Story = {
  args: {
    text: faker.lorem.paragraphs(),
    showMoreText: "Show More",
    showLessText: "Show Less",
    amountOfWords: 36,
  },
};

export const CustomAmountOfWords: Story = {
  args: {
    ...Default.args,
    amountOfWords: 20,
  },
};

export const LongText: Story = {
  args: {
    ...Default.args,
    text: faker.lorem.paragraphs(),
  },
};

export const CustomButtonText: Story = {
  args: {
    ...Default.args,
    showMoreText: "Read More",
    showLessText: "Read Less",
  },
};
