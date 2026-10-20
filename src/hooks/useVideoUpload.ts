"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDispatch } from "react-redux";

import { API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE, API_PROXY_PREFIX } from "@/constants/constants";
import { events } from "@/endpoints";
import { VideoAssetUploadResponse } from "@/models/Events";
import { logout } from "@/redux/login/actions";
import { reportHandledMessage } from "@/utils/monitoring";

export type VideoUploadState = {
  uploadProgress: number;
  isUploading: boolean;
  videoAssetId: number | null;
  error: string | null;
  startUpload: (file: File) => void;
};

const parseUploadResponse = (responseText: string): VideoAssetUploadResponse | null => {
  try {
    return JSON.parse(responseText) as VideoAssetUploadResponse;
  } catch {
    return null;
  }
};

export const useVideoUpload = (): VideoUploadState => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoAssetId, setVideoAssetId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeRequestRef = useRef<XMLHttpRequest | null>(null);

  const dispatch = useDispatch();

  useEffect(() => () => activeRequestRef.current?.abort(), []);

  const startUpload = useCallback(
    (file: File) => {
      activeRequestRef.current?.abort();

      setUploadProgress(0);
      setIsUploading(true);
      setVideoAssetId(null);
      setError(null);

      const formData = new FormData();
      formData.append("video_file", file);

      const request = new XMLHttpRequest();
      activeRequestRef.current = request;

      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      request.onload = () => {
        setIsUploading(false);
        if (request.status === 401) {
          dispatch(logout());
          setError("Your session has expired. Please log in again.");
          return;
        }

        const isCreated = request.status === 201;
        const asset = isCreated ? parseUploadResponse(request.responseText) : null;
        if (asset) {
          setVideoAssetId(asset.id);
        } else {
          // Other failures are user-facing statuses or backend 5xx (reported by the BFF proxy); a 201 whose body
          // cannot be read is a contract break that would otherwise leave no trace.
          if (isCreated) {
            reportHandledMessage("Video asset upload returned an unreadable response", { source: "video_upload" });
          }
          setError("Upload failed. Please try again.");
        }
      };

      request.onerror = () => {
        setIsUploading(false);
        setError("Network error during upload.");
      };

      // Goes through the BFF proxy, which attaches the access token from the HttpOnly cookie.
      request.open("POST", `${API_PROXY_PREFIX}${events.uploadVideoAsset.replace(/\/$/, "")}`);
      request.setRequestHeader(API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE);
      request.send(formData);
    },
    [dispatch]
  );

  return { uploadProgress, isUploading, videoAssetId, error, startUpload };
};
