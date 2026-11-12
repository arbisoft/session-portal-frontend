"use client";

import React, { useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";

import { useNotification } from "@/components/Notification";
import { REDIRECT_TO_KEY } from "@/constants/constants";
import useNavigation, { ALLOWED_PAGES } from "@/hooks/useNavigation";
import { usePreventFileDrop } from "@/hooks/usePreventFileDrop";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { selectIsStaff } from "@/redux/login/selectors";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

import VideoForm from "./form";
import { UploadUi } from "./uploadStatus";

const FileUpload = () => {
  const [videoFile, setVideoFile] = useState<File | undefined>();
  const hasHandledExpiryRef = useRef(false);
  const {
    uploadProgress,
    sentBytes,
    isUploading,
    videoAssetId,
    error,
    startUpload,
    phase,
    notice,
    canPause,
    canResume,
    canCancel,
    isSessionExpired,
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

  // An expired login is not a permission problem: say so, and send the user to log in with a way back. The form
  // details and the unfinished upload are kept (see useUploadDraft), so they are waiting after signing in again.
  useEffect(() => {
    // navigateTo changes identity on every render, so without this the toast and redirect would repeat until the route changes.
    if (!isSessionExpired || hasHandledExpiryRef.current) return;
    hasHandledExpiryRef.current = true;
    notification.showNotification({ message: "Your session has expired. Please log in again.", severity: "warning" });
    navigateTo("login", { [REDIRECT_TO_KEY]: ALLOWED_PAGES.uploadVideo });
  }, [isSessionExpired, navigateTo, notification]);

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
    sentBytes,
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
