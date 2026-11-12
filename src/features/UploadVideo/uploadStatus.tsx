"use client";

import React, { useEffect, useState } from "react";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
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
  /** Bytes sent so far, finer than `percent`. Derived from `percent` when absent. */
  sentBytes?: number;
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

const CANCEL_UPLOAD_COPY = {
  action: "Cancel upload",
  title: "Cancel this upload?",
  description: "The upload will stop and what was sent so far will be discarded. The details you filled in are kept.",
  keep: "Keep uploading",
  analyticsDialog: "cancel_upload",
};

const REMOVE_VIDEO_COPY = {
  action: "Remove video",
  title: "Remove this video?",
  description:
    "The uploaded video will be removed and you will need to choose a video again. The details you filled in are kept.",
  keep: "Keep video",
  analyticsDialog: "remove_video",
};

type DetailsInput = { percent: number; sentBytes: number; totalBytes: number; bytesPerSecond: number | null };

const getUploadDetails = ({ percent, sentBytes, totalBytes, bytesPerSecond }: DetailsInput) => {
  const parts = [`${percent}%`, `${formatBytes(sentBytes)} of ${formatBytes(totalBytes)}`];
  if (bytesPerSecond) {
    parts.push(formatRate(bytesPerSecond), formatTimeLeft((totalBytes - sentBytes) / bytesPerSecond));
  }
  return parts.join(" · ");
};

type ProgressProps = { upload: UploadUi; details: string };

const UploadProgress = ({ upload, details }: ProgressProps) => {
  const { phase, percent, error } = upload;
  const isIndeterminate = phase === "creating" || phase === "finalizing";
  const isFailed = phase === "failed";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="bodySmall" color={isFailed ? "error" : "textPrimary"}>
        {progressTitle(phase)}
      </Typography>
      {(upload.isActive || isFailed) && (
        <LinearProgress
          // The two variants animate differently; switching one element between them makes the bar sweep back
          // from wherever the indeterminate animation was, so each variant gets its own element.
          key={isIndeterminate ? "indeterminate" : "determinate"}
          aria-label="Video upload progress"
          variant={isIndeterminate ? "indeterminate" : "determinate"}
          value={percent}
          color={isFailed ? "error" : "inherit"}
        />
      )}
      {upload.isActive && !isIndeterminate && (
        <Typography variant="bodySmall" color="textSecondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {details}
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
  );
};

type ActionsProps = {
  upload: UploadUi;
  canRemove: boolean;
  removeLabel: string;
  onRequestRemove: () => void;
  onChooseAnother: () => void;
};

const UploadActions = ({ upload, canRemove, removeLabel, onRequestRemove, onChooseAnother }: ActionsProps) => {
  const isFailed = upload.phase === "failed";

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {upload.canPause && (
        <Button size="small" variant="outlined" color="inherit" onClick={upload.onPause}>
          Pause
        </Button>
      )}
      {upload.canResume && (
        <Button size="small" variant="outlined" color="inherit" onClick={upload.onResume}>
          {upload.phase === "paused" ? "Resume" : "Retry now"}
        </Button>
      )}
      {canRemove && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          // A failed upload has nothing to lose, so choosing another video needs no confirmation.
          onClick={isFailed ? onChooseAnother : onRequestRemove}
        >
          {isFailed ? "Choose another video" : removeLabel}
        </Button>
      )}
    </Box>
  );
};

type PanelProps = { file: File; upload: UploadUi; isPublishing?: boolean };

export const UploadStatusPanel = ({ file, upload, isPublishing = false }: PanelProps) => {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const { phase, percent } = upload;
  const sentBytes = upload.sentBytes ?? Math.floor((file.size * percent) / 100);
  const bytesPerSecond = useUploadRate(sentBytes, phase === "uploading");

  const isComplete = phase === "completed";
  // Removing a finished upload deletes its video on the server, which must not happen while an event is being created from it.
  const canRemove = !isPublishing && (upload.canCancel || isComplete || phase === "failed");
  const copy = upload.canCancel ? CANCEL_UPLOAD_COPY : REMOVE_VIDEO_COPY;

  // A connection drop can hide the button while its dialog is open; the dialog must not stay behind with other wording.
  useEffect(() => {
    if (!canRemove) setConfirmingRemove(false);
  }, [canRemove]);

  const handleRemove = () => {
    setConfirmingRemove(false);
    upload.onCancel();
  };

  // Confirming is already reported by UPLOAD_VIDEO_CANCELLED (the manager emits it for every removal), so only the
  // declined and the no-confirmation paths are tracked here.
  const handleKeep = () => {
    setConfirmingRemove(false);
    trackEvent(GA_EVENTS.UPLOAD_CONFIRM_DECLINED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { dialog: copy.analyticsDialog });
  };

  const handleChooseAnother = () => {
    trackEvent(GA_EVENTS.UPLOAD_CHOOSE_ANOTHER_CLICK, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
    handleRemove();
  };

  const details = getUploadDetails({ percent, sentBytes, totalBytes: file.size, bytesPerSecond });

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        {isComplete && <CheckCircleOutlineIcon aria-hidden color="success" />}
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap title={file.name}>
            {file.name}
          </Typography>
          <Typography variant="bodySmall" color="textSecondary">
            {formatBytes(file.size)}
          </Typography>
        </Box>
      </Box>

      <UploadProgress upload={upload} details={details} />

      <UploadActions
        upload={upload}
        canRemove={canRemove}
        removeLabel={copy.action}
        onRequestRemove={() => setConfirmingRemove(true)}
        onChooseAnother={handleChooseAnother}
      />

      <ConfirmDialog
        open={confirmingRemove}
        title={copy.title}
        description={copy.description}
        confirmLabel={copy.action}
        cancelLabel={copy.keep}
        onConfirm={handleRemove}
        onCancel={handleKeep}
      />
    </Box>
  );
};
