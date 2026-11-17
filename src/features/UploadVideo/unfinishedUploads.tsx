"use client";

import React, { FC, useRef, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useNotification } from "@/components/Notification";
import { VIDEO_INPUT_ACCEPT } from "@/constants/constants";
import { UploadSession } from "@/models/Events";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { formatBytes, isAllowedVideoFile, toPercent } from "@/utils/upload";

type UnfinishedUploadsProps = {
  sessions: UploadSession[];
  /** Another upload is running on this page. Continuing would replace it, so only deleting is offered. */
  isUploadActive: boolean;
  /** The user picked the file that belongs to `session`. */
  onContinue: (session: UploadSession, file: File) => void;
  /** Resolves `false` when the upload could not be deleted. */
  onDelete: (session: UploadSession) => Promise<boolean>;
};

// The browser cannot keep the file between visits, so continuing means choosing it again. Name and size must match
// what the server already holds, otherwise the bytes after the stored offset would belong to a different video.
const mismatchMessage = (session: UploadSession, file: File) => {
  if (!isAllowedVideoFile(file)) {
    return "Only MP4, MOV, AVI and WebM videos can be uploaded.";
  }
  if (file.name === session.filename && file.size === session.file_size) return null;
  return `That is not the same video. Select "${session.filename}" (${formatBytes(session.file_size)}) to continue this upload.`;
};

const UnfinishedUploads: FC<UnfinishedUploadsProps> = ({ sessions, isUploadActive, onContinue, onDelete }) => {
  const notification = useNotification();
  const inputRef = useRef<HTMLInputElement>(null);
  const [continuing, setContinuing] = useState<UploadSession | null>(null);
  const [mismatch, setMismatch] = useState<{ sessionId: string; message: string } | null>(null);
  const [deleting, setDeleting] = useState<UploadSession | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (sessions.length === 0) return null;

  const handleContinueClick = (session: UploadSession) => {
    trackEvent(GA_EVENTS.UPLOAD_UNFINISHED_CONTINUE_CLICK, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
    setMismatch(null);
    setContinuing(session);
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Cleared so choosing the same file again still fires onChange.
    event.target.value = "";
    if (!file || !continuing) return;
    const message = mismatchMessage(continuing, file);
    if (message) {
      trackEvent(GA_EVENTS.UPLOAD_UNFINISHED_WRONG_FILE, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
      setMismatch({ sessionId: continuing.id, message });
      return;
    }
    setMismatch(null);
    onContinue(continuing, file);
  };

  const handleKeep = () => {
    trackEvent(GA_EVENTS.UPLOAD_CONFIRM_DECLINED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { dialog: "delete_unfinished" });
    setDeleting(null);
  };

  const handleDelete = async () => {
    const session = deleting;
    setDeleting(null);
    if (!session) return;
    setRemovingId(session.id);
    const removed = await onDelete(session);
    setRemovingId(null);
    if (removed) {
      trackEvent(GA_EVENTS.UPLOAD_PENDING_DISCARDED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { source: "list" });
      return;
    }
    trackEvent(GA_EVENTS.UPLOAD_UNFINISHED_DELETE_FAILED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
    notification.showNotification({ message: "The upload could not be deleted. Please try again.", severity: "error" });
  };

  return (
    <Box
      component="section"
      aria-labelledby="unfinished-uploads-title"
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        marginInline: "auto",
        maxWidth: theme.breakpoints.values.lg,
        mb: 3,
        width: "100%",
      })}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography id="unfinished-uploads-title" component="h2" variant="h5" sx={{ fontWeight: 500 }}>
          Unfinished uploads
        </Typography>
        <Typography variant="bodySmall" color="textSecondary">
          Continue by selecting the same video again. The upload resumes where it stopped.
        </Typography>
      </Box>

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {sessions.map((session) => {
          const isRemoving = removingId === session.id;
          return (
            <Box
              component="li"
              key={session.id}
              sx={(theme) => ({
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                p: 2,
              })}
            >
              <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ overflowWrap: "anywhere" }}>{session.filename}</Typography>
                  <Typography variant="bodySmall" color="textSecondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatBytes(session.file_size)} · {toPercent(session.offset, session.file_size)}% uploaded
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    disabled={isUploadActive || isRemoving}
                    onClick={() => handleContinueClick(session)}
                    aria-label={`Continue upload of ${session.filename}`}
                  >
                    Continue
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    size="small"
                    loading={isRemoving}
                    onClick={() => setDeleting(session)}
                    aria-label={`Delete upload of ${session.filename}`}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
              {mismatch?.sessionId === session.id && (
                <Alert severity="warning" onClose={() => setMismatch(null)}>
                  {mismatch.message}
                </Alert>
              )}
            </Box>
          );
        })}
      </Box>

      <input
        type="file"
        hidden
        aria-label="Video file to continue"
        accept={VIDEO_INPUT_ACCEPT}
        onChange={handleFileChange}
        ref={inputRef}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete this unfinished upload?"
        description="The part already sent will be deleted and the video must be uploaded again from the start."
        confirmLabel="Delete upload"
        cancelLabel="Keep it"
        onConfirm={handleDelete}
        onCancel={handleKeep}
      />
    </Box>
  );
};

export default UnfinishedUploads;
