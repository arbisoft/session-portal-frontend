"use client";

import React, { useState, useCallback, useRef } from "react";

import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import CloudUploadSharpIcon from "@mui/icons-material/CloudUploadSharp";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";

import Button from "@/components/Button";

import { StyledCard, StyledIconContainer } from "./styled";

const FileUpload = () => {
  const [fileName, setFileName] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

  const isVideoFile = (file: File) => allowedTypes.includes(file.type);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isVideoFile(file)) {
      setFileName(file.name);
      setSnackbarOpen(true);
    } else {
      setFileName("Only MP4, MOV, AVI, and WebM video files are allowed");
      setSnackbarOpen(true);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file && isVideoFile(file)) {
      setFileName(file.name);
    } else {
      setFileName("Only MP4, MOV, AVI, and WebM video files are allowed");
    }
    setSnackbarOpen(true);
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
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "84%" }}>
      <StyledCard onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        <CardHeader
          action={
            <IconButton>
              <CloseSharpIcon />
            </IconButton>
          }
          title="Upload Video"
        />
        <CardContent>
          <StyledIconContainer as="span">
            <CloudUploadSharpIcon />
          </StyledIconContainer>
          <Typography mt={1} color="textSecondary" variant="bodySmall">
            Drag and drop a video file to upload
          </Typography>

          <Button variant="contained" color="primary" onClick={handleSelectFileClick} sx={{ mt: 2 }}>
            {fileName || (dragOver ? "Drop File Here" : "Select File")}
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
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message={fileName} />
      </StyledCard>
    </Box>
  );
};

export default FileUpload;
