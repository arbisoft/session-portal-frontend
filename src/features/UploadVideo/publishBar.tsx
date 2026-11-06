"use client";

import React from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useFormState } from "react-hook-form";

import Button from "@/components/Button";

import { FieldProps } from "./fields";
import { inverseButtonSx } from "./styled";
import { PublishStatus } from "./uploadStatus";

type PublishBarProps = FieldProps & {
  status: PublishStatus;
  isDisabled: boolean;
  isPublishing: boolean;
  isQueued: boolean;
  onCancelQueued: () => void;
};

const PublishBar = ({ control, status, isDisabled, isPublishing, isQueued, onCancelQueued }: PublishBarProps) => {
  const { submitCount, errors } = useFormState({ control });
  const hasFieldErrors = submitCount > 0 && Object.keys(errors).length > 0 && !isQueued && !isPublishing;

  let label = "Publish";
  if (isPublishing) label = "Publishing…";
  else if (isQueued) label = "Queued…";

  const text = hasFieldErrors ? "Fix the highlighted fields to publish." : status.text;
  const isError = hasFieldErrors || status.isError;

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} width="100%" flexWrap="wrap">
      <Typography
        role={isError ? "alert" : "status"}
        color={isError ? "error" : "textPrimary"}
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {text}
        {!hasFieldErrors && status.percent !== undefined && (
          // Visual only: announcing every percent would flood screen readers.
          <span aria-hidden> · {status.percent}%</span>
        )}
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        {isQueued && (
          <Button variant="outlined" onClick={onCancelQueued}>
            Cancel queued publish
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={isDisabled}
          startIcon={isPublishing || isQueued ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={inverseButtonSx}
        >
          {label}
        </Button>
      </Box>
    </Box>
  );
};

export default PublishBar;
