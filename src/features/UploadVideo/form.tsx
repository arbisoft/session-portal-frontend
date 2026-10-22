"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { useNotification } from "@/components/Notification";
import { TITLE_MAX_LENGTH } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { Tag } from "@/models/Events";
import { useCreateEventMutation, useCreateTagMutation } from "@/redux/events/apiSlice";
import { StoredUpload } from "@/services/resumableUpload/storage";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { normalizeTagName } from "@/utils/tags";
import { titleFromFileName, toEventTimestamp } from "@/utils/upload";

import { DescriptionField, EventDateField, FormValues, TitleField } from "./fields";
import LeaveGuardDialog from "./leaveGuardDialog";
import PublishBar from "./publishBar";
import { PlaylistsField, PresenterField, TagsField } from "./selectFields";
import { StyledCard } from "./styled";
import ThumbnailField from "./thumbnailField";
import { getPublishStatus, UploadStatusPanel, UploadUi } from "./uploadStatus";
import VideoPicker from "./videoPicker";

const schema = yup
  .object({
    title: yup
      .string()
      .trim()
      .required("Title is required")
      .max(TITLE_MAX_LENGTH, `Title can be at most ${TITLE_MAX_LENGTH} characters`),
    event_date: yup.date().typeError("Enter a valid date").required("Session date is required"),
    description: yup.string().trim().required("Description is required"),
    presenter_ids: yup.array().of(yup.number().required()).min(1, "At least one presenter is required").default([]),
    playlists: yup.array().of(yup.number().required()).default([]),
    tags: yup.array().default([]),
  })
  .required();

type VideoFormProps = {
  /** The video being uploaded; undefined until one is chosen. */
  file: File | undefined;
  upload: UploadUi;
  onFileSelect: (file: File) => void;
  /** Unfinished upload from an earlier page load; selecting the same file continues it. */
  pendingUpload?: StoredUpload | null;
  onDiscardPending?: () => void;
};

