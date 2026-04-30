"use client";

import { useCallback, useRef, useState } from "react";

import { useSelector } from "react-redux";

import { BASE_URL } from "@/constants/constants";
import { events } from "@/endpoints";
import { selectAccessToken } from "@/redux/login/selectors";

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

  const accessToken = useSelector(selectAccessToken);

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
        } else {
          setError("Upload failed. Please try again.");
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setError("Network error during upload.");
      };

      xhr.open("POST", `${BASE_URL}/api/v1${events.uploadVideoAsset}`);
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.send(formData);
    },
    [accessToken]
  );

  return { uploadProgress, isUploading, videoAssetId, videoFileUrl, error, startUpload };
};
