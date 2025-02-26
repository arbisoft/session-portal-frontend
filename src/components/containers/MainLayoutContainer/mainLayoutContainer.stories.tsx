import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react";

import MainLayoutContainer from "./mainLayoutContainer";

const meta: Meta<typeof MainLayoutContainer> = {
  title: "Layouts/MainLayoutContainer",
  component: MainLayoutContainer,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "The main content of the layout",
    },
    rightSidebar: {
      control: "object",
      description: "Optional right sidebar content",
    },
  },
};

export default meta;

type Story = StoryObj<typeof MainLayoutContainer>;

export const Default: Story = {
  args: {
    children: (
      <Box>
        <Typography variant="h4">Main Content</Typography>
        <Typography>This is the main content area. You can add any content here, such as text, images, or components.</Typography>
      </Box>
    ),
  },
};

export const WithRightSidebar: Story = {
  args: {
    ...Default.args,
    rightSidebar: (
      <Box>
        <Typography variant="h6">Right Sidebar</Typography>
        <Typography>This is the right sidebar content. It can include additional information, links, or widgets.</Typography>
      </Box>
    ),
  },
};

export const NoSidebar: Story = {
  args: {
    ...Default.args,
    rightSidebar: null,
  },
};
