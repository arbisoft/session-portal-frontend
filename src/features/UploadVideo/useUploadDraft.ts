import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Control, UseFormGetValues, UseFormSetValue, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";

import { UPLOAD_DRAFT_KEY } from "@/constants/constants";
import { UserSearchResult } from "@/models/Events";
import { selectCurrentUser } from "@/redux/login/selectors";
import { StoredUpload } from "@/services/resumableUpload/storage";
import { createDraftStorage, UploadDraft } from "@/services/uploadDraft/draftStorage";
import { loadDraftThumbnail, saveDraftThumbnail } from "@/services/uploadDraft/thumbnailStore";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { isFutureDay } from "@/utils/upload";

import { FormValues } from "./fields";

const SAVE_DELAY_MS = 300;

type UseUploadDraftArgs = {
  control: Control<FormValues>;
  getValues: UseFormGetValues<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  thumbnail: File | null;
  onRestoreThumbnail: (file: File) => void;
  presenters: UserSearchResult[];
  onRestorePresenters: (people: UserSearchResult[]) => void;
  file: File | undefined;
  pendingUpload?: StoredUpload | null;
};

/**
 * Keeps the form details next to the unfinished upload: they are saved while a video is chosen or an unfinished
 * upload is waiting, restored when that upload is found again after a reload, and removed once the upload is gone
 * (published, discarded or cancelled). Nothing is saved before an upload exists, so a form that was only typed into
 * is not restored by itself.
 */
export const useUploadDraft = ({
  control,
  getValues,
  setValue,
  thumbnail,
  onRestoreThumbnail,
  presenters,
  onRestorePresenters,
  file,
  pendingUpload,
}: UseUploadDraftArgs) => {
  const userId = useSelector(selectCurrentUser)?.id;
  const key = `${UPLOAD_DRAFT_KEY}:${userId ?? "anonymous"}`;
  const storage = useMemo(() => createDraftStorage(key), [key]);

  const values = useWatch({ control });
  // Saving waits until a restore had its chance, otherwise the empty form would overwrite the draft it should restore.
  const [isReady, setIsReady] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState(0);
  const hadFileRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const isMountedRef = useRef(true);
  // Latest callbacks without making the restore effect depend on their identity.
  const presentersRef = useRef(presenters);
  presentersRef.current = presenters;
  const callbacksRef = useRef({ onRestoreThumbnail, onRestorePresenters });
  callbacksRef.current = { onRestoreThumbnail, onRestorePresenters };
  const hasUpload = !!file || !!pendingUpload;

  const readDraft = useCallback((): UploadDraft => {
    // The date picker yields an Invalid Date while the user is typing, and toISOString() throws on it.
    const enteredDate = new Date(getValues("event_date"));
    const eventDate = Number.isNaN(enteredDate.getTime()) ? new Date() : enteredDate;
    return {
      title: getValues("title") ?? "",
      event_date: eventDate.toISOString(),
      description: getValues("description") ?? "",
      presenters: presentersRef.current,
      playlists: getValues("playlists") ?? [],
      tags: getValues("tags") ?? [],
    };
  }, [getValues]);

  // After a deliberate clear (published, discarded) the final flush on unmount must not write the draft back.
  const isClearedRef = useRef(false);

  const clearDraft = useCallback(() => {
    isClearedRef.current = true;
    storage.clear();
    void saveDraftThumbnail(key, null);
  }, [storage, key]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isReady || hasRestoredRef.current) return;
    if (file) {
      setIsReady(true);
      return;
    }
    if (!pendingUpload) return;
    hasRestoredRef.current = true;

    const draft = storage.load();
    let detailsRestored = false;
    const isUntouched = !getValues("title") && !getValues("description") && (getValues("presenter_ids") ?? []).length === 0;
    if (draft && isUntouched) {
      const date = new Date(draft.event_date);
      const options = { shouldDirty: true };
      setValue("title", draft.title, options);
      setValue("description", draft.description, options);
      setValue(
        "presenter_ids",
        draft.presenters.map((person) => person.id),
        options
      );
      setValue("playlists", draft.playlists, options);
      setValue("tags", draft.tags, options);
      // A date that is invalid, or is in the future now, falls back to the form's default instead of failing validation.
      if (!Number.isNaN(date.getTime()) && !isFutureDay(date)) setValue("event_date", date, options);
      callbacksRef.current.onRestorePresenters(draft.presenters);
      setRestoreVersion((version) => version + 1);
      detailsRestored = true;
    }

    void loadDraftThumbnail(key)
      .then((stored) => {
        if (stored && isMountedRef.current) callbacksRef.current.onRestoreThumbnail(stored);
        // Only which parts came back is reported, never what they contain.
        if ((detailsRestored || stored) && isMountedRef.current) {
          trackEvent(GA_EVENTS.UPLOAD_DRAFT_RESTORED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, {
            details_restored: detailsRestored,
            thumbnail_restored: !!stored,
          });
        }
      })
      .finally(() => {
        if (isMountedRef.current) setIsReady(true);
      });
  }, [isReady, file, pendingUpload, storage, key, getValues, setValue]);

  useEffect(() => {
    if (!isReady || !hasUpload) return;
    const timer = setTimeout(() => {
      isClearedRef.current = false;
      storage.save(readDraft());
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // `values` changes on every edit; the draft itself is read from the form when the timer fires.
  }, [isReady, hasUpload, values, storage, readDraft]);

  // Leaving right after an edit (for example to sign in again) must not drop what the debounce had not saved yet.
  const flushRef = useRef<() => void>(() => undefined);
  flushRef.current = () => {
    if (isReady && hasUpload && !isClearedRef.current) storage.save(readDraft());
  };
  useEffect(() => () => flushRef.current(), []);

  useEffect(() => {
    if (isReady && hasUpload) void saveDraftThumbnail(key, thumbnail);
  }, [isReady, hasUpload, thumbnail, key]);

  // Cancelling or removing the video ends the upload, so its details are no longer waiting for it.
  useEffect(() => {
    if (hadFileRef.current && !file) clearDraft();
    hadFileRef.current = !!file;
  }, [file, clearDraft]);

  return { clearDraft, restoreVersion };
};
