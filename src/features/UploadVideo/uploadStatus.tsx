"use client";

import React, { useState } from "react";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useUploadRate } from "@/hooks/useUploadRate";
import { UploadPhase } from "@/services/resumableUpload/types";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { formatBytes, formatRate, formatTimeLeft } from "@/utils/upload";

export type UploadUi = {
  phase: UploadPhase;
  /** Why the transfer is waiting or interrupted, when it is. */
  notice: string | null;
  percent: number;
  /** Message for a failed upload; null otherwise. */
  error: string | null;
  /** A transfer is in progress, including paused and interrupted ones. */
  isActive: boolean;
  videoAssetId: number | null;
  canPause: boolean;
  canResume: boolean;
  canCancel: boolean;
  onPause: () => void;
  onResume: () => void;
  /** Stops the upload and returns to the file picker. Form details are kept. */
  onCancel: () => void;
};

type PublishStatusInput = {
  hasFile: boolean;
  isQueued: boolean;
  isPublishing: boolean;
  upload: UploadUi;
};

export type PublishStatus = { text: string; percent?: number; isError?: boolean };

/** The one live-region message next to the Publish button: what is happening and why Publish is (not) available. */
export const getPublishStatus = ({ hasFile, isQueued, isPublishing, upload }: PublishStatusInput): PublishStatus => {
  const { phase, notice, percent, videoAssetId } = upload;
  if (!hasFile) return { text: "Select a video to publish." };
  if (isPublishing) return { text: "Publishing…" };
  if (phase === "failed") return { text: "Upload failed. Choose another video to publish.", isError: true };
  if (isQueued) {
    const isWaiting = phase === "paused" || phase === "interrupted";
    return {
      text: isWaiting
        ? "Waiting for the upload to continue, then it will publish automatically."
        : "Will publish automatically when the upload finishes.",
    };
  }
  if (phase === "interrupted") return { text: notice ?? "Connection problem." };
  if (phase === "paused") return { text: "Upload paused." };
  if (phase === "finalizing") return { text: "Processing video…" };
  if (videoAssetId) return { text: "Video uploaded." };
  if (upload.isActive) return { text: "Uploading video…", percent };
  return { text: "Preparing upload…" };
};

const progressTitle = (phase: UploadPhase) => {
  switch (phase) {
    case "creating":
      return "Preparing upload…";
    case "finalizing":
      return "Processing video…";
    case "paused":
      return "Upload paused";
    case "interrupted":
      return "Upload interrupted";
    case "failed":
      return "Upload failed";
    case "completed":
      return "Upload complete";
    default:
      return "Uploading video…";
  }
};

type PanelProps = { file: File; upload: UploadUi };

export const UploadStatusPanel = ({ file, upload }: PanelProps) => {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const { phase, percent, error } = upload;
  const bytesPerSecond = useUploadRate(percent, file.size, phase === "uploading");

  const isIndeterminate = phase === "creating" || phase === "finalizing";
  const isFailed = phase === "failed";
  const isComplete = phase === "completed";
  const showProgress = upload.isActive || isFailed;
  const canRemove = upload.canCancel || isComplete || isFailed;
  const needsConfirmation = !isFailed;

  const sentBytes = Math.floor((file.size * percent) / 100);
  const remainingSeconds = bytesPerSecond ? (file.size - sentBytes) / bytesPerSecond : null;
  const details = [
    `${percent}%`,
    `${formatBytes(sentBytes)} of ${formatBytes(file.size)}`,
    bytesPerSecond ? formatRate(bytesPerSecond) : null,
    remainingSeconds !== null ? formatTimeLeft(remainingSeconds) : null,
  ].filter(Boolean);

  const handleRemove = () => {
    setConfirmingRemove(false);
    upload.onCancel();
  };

  // Confirming is already reported by UPLOAD_VIDEO_CANCELLED (the manager emits it for every removal), so only the
  // declined and the no-confirmation paths are tracked here.
  const handleKeep = () => {
    setConfirmingRemove(false);
    trackEvent(GA_EVENTS.UPLOAD_CONFIRM_DECLINED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, {
      dialog: upload.canCancel ? "cancel_upload" : "remove_video",
    });
  };

  const handleChooseAnother = () => {
    trackEvent(GA_EVENTS.UPLOAD_CHOOSE_ANOTHER_CLICK, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
    handleRemove();
  };

  const removeLabel = upload.canCancel ? "Cancel upload" : "Remove video";

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.background.default,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
      })}
    >
      <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
        {isComplete && <CheckCircleOutlineIcon aria-hidden color="success" />}
        <Box minWidth={0}>
          <Typography noWrap title={file.name}>
            {file.name}
          </Typography>
          <Typography variant="bodySmall" color="textSecondary">
            {formatBytes(file.size)}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="bodySmall" color={isFailed ? "error" : "textPrimary"}>
          {progressTitle(phase)}
        </Typography>
        {showProgress && (
          <LinearProgress
            aria-label="Video upload progress"
            variant={isIndeterminate ? "indeterminate" : "determinate"}
            value={percent}
            color={isFailed ? "error" : "inherit"}
          />
        )}
        {upload.isActive && !isIndeterminate && (
          <Typography variant="bodySmall" color="textSecondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
            {details.join(" · ")}
          </Typography>
        )}
        {phase === "interrupted" && (
          <Typography variant="bodySmall" color="textSecondary">
            {upload.notice ?? "Connection problem."}
          </Typography>
        )}
        {isFailed && error && (
          <Typography variant="bodySmall" color="error">
            {error}
          </Typography>
        )}
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap">
        {upload.canPause && (
          <Button size="small" variant="outlined" onClick={upload.onPause}>
            Pause
          </Button>
        )}
        {upload.canResume && (
          <Button size="small" variant="outlined" onClick={upload.onResume}>
            {phase === "paused" ? "Resume" : "Retry now"}
          </Button>
        )}
        {canRemove && (
          <Button
            size="small"
            variant="outlined"
            onClick={needsConfirmation ? () => setConfirmingRemove(true) : handleChooseAnother}
          >
            {isFailed ? "Choose another video" : removeLabel}
          </Button>
        )}
      </Box>

      <ConfirmDialog
        open={confirmingRemove}
        title={upload.canCancel ? "Cancel this upload?" : "Remove this video?"}
        description={
          upload.canCancel
            ? "The upload will stop and what was sent so far will be discarded. The details you filled in are kept."
            : "The uploaded video will be removed and you will need to choose a video again. The details you filled in are kept."
        }
        confirmLabel={upload.canCancel ? "Cancel upload" : "Remove video"}
        cancelLabel={upload.canCancel ? "Keep uploading" : "Keep video"}
        onConfirm={handleRemove}
        onCancel={handleKeep}
      />
    </Box>
  );
};