const VideoForm = ({ file, upload, onFileSelect, pendingUpload, onDiscardPending }: VideoFormProps) => {
  const { navigateTo } = useNavigation();
  const notification = useNotification();
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isQueued, setIsQueued] = useState(false);
  const [hadFile, setHadFile] = useState(false);
  const publishInFlightRef = useRef(false);
  const createdTagIdsRef = useRef(new Map<string, number>());
  const [createEvent, { isLoading: isPublishing }] = useCreateEventMutation();
  const [createTag] = useCreateTagMutation();

  const { control, handleSubmit, getValues, setValue } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      event_date: new Date(),
      description: "",
      presenter_ids: [],
      playlists: [],
      tags: [],
    },
  });

  const { videoAssetId, phase } = upload;
  const fileName = file?.name;

  useEffect(() => {
    if (fileName) setHadFile(true);
  }, [fileName]);

  // A readable title from the file name saves typing; it is only a suggestion and never overwrites the user's own.
  useEffect(() => {
    if (fileName && !getValues("title")) setValue("title", titleFromFileName(fileName), { shouldDirty: true });
  }, [fileName, getValues, setValue]);

  const publish = useCallback(
    async (data: FormValues, assetId: number) => {
      if (publishInFlightRef.current) return;
      publishInFlightRef.current = true;
      let stage: "create_tag" | "create_event" = "create_tag";
      try {
        const selectedTags = data.tags;
        const existingTagIds: number[] = selectedTags.filter((t): t is Tag => typeof t !== "string").map((t) => t.id);
        const newTagNames = new Set(
          selectedTags
            .filter((t): t is string => typeof t === "string")
            .map(normalizeTagName)
            .filter(Boolean)
        );
        const newTagIds = await Promise.all(
          [...newTagNames].map(async (name) => {
            const createdTagId = createdTagIdsRef.current.get(name);
            if (createdTagId !== undefined) return createdTagId;

            const { id } = await createTag({ name }).unwrap();
            createdTagIdsRef.current.set(name, id);
            return id;
          })
        );

        stage = "create_event";
        const event = await createEvent({
          title: data.title,
          description: data.description,
          event_time: toEventTimestamp(data.event_date),
          playlists: data.playlists,
          presenter_ids: data.presenter_ids,
          video_asset_id: assetId,
          thumbnail: thumbnail ?? undefined,
          tags: [...existingTagIds, ...newTagIds],
        }).unwrap();

        trackEvent(GA_EVENTS.UPLOAD_PUBLISH_SUCCESS, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
        notification.showNotification({ message: "Session published successfully!", severity: "success" });
        navigateTo("videoDetail", { id: event.slug });
      } catch {
        // The API error toast is already shown by customBaseQuery.
        trackEvent(GA_EVENTS.UPLOAD_PUBLISH_FAILED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: stage });
      } finally {
        publishInFlightRef.current = false;
      }
    },
    [createEvent, createTag, thumbnail, notification, navigateTo]
  );

  // Re-reads the form when the upload finishes, so edits made while queued are published, not the values at click time.
  const publishQueued = handleSubmit(async (data) => {
    if (videoAssetId) await publish(data, videoAssetId);
  });

  useEffect(() => {
    if (!isQueued) return;
    if (!file) {
      setIsQueued(false);
      return;
    }
    if (phase === "failed") {
      trackEvent(GA_EVENTS.UPLOAD_PUBLISH_FAILED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: "upload_failed" });
      setIsQueued(false);
      return;
    }
    if (videoAssetId) {
      setIsQueued(false);
      void publishQueued();
    }
  }, [isQueued, file, phase, videoAssetId, publishQueued]);

  const onSubmit = handleSubmit(async (data) => {
    // Only counts and flags are reported; no titles, descriptions, tag names or presenter details.
    trackEvent(GA_EVENTS.UPLOAD_PUBLISH_SUBMIT, ANALYTICS_CATEGORY.UPLOAD_VIDEO, {
      queued: !videoAssetId,
      has_custom_thumbnail: !!thumbnail,
      presenter_count: data.presenter_ids.length,
      playlist_count: data.playlists.length,
      tag_count: data.tags.length,
      new_tag_count: data.tags.filter((t) => typeof t === "string").length,
    });
    if (!videoAssetId) {
      setIsQueued(true);
      return;
    }
    await publish(data, videoAssetId);
  });

  const handleCancelQueued = () => {
    trackEvent(GA_EVENTS.UPLOAD_PUBLISH_QUEUE_CANCELLED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { phase });
    setIsQueued(false);
  };

  const status = getPublishStatus({ hasFile: !!file, isQueued, isPublishing, upload });
  const isPublishDisabled = !file || (!videoAssetId && !upload.isActive) || isPublishing || isQueued;

  return (
    <StyledCard>
      <CardHeader title="Upload Video" slotProps={{ title: { component: "h1" } }} />

      <form onSubmit={onSubmit} noValidate>
        <CardContent>
          <Grid container spacing={3}>
            {/* Video first in the DOM and on screen at every width, so tab order matches what is visible. */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography component="h2" variant="h5" sx={{ fontWeight: 500, mb: 1.5 }}>
                Video
              </Typography>
              {file ? (
                <UploadStatusPanel file={file} upload={upload} />
              ) : (
                <VideoPicker
                  onFileSelect={onFileSelect}
                  pendingUpload={pendingUpload}
                  onDiscardPending={onDiscardPending}
                  focusOnMount={hadFile}
                />
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <TitleField control={control} />
              <PresenterField control={control} />
              <EventDateField control={control} />
              <DescriptionField control={control} />
              <ThumbnailField thumbnail={thumbnail} onChange={setThumbnail} />
              <PlaylistsField control={control} />
              <TagsField control={control} />
            </Grid>
          </Grid>
        </CardContent>

        <CardActions>
          <PublishBar
            control={control}
            status={status}
            isDisabled={isPublishDisabled}
            isPublishing={isPublishing}
            isQueued={isQueued}
            onCancelQueued={handleCancelQueued}
          />
        </CardActions>
      </form>

      <LeaveGuardDialog control={control} hasFile={!!file} />
    </StyledCard>
  );
};

export default VideoForm;
