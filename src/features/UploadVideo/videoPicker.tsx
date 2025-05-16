"use client";

import React, { useState, useCallback, useRef, FC } from "react";

import CloudUploadSharpIcon from "@mui/icons-material/CloudUploadSharp";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

import Button from "@/components/Button";
import { useNotification } from "@/components/Notification";
import { ALLOWED_TYPES } from "@/constants/constants";

import { StyledCard, StyledIconContainer } from "./styled";

const VideoPicker: FC<{ onFileSelect: (val: File | undefined) => void }> = ({ onFileSelect }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();

  const isVideoFile = (file: File) => !ALLOWED_TYPES.includes(file.type);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !isVideoFile(file)) {
      notification.showNotification({ message: "Only MP4, MOV, AVI, and WebM video files are allowed", severity: "error" });
    } else {
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file && !isVideoFile(file)) {
      notification.showNotification({ message: "Only MP4, MOV, AVI, and WebM video files are allowed", severity: "error" });
    } else {
      onFileSelect(file);
    }
  }, []);

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

        <Button variant="contained" color="primary" onClick={handleSelectFileClick} sx={{ mt: 2 }}>
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
        <Typography color="textSecondary" textAlign="center">
          Upload your video in supported formats (MP4, MOV, AVI, WebM) and stay within the file size limit (1GB)
        </Typography>
      </CardActions>
    </StyledCard>
  );
};

export default VideoPicker;
