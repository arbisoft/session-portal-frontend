"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { UPLOAD_STORAGE_KEY } from "@/constants/constants";
import { logout } from "@/redux/login/actions";
import { selectCurrentUser } from "@/redux/login/selectors";
import { createUploadStorage, StoredUpload } from "@/services/resumableUpload/storage";
import { createUploadApi } from "@/services/resumableUpload/transport";
import { UploadEvent, UploadPhase, UploadSnapshot } from "@/services/resumableUpload/types";
import { IDLE_SNAPSHOT, UploadManager } from "@/services/resumableUpload/uploadManager";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { reportHandledMessage } from "@/utils/monitoring";

export type VideoUploadState = {
  uploadProgress: number;
  isUploading: boolean;
  videoAssetId: number | null;
  error: string | null;
  startUpload: (file: File) => void;
  phase: UploadPhase;
  /** Why the transfer is waiting or interrupted, when it is. */
  notice: string | null;
  canPause: boolean;
  canResume: boolean;
  canCancel: boolean;
  pauseUpload: () => void;
  resumeUpload: () => void;
  cancelUpload: () => void;
  /** An unfinished upload from an earlier page load. Selecting the same file continues it. */
  pendingUpload: StoredUpload | null;
  discardPendingUpload: () => void;
};

const ACTIVE_PHASES = new Set<UploadPhase>(["creating", "uploading", "paused", "interrupted", "finalizing"]);
const CANCELLABLE_PHASES = new Set<UploadPhase>(["creating", "uploading", "paused", "interrupted"]);
const REPORTED_FAILURES = new Set(["unknown", "verification_failed"]);

// Progress changes at most once per percent in the UI; confirmedBytes may lag by less than that between renders.
const isSameView = (a: UploadSnapshot, b: UploadSnapshot) =>
  a.phase === b.phase &&
  a.percent === b.percent &&
  a.notice === b.notice &&
  a.videoAssetId === b.videoAssetId &&
  a.failure === b.failure &&
  a.stalled === b.stalled &&
  a.resumed === b.resumed;

export const useVideoUpload = (): VideoUploadState => {
  const [snapshot, setSnapshot] = useState<UploadSnapshot>(IDLE_SNAPSHOT);
  const [pendingUpload, setPendingUpload] = useState<StoredUpload | null>(null);
  const managerRef = useRef<UploadManager | null>(null);
  const shownRef = useRef<UploadSnapshot>(IDLE_SNAPSHOT);
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUser)?.id;
  // The manager must outlive a change of user id (the current user loads after the first render), so the storage key
  // is resolved on every access instead of when the manager is created.
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    const handleEvent = (event: UploadEvent) => {
      // Only counts, flags and static reasons are reported: no file names, session ids or server messages.
      switch (event.type) {
        case "started":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_STARTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, {
            resumed: event.resumed,
            size_mb: Math.round(event.sizeBytes / 1024 ** 2),
          });
          break;
        case "interrupted":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_INTERRUPTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: event.reason });
          break;
        case "recovered":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_RECOVERED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { attempts: event.attempts });
          break;
        case "paused":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_PAUSED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
          break;
        case "continued":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_RESUMED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
          break;
        case "cancelled":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_CANCELLED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
          break;
        case "failed":
          if (event.code === "unauthorized") dispatch(logout());
          if (REPORTED_FAILURES.has(event.code)) {
            reportHandledMessage("Resumable video upload failed", { source: "video_upload", extra: { code: event.code } });
          }
          break;
        default:
          break;
      }
    };

    const scopedStorage = () => createUploadStorage(`${UPLOAD_STORAGE_KEY}:${userIdRef.current ?? "anonymous"}`);
    const manager = new UploadManager({
      api: createUploadApi(),
      storage: {
        load: () => scopedStorage().load(),
        save: (record) => scopedStorage().save(record),
        clear: () => scopedStorage().clear(),
      },
      onChange: (next) => {
        if (isSameView(shownRef.current, next)) return;
        shownRef.current = next;
        setSnapshot(next);
      },
      onEvent: handleEvent,
    });
    managerRef.current = manager;

    // Leaving the page stops the transfer but keeps the server session, so the upload can be resumed later.
    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, [dispatch]);

  useEffect(() => {
    setPendingUpload(managerRef.current?.peekStored() ?? null);
  }, [userId]);

  const startUpload = useCallback((file: File) => {
    setPendingUpload(null);
    void managerRef.current?.start(file);
  }, []);

  const pauseUpload = useCallback(() => managerRef.current?.pause(), []);
  const resumeUpload = useCallback(() => void managerRef.current?.resume(), []);
  const cancelUpload = useCallback(() => void managerRef.current?.cancel(), []);

  const discardPendingUpload = useCallback(() => {
    setPendingUpload(null);
    void managerRef.current?.discardStored();
  }, []);

  const { phase } = snapshot;
  const canPause = phase === "uploading" || (phase === "interrupted" && !snapshot.stalled);

  return {
    uploadProgress: snapshot.percent,
    isUploading: ACTIVE_PHASES.has(phase),
    videoAssetId: snapshot.videoAssetId,
    error: snapshot.failure?.message ?? null,
    startUpload,
    phase,
    notice: snapshot.notice,
    canPause,
    canResume: phase === "paused" || phase === "interrupted" || (phase === "failed" && !!snapshot.failure?.retryable),
    canCancel: CANCELLABLE_PHASES.has(phase),
    pauseUpload,
    resumeUpload,
    cancelUpload,
    pendingUpload,
    discardPendingUpload,
  };
};
