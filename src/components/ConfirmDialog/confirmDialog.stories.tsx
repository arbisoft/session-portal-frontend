import { useState } from "react";

import Button from "@mui/material/Button";
import type { Meta, StoryObj } from "@storybook/nextjs";

import ConfirmDialog, { ConfirmDialogProps } from "./confirmDialog";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  parameters: { jest: "confirmDialog.test.tsx" },
};

export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

const DialogDemo = (props: Omit<ConfirmDialogProps, "open" | "onConfirm" | "onCancel">) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <ConfirmDialog {...props} open={open} onConfirm={close} onCancel={close} />
    </>
  );
};

export const Default: Story = {
  render: () => (
    <DialogDemo
      title="Leave this page?"
      description="The details you entered will be lost."
      confirmLabel="Leave page"
      cancelLabel="Stay"
    />
  ),
};

export const DefaultCancelLabel: Story = {
  render: () => (
    <DialogDemo
      title="Discard the unfinished upload?"
      description="The part already sent will be deleted and the video must be uploaded again."
      confirmLabel="Discard upload"
    />
  ),
};
