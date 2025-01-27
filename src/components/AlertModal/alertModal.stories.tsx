import type { Meta, StoryObj } from "@storybook/react";

import AlertModal from "./alertModal";
import { AlertModalProps } from "./types";

// Define the metadata for the component
const meta: Meta<AlertModalProps> = {
  title: "Components/AlertModal",
  component: AlertModal, // The component itself
  argTypes: {
    // Define controls for the props
    severity: {
      control: {
        type: "select",
        options: ["success", "info", "warning", "error"],
      },
      description: "The severity of the alert modal, indicating its purpose or importance.",
    },
    horizontal: {
      control: {
        type: "select",
        options: ["center", "left", "right"],
      },
      description: "The horizontal placement of the alert modal.",
    },
    vertical: {
      control: {
        type: "select",
        options: ["bottom", "top"],
      },
      description: "The vertical placement of the alert modal.",
    },
    errorMessage: {
      control: {
        type: "text",
      },
      description: "The message displayed inside the alert modal.",
    },
    handleCloseAlertModal: {
      control: false, // Disable the control as this is a function
      description: "Callback function triggered when the alert modal is closed.",
    },
  },
};

export default meta;

// Define the template for the stories
type Story = StoryObj<AlertModalProps>;

// Default story
export const Default: Story = {
  args: {
    handleCloseAlertModal: () => {},
  },
};

// Story with custom message
export const CustomMessage: Story = {
  args: {
    ...Default.args,
    errorMessage: "This is custom message",
  },
};

// Story with custom severity
export const CustomSeverity: Story = {
  args: {
    ...Default.args,
    errorMessage: "Login succesfully",
    severity: "success",
  },
};

// Story with custom placement
export const CustomPlacement: Story = {
  args: {
    ...Default.args,
    horizontal: "center",
    vertical: "top",
  },
};
