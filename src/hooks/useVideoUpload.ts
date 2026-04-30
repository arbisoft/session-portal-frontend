"use client";

import { useCallback, useRef, useState } from "react";

import { useDispatch } from "react-redux";

import { API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE, API_PROXY_PREFIX } from "@/constants/constants";
import { events } from "@/endpoints";
import { logout } from "@/redux/login/actions";

export type VideoUploadState = {
  uploadProgress: number;
  isUploading: boolean;
  videoAssetId: number | null;
  videoFileUrl: string | null;
  error: string | null;
  startUpload: (file: File) => void;
};

export const useVideoUpload = (): VideoUploadState => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoAssetId, setVideoAssetId] = useState<number | null>(null);
  const [videoFileUrl, setVideoFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const dispatch = useDispatch();

  const startUpload = useCallback(
    (file: File) => {
      setUploadProgress(0);
      setIsUploading(true);
      setVideoAssetId(null);
      setVideoFileUrl(null);
      setError(null);

      const formData = new FormData();
      formData.append("video_file", file);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          setVideoAssetId(data.id);
          setVideoFileUrl(data.video_file);
        } else if (xhr.status === 401) {
          dispatch(logout());
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Upload failed. Please try again.");
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setError("Network error during upload.");
      };

      // Goes through the BFF proxy, which attaches the access token from the HttpOnly cookie.
      xhr.open("POST", `${API_PROXY_PREFIX}${events.uploadVideoAsset.replace(/\/$/, "")}`);
      xhr.setRequestHeader(API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE);
      xhr.send(formData);
    },
    [dispatch]
  );

  return { uploadProgress, isUploading, videoAssetId, videoFileUrl, error, startUpload };
};
