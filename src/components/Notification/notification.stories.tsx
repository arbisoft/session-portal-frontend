/* eslint-disable no-restricted-syntax */
import { FC } from "react";

import Button from "@mui/material/Button";
import { SnackbarOrigin } from "@mui/material/Snackbar";
import type { Meta, StoryObj } from "@storybook/react";

import { NotificationProvider, useNotification } from "./notification";

const meta: Meta<typeof NotificationProvider> = {
  title: "Components/Notification",
  component: NotificationProvider,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof NotificationProvider>;

const NotificationDemo: FC<{ vertical?: SnackbarOrigin["vertical"]; horizontal?: SnackbarOrigin["horizontal"] }> = ({
  vertical = "top",
  horizontal = "right",
}) => {
  const { dispatch } = useNotification();

  const showNotification = (severity: "success" | "error" | "warning" | "info") => {
    dispatch({
      type: "SHOW_NOTIFICATION",
      payload: {
        message: `This is a ${severity} message!`,
        severity,
        vertical,
        horizontal,
      },
    });
  };

  return (
    <div>
      <Button variant="contained" color="success" onClick={() => showNotification("success")} sx={{ margin: 1 }}>
        Show Success
      </Button>
      <Button variant="contained" color="error" onClick={() => showNotification("error")} sx={{ margin: 1 }}>
        Show Error
      </Button>
      <Button variant="contained" color="warning" onClick={() => showNotification("warning")} sx={{ margin: 1 }}>
        Show Warning
      </Button>
      <Button variant="contained" color="info" onClick={() => showNotification("info")} sx={{ margin: 1 }}>
        Show Info
      </Button>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <NotificationProvider>
      <NotificationDemo />
    </NotificationProvider>
  ),
};

export const CustomPosition: Story = {
  render: () => (
    <NotificationProvider>
      <NotificationDemo vertical="bottom" horizontal="left" />
    </NotificationProvider>
  ),
};
