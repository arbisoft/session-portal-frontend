import type { Meta, StoryObj } from "@storybook/nextjs";

import Navbar from "./navbar";

const meta: Meta<typeof Navbar> = {
  title: "Components/Navbar",
  component: Navbar,
};

export default meta;

type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};
