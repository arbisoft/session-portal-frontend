"use client";

import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { useNotification } from "@/components/Notification";
import useNavigation from "@/hooks/useNavigation";
import { usePreventFileDrop } from "@/hooks/usePreventFileDrop";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { selectIsStaff } from "@/redux/login/selectors";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

import VideoForm from "./form";
import { UploadUi } from "./uploadStatus";

const FileUpload = () => {
  const [videoFile, setVideoFile] = useState<File | undefined>();
  const {
    uploadProgress,
    isUploading,
    videoAssetId,
    error,
    startUpload,
    phase,
    notice,
    canPause,
    canResume,
    canCancel,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    pendingUpload,
    discardPendingUpload,
  } = useVideoUpload();
  const isStaff = useSelector(selectIsStaff);
  const { navigateTo } = useNavigation();
  const notification = useNotification();

  usePreventFileDrop();

  useEffect(() => {
    if (isStaff) return;
    notification.showNotification({ message: "Only staff members can upload videos", severity: "info" });
    navigateTo("videos");
  }, [isStaff, navigateTo, notification]);

  // Upload outcomes are reported once per transition of videoAssetId / error (startUpload resets both to null first).
  useEffect(() => {
    if (videoAssetId) trackEvent(GA_EVENTS.UPLOAD_VIDEO_COMPLETED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
  }, [videoAssetId]);

  useEffect(() => {
    // Error strings are static app messages (never server payloads or user data).
    if (error) trackEvent(GA_EVENTS.UPLOAD_VIDEO_FAILED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: error });
  }, [error]);

  const handleFileSelect = (file: File) => {
    setVideoFile(file);
    startUpload(file);
  };

  // Cancelling, removing or starting over returns to the file picker; the form keeps what was typed.
  const handleCancel = () => {
    cancelUpload();
    setVideoFile(undefined);
  };

  const upload: UploadUi = {
    phase,
    notice,
    percent: uploadProgress,
    error,
    isActive: isUploading,
    videoAssetId,
    canPause,
    canResume,
    canCancel,
    onPause: pauseUpload,
    onResume: resumeUpload,
    onCancel: handleCancel,
  };

  if (!isStaff) return null;

  return (
    <VideoForm
      file={videoFile}
      upload={upload}
      onFileSelect={handleFileSelect}
      pendingUpload={pendingUpload}
      onDiscardPending={discardPendingUpload}
    />
  );
};

export default FileUpload;
