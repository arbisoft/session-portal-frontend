"use client";

import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import { useSelector } from "react-redux";

import useNavigation from "@/hooks/useNavigation";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { selectIsStaff } from "@/redux/login/selectors";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

import { FORM_SCROLL_CONTAINER_ID } from "./fields";
import VideoForm from "./form";
import VideoPicker from "./videoPicker";

const FileUpload = () => {
  const [videoFile, setVideoFile] = useState<File | undefined>();
  const { uploadProgress, isUploading, videoAssetId, error, startUpload } = useVideoUpload();
  const isStaff = useSelector(selectIsStaff);
  const { navigateTo } = useNavigation();

  useEffect(() => {
    if (!isStaff) navigateTo("videos");
  }, [isStaff, navigateTo]);

  // Upload outcomes are reported once per transition of videoAssetId / error (startUpload resets both to null first).
  useEffect(() => {
    if (videoAssetId) trackEvent(GA_EVENTS.UPLOAD_VIDEO_COMPLETED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
  }, [videoAssetId]);

  useEffect(() => {
    // Error strings are static app messages (never server payloads or user data).
    if (error) trackEvent(GA_EVENTS.UPLOAD_VIDEO_FAILED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: error });
  }, [error]);

  const handleFileSelect = (file: File | undefined) => {
    setVideoFile(file);
    if (file) startUpload(file);
  };

  const isInsideOtherScrollable = (target: Node): boolean => {
    let el = target as HTMLElement | null;
    while (el && el !== document.body) {
      if (el.id === FORM_SCROLL_CONTAINER_ID) return false;
      const { overflowY } = window.getComputedStyle(el);
      if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scrollEl = document.getElementById(FORM_SCROLL_CONTAINER_ID);
    if (scrollEl && !scrollEl.contains(e.target as Node) && !isInsideOtherScrollable(e.target as Node)) {
      scrollEl.scrollBy({ top: e.deltaY });
    }
  };

  if (!isStaff) return null;

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
        <VideoForm uploadProgress={uploadProgress} isUploading={isUploading} videoAssetId={videoAssetId} uploadError={error} />
      )}
    </Box>
  );
};

export default FileUpload;
