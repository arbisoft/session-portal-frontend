"use client";

import React, { useState } from "react";

import Box from "@mui/material/Box";

import { useVideoUpload } from "@/hooks/useVideoUpload";

import VideoForm from "./form";
import VideoPicker from "./videoPicker";

const FileUpload = () => {
  const [videoFile, setVideoFile] = useState<File | undefined>();
  const { uploadProgress, isUploading, videoAssetId, videoFileUrl, error, startUpload } = useVideoUpload();

  const handleFileSelect = (file: File | undefined) => {
    setVideoFile(file);
    if (file) startUpload(file);
  };

  const isInsideOtherScrollable = (target: Node): boolean => {
    let el = target as HTMLElement | null;
    while (el && el !== document.body) {
      if (el.id === "upload-form-scroll") return false;
      const { overflowY } = window.getComputedStyle(el);
      if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scrollEl = document.getElementById("upload-form-scroll");
    if (scrollEl && !scrollEl.contains(e.target as Node) && !isInsideOtherScrollable(e.target as Node)) {
      scrollEl.scrollBy({ top: e.deltaY });
    }
  };

  return (
    <Box
      onWheel={handleWheel}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: `calc(100vh - ${theme.spacing(12)} - ${theme.spacing(3)})`,
      })}
    >
      {!videoFile ? (
        <VideoPicker onFileSelect={handleFileSelect} />
      ) : (
        <VideoForm
          file={videoFile}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          videoAssetId={videoAssetId}
          videoFileUrl={videoFileUrl}
          uploadError={error}
        />
      )}
    </Box>
  );
};

export default FileUpload;
