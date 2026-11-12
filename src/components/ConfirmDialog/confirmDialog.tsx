"use client";

import React, { useId } from "react";

import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

import Button from "@/components/Button";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep going",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby={titleId} aria-describedby={descriptionId} maxWidth="xs" fullWidth>
      <DialogTitle id={titleId} sx={{ pr: 7 }}>
        {title}
      </DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={onCancel}
        size="small"
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          position: "absolute",
          right: theme.spacing(1.5),
          top: theme.spacing(1.5),
        })}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent>
        <DialogContentText id={descriptionId}>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {/* The safe choice is focused first so an accidental Enter never discards work. */}
        <Button variant="outlined" color="inherit" onClick={onCancel} autoFocus>
          {cancelLabel}
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
