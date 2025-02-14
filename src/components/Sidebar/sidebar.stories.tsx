import type { Meta, StoryObj } from "@storybook/react";

import Sidebar from "./sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  argTypes: {
    handleSidebarToggle: {
      action: "sidebarToggled",
      description: "Callback function triggered when a sidebar item is clicked",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {},
};
