"use client";

import React, { useState, useCallback, useRef, FC } from "react";

import CloudUploadSharpIcon from "@mui/icons-material/CloudUploadSharp";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

import Button from "@/components/Button";
import { useNotification } from "@/components/Notification";
import { ALLOWED_TYPES, MAX_VIDEO_FILE_SIZE_BYTES } from "@/constants/constants";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

import { StyledCard, StyledIconContainer } from "./styled";

const VideoPicker: FC<{ onFileSelect: (val: File | undefined) => void }> = ({ onFileSelect }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();

  const selectFile = useCallback(
    (file: File | undefined, source: "picker" | "drop") => {
      if (file && !ALLOWED_TYPES.includes(file.type)) {
        trackEvent(GA_EVENTS.UPLOAD_FILE_REJECTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: "invalid_type", source });
        notification.showNotification({ message: "Only MP4, MOV, AVI, and WebM video files are allowed", severity: "error" });
      } else if (file && file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
        trackEvent(GA_EVENTS.UPLOAD_FILE_REJECTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: "file_too_large", source });
        notification.showNotification({ message: "Video files must be 1GB or smaller", severity: "error" });
      } else {
        // File name is intentionally omitted; only the MIME type and rounded size are reported.
        if (file) {
          trackEvent(GA_EVENTS.UPLOAD_FILE_SELECTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, {
            source,
            file_type: file.type,
            size_mb: Math.round(file.size / 1024 ** 2),
          });
        }
        onFileSelect(file);
      }
    },
    [notification, onFileSelect]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0], "picker");
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOver(false);

      selectFile(event.dataTransfer.files?.[0], "drop");
    },
    [selectFile]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <StyledCard onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      <CardHeader title="Upload Video" />

      <CardContent className="first-step">
        <StyledIconContainer as="span">
          <CloudUploadSharpIcon />
        </StyledIconContainer>
        <Typography mt={1} color="textSecondary" variant="bodySmall">
          Drag and drop a video file to upload
        </Typography>

        <Button
          variant="contained"
          onClick={handleSelectFileClick}
          sx={{ mt: 2, backgroundColor: "#fff", color: "#3c3e42", "&:hover": { backgroundColor: "#e0e0e0" } }}
        >
          {dragOver ? "Drop File Here" : "Select File"}
        </Button>
        <input
          type="file"
          hidden
          accept="video/mp4, video/quicktime, video/x-msvideo, video/webm"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </CardContent>

      <CardActions>
        <Typography color="textSecondary" textAlign="center" variant="bodySmall">
          Upload your video in supported formats (MP4, MOV, AVI, WebM) and stay within the file size limit (1GB)
        </Typography>
      </CardActions>
    </StyledCard>
  );
};

export default VideoPicker;
