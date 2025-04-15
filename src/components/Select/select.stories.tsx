import { Meta, StoryFn } from "@storybook/react";

import Select from "./select";
import { SelectProps } from "./types";

export default {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { jest: "select.test.tsx" },
} as Meta;

export const Default: StoryFn<SelectProps> = (args) => <Select {...args} />;
Default.args = {
  label: "Sort By",
  menuItems: [
    { value: "Newest", label: "Newest" },
    { value: "Oldest", label: "Oldest" },
  ],
  value: "",
};

export const DisabledState: StoryFn<SelectProps> = (args) => <Select {...args} />;
DisabledState.args = {
  label: "Sort By",
  menuItems: [
    { value: "Newest", label: "Newest" },
    { value: "Oldest", label: "Oldest" },
  ],
  value: "",
  disabled: true,
};

export const CustomValue: StoryFn<SelectProps> = (args) => <Select {...args} />;
CustomValue.args = {
  label: "Sort By",
  menuItems: [
    { value: "Newest", label: "Newest" },
    { value: "Oldest", label: "Oldest" },
    { value: "Most Popular", label: "Most Popular" },
  ],
  value: "Newest",
};
