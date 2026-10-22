"use client";

import React, { useCallback, useRef, useState, FC } from "react";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  ALLOWED_TYPES,
  ALLOWED_VIDEO_EXTENSIONS,
  MAX_VIDEO_FILE_SIZE_BYTES,
  MAX_VIDEO_FILE_SIZE_LABEL,
} from "@/constants/constants";
import { StoredUpload } from "@/services/resumableUpload/storage";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { formatBytes, isAllowedVideoFile, toPercent } from "@/utils/upload";

import { Dropzone, inverseButtonSx } from "./styled";

type VideoPickerProps = {
  onFileSelect: (val: File) => void;
  /** Unfinished upload from an earlier page load; selecting the same file continues it. */
  pendingUpload?: StoredUpload | null;
  onDiscardPending?: () => void;
  /** Moves focus to Select video on mount, for when the picker replaces a panel the user was just interacting with. */
  focusOnMount?: boolean;
};

const REJECTION_MESSAGES = {
  invalid_type: "Only MP4, MOV, AVI and WebM video files are allowed.",
  file_too_large: `Video files must be ${MAX_VIDEO_FILE_SIZE_LABEL} or smaller.`,
} as const;

type Rejection = keyof typeof REJECTION_MESSAGES;

const VIDEO_INPUT_ACCEPT = [...ALLOWED_TYPES, ...ALLOWED_VIDEO_EXTENSIONS].join(",");

const VideoPicker: FC<VideoPickerProps> = ({ onFileSelect, pendingUpload, onDiscardPending, focusOnMount = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [rejection, setRejection] = useState<Rejection | null>(null);
  const [multipleDropped, setMultipleDropped] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = useCallback(
    (file: File | undefined, source: "picker" | "drop") => {
      if (!file) return;
      let reason: Rejection | null = null;
      if (!isAllowedVideoFile(file)) reason = "invalid_type";
      else if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) reason = "file_too_large";

      setRejection(reason);
      if (reason) {
        trackEvent(GA_EVENTS.UPLOAD_FILE_REJECTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason, source });
        return;
      }
      // File name is intentionally omitted; only the MIME type and rounded size are reported.
      trackEvent(GA_EVENTS.UPLOAD_FILE_SELECTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, {
        source,
        file_type: file.type,
        size_mb: Math.round(file.size / 1024 ** 2),
      });
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMultipleDropped(false);
    selectFile(event.target.files?.[0], "picker");
    // Cleared so choosing the same file again still fires onChange.
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const { files } = event.dataTransfer;
    setMultipleDropped(files.length > 1);
    if (files.length > 1) {
      trackEvent(GA_EVENTS.UPLOAD_MULTI_FILE_DROPPED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { file_count: files.length });
    }
    selectFile(files[0], "drop");
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  // dragleave also fires when the pointer moves onto a child element; only a real exit should clear the highlight.
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragOver(false);
  };

  const handleKeepPending = () => {
    setConfirmingDiscard(false);
    trackEvent(GA_EVENTS.UPLOAD_CONFIRM_DECLINED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { dialog: "discard_pending" });
  };

  const handleDiscardPending = () => {
    setConfirmingDiscard(false);
    trackEvent(GA_EVENTS.UPLOAD_PENDING_DISCARDED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
    onDiscardPending?.();
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Dropzone $isDragOver={dragOver} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        <CloudUploadOutlinedIcon aria-hidden fontSize="large" />
        <Typography>{dragOver ? "Drop the video to start uploading" : "Drag and drop a video here"}</Typography>
        <Button variant="contained" autoFocus={focusOnMount} onClick={() => fileInputRef.current?.click()} sx={inverseButtonSx}>
          Select video
        </Button>
        <input
          type="file"
          hidden
          aria-label="Video file"
          accept={VIDEO_INPUT_ACCEPT}
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <Typography color="textSecondary" variant="bodySmall">
          MP4, MOV, AVI or WebM, up to {MAX_VIDEO_FILE_SIZE_LABEL}. The upload starts as soon as you pick a file.
        </Typography>
      </Dropzone>

      {rejection && (
        <Alert severity="error" onClose={() => setRejection(null)}>
          {REJECTION_MESSAGES[rejection]}
        </Alert>
      )}
      {multipleDropped && !rejection && (
        <Alert severity="info" onClose={() => setMultipleDropped(false)}>
          Only one video can be uploaded at a time, so the first file was used.
        </Alert>
      )}

      {pendingUpload && (
        <Alert
          severity="info"
          role="status"
          action={
            <Button size="small" variant="outlined" onClick={() => setConfirmingDiscard(true)}>
              Discard
            </Button>
          }
          sx={{ fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}
        >
          Unfinished upload: {pendingUpload.fingerprint.name} ({formatBytes(pendingUpload.fingerprint.size)},{" "}
          {toPercent(pendingUpload.confirmedBytes, pendingUpload.fingerprint.size)}% sent). Select the same file to continue; any
          other file starts over.
        </Alert>
      )}

      <ConfirmDialog
        open={confirmingDiscard}
        title="Discard the unfinished upload?"
        description="The part already sent will be deleted and the video must be uploaded again from the start."
        confirmLabel="Discard upload"
        cancelLabel="Keep it"
        onConfirm={handleDiscardPending}
        onCancel={handleKeepPending}
      />
    </Box>
  );
};

export default VideoPicker;
