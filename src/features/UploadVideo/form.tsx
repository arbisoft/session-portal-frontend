"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Control, Controller, FieldValues, useForm, useFormState, useWatch } from "react-hook-form";
import * as yup from "yup";

import Button from "@/components/Button";
import { useNotification } from "@/components/Notification";
import useNavigation from "@/hooks/useNavigation";
import { Tag } from "@/models/Events";
import {
  useAllTagsQuery,
  useCreateEventMutation,
  useCreateTagMutation,
  useLazySearchUsersQuery,
  usePlaylistsQuery,
} from "@/redux/events/apiSlice";

import { InputContainer, StyledCard, ThumbnailUploaderButtons } from "./styled";

const schema = yup
  .object({
    title: yup.string().required("Title is required"),
    event_date: yup.date().required("Event date is required"),
    description: yup.string().required("Description is required"),
    presenter_ids: yup.array().of(yup.number().required()).min(1, "At least one presenter is required").default([]),
    playlists: yup.array().of(yup.number().required()).default([]),
    tags: yup.array().default([]),
  })
  .required();

type FormValues = {
  title: string;
  event_date: Date;
  description: string;
  presenter_ids: number[];
  playlists: number[];
  tags: (Tag | string)[];
};

type FieldProps = { control: Control<FormValues> };

const FormCardHeader = ({ control }: FieldProps) => {
  const title = useWatch({ control, name: "title" });
  return <CardHeader title={title || "Upload Video"} />;
};

const TitleField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="title"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel>Title</InputLabel>
          <TextField {...field} variant="outlined" fullWidth error={!!errors?.title} />
          <Typography color="error" variant="bodySmall">
            {errors?.title?.message}
          </Typography>
        </InputContainer>
      )}
    />
  );
};

type PresenterAutocompleteProps = {
  onChange: (ids: number[]) => void;
  error?: boolean;
};

const PresenterAutocomplete = ({ onChange, error }: PresenterAutocompleteProps) => {
  const [presenterQuery, setPresenterQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchUsers, { data: userResults = [], isFetching: isSearchingUsers }] = useLazySearchUsersQuery();

  useEffect(() => {
    const scrollEl = document.getElementById("upload-form-scroll");
    if (!scrollEl) return;
    const close = () => setDropdownOpen(false);
    scrollEl.addEventListener("scroll", close);
    return () => scrollEl.removeEventListener("scroll", close);
  }, []);

  const handlePresenterInputChange = (_: React.SyntheticEvent, value: string) => {
    setPresenterQuery(value);
    if (value.trim().length >= 2) {
      searchUsers(value.trim());
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  };

  return (
    <Autocomplete
      multiple
      options={userResults}
      getOptionLabel={(option) => option.full_name || `${option.first_name} ${option.last_name}`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={isSearchingUsers}
      open={dropdownOpen}
      onClose={() => setDropdownOpen(false)}
      filterOptions={(x) => x}
      inputValue={presenterQuery}
      onInputChange={handlePresenterInputChange}
      onChange={(_, selected) => onChange(selected.map((u) => u.id))}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              checked={selected}
            />
            {option.full_name} — {option.email}
          </li>
        );
      }}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search by name or email"
          error={error}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isSearchingUsers ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
};

const PresenterField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="presenter_ids"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel>Presenter</InputLabel>
          <PresenterAutocomplete onChange={field.onChange} error={!!errors?.presenter_ids} />
          <Typography color="error" variant="bodySmall">
            {errors?.presenter_ids?.message}
          </Typography>
        </InputContainer>
      )}
    />
  );
};

type EventDateInputProps = { value: Date | undefined; onChange: (date: Date | null) => void; error: boolean };

const EventDateInput = ({ value, onChange, error }: EventDateInputProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const scrollEl = document.getElementById("upload-form-scroll");
    if (!scrollEl) return;
    const close = () => setOpen(false);
    scrollEl.addEventListener("scroll", close);
    return () => scrollEl.removeEventListener("scroll", close);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={value ?? null}
        onChange={onChange}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          textField: { onClick: () => setOpen(true), error },
        }}
      />
    </LocalizationProvider>
  );
};

const EventDateField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="event_date"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel>Event Date</InputLabel>
          <EventDateInput value={field.value} onChange={field.onChange} error={!!errors?.event_date} />
          <Typography color="error" variant="bodySmall">
            {errors?.event_date?.message}
          </Typography>
        </InputContainer>
      )}
    />
  );
};

const DescriptionField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="description"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel>Description</InputLabel>
          <TextField
            multiline
            minRows={4}
            {...field}
            fullWidth
            error={!!errors?.description}
            sx={{ "& textarea": { resize: "vertical" } }}
          />
          <Typography color="error" variant="bodySmall">
            {errors?.description?.message}
          </Typography>
        </InputContainer>
      )}
    />
  );
};

type PlaylistsAutocompleteProps = { onChange: (ids: number[]) => void; error: boolean };

const PlaylistsAutocomplete = ({ onChange, error }: PlaylistsAutocompleteProps) => {
  const { data: playlists = [] } = usePlaylistsQuery();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const scrollEl = document.getElementById("upload-form-scroll");
    if (!scrollEl) return;
    const close = () => setOpen(false);
    scrollEl.addEventListener("scroll", close);
    return () => scrollEl.removeEventListener("scroll", close);
  }, []);

  return (
    <Autocomplete
      multiple
      options={playlists}
      disableCloseOnSelect
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, selected) => onChange(selected.map((p) => p.id))}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              checked={selected}
            />
            {option.name}
          </li>
        );
      }}
      fullWidth
      renderInput={(params) => <TextField {...params} placeholder="Select playlists" error={error} />}
    />
  );
};

const PlaylistsField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="playlists"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel>Playlists</InputLabel>
          <PlaylistsAutocomplete onChange={field.onChange} error={!!errors?.playlists} />
          <Typography color="error" variant="bodySmall">
            {errors?.playlists?.message}
          </Typography>
        </InputContainer>
      )}
    />
  );
};

type TagsAutocompleteProps = { onChange: (tags: (Tag | string)[]) => void; error: boolean };

const TagsAutocomplete = ({ onChange, error }: TagsAutocompleteProps) => {
  const { data: allTags = [] } = useAllTagsQuery();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const scrollEl = document.getElementById("upload-form-scroll");
    if (!scrollEl) return;
    const close = () => setOpen(false);
    scrollEl.addEventListener("scroll", close);
    return () => scrollEl.removeEventListener("scroll", close);
  }, []);

  return (
    <Autocomplete
      multiple
      freeSolo
      options={allTags}
      disableCloseOnSelect
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
      isOptionEqualToValue={(option, value) => typeof option !== "string" && typeof value !== "string" && option.id === value.id}
      onChange={(_, selected) => onChange(selected)}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        const label = typeof option === "string" ? option : option.name;
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              checked={selected}
            />
            #{label}
          </li>
        );
      }}
      renderTags={(value: (Tag | string)[], getTagProps) =>
        value.map((option, index) => {
          const label = typeof option === "string" ? option.replace(/^#+/, "") : option.name;
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip key={key} label={`#${label}`} size="small" {...tagProps} />;
        })
      }
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search or create tags"
          error={error}
          slotProps={{ input: { ...params.InputProps } }}
        />
      )}
    />
  );
};

const TagsField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="tags"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel>Tags</InputLabel>
          <TagsAutocomplete onChange={field.onChange} error={!!errors?.tags} />
          <Typography color="error" variant="bodySmall">
            {errors?.tags?.message as string}
          </Typography>
        </InputContainer>
      )}
    />
  );
};

type VideoFormProps = {
  file: File;
  uploadProgress: number;
  isUploading: boolean;
  videoAssetId: number | null;
  videoFileUrl: string | null;
  uploadError: string | null;
};

const VideoForm = ({ uploadProgress, isUploading, videoAssetId, uploadError }: VideoFormProps) => {
  const { navigateTo } = useNavigation();
  const notification = useNotification();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<FieldValues | null>(null);
  const [createEvent, { isLoading: isPublishing }] = useCreateEventMutation();
  const [createTag] = useCreateTagMutation();

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      event_date: undefined,
      description: "",
      presenter_ids: [],
      playlists: [],
      tags: [],
    },
  });

  const handleFileUploadClick = () => {
    thumbnailInputRef.current?.click();
  };

  useEffect(() => {
    if (!thumbnail) {
      setThumbnailPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(thumbnail);
    setThumbnailPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) setThumbnail(selected);
  };

  const handleAutoGenerated = () => {
    setThumbnail(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const publish = useCallback(
    async (data: FieldValues, assetId: number) => {
      try {
        const selectedTags: (Tag | string)[] = data.tags ?? [];
        const existingTagIds: number[] = selectedTags.filter((t): t is Tag => typeof t !== "string").map((t) => t.id);
        const newTagIds = await Promise.all(
          selectedTags
            .filter((t): t is string => typeof t === "string")
            .map((name) =>
              createTag({ name: name.replace(/^#+/, "") })
                .unwrap()
                .then((t) => t.id)
            )
        );

        const event = await createEvent({
          title: data.title,
          description: data.description,
          event_time: (data.event_date as Date).toISOString(),
          playlists: data.playlists,
          presenter_ids: data.presenter_ids,
          video_asset_id: assetId,
          thumbnail: thumbnail ?? undefined,
          tags: [...existingTagIds, ...newTagIds],
        }).unwrap();

        notification.showNotification({ message: "Event published successfully!", severity: "success" });
        navigateTo("videoDetail", { id: event.slug });
      } catch {
        notification.showNotification({ message: "Failed to publish. Please try again.", severity: "error" });
      }
    },
    [createEvent, createTag, thumbnail, notification, navigateTo]
  );

  useEffect(() => {
    if (!pendingData) return;
    if (uploadError) {
      setPendingData(null);
      return;
    }
    if (videoAssetId) {
      setPendingData(null);
      publish(pendingData, videoAssetId);
    }
  }, [videoAssetId, uploadError, pendingData, publish]);

  const onSubmit = async (data: FieldValues) => {
    if (!videoAssetId) {
      setPendingData(data);
      return;
    }
    await publish(data, videoAssetId);
  };

  let progressLabel = "Ready to publish";
  if (pendingData && isUploading) {
    progressLabel = `Uploading ${uploadProgress}%… (will auto-publish when done)`;
  } else if (uploadError) {
    progressLabel = uploadError;
  } else if (isUploading) {
    progressLabel = `Uploading ${uploadProgress}%…`;
  }

  return (
    <StyledCard>
      <FormCardHeader control={control} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}
      >
        <CardContent id="upload-form-scroll" sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          <Grid container spacing={2}>
            <Grid size={7}>
              <TitleField control={control} />
              <PresenterField control={control} />
              <EventDateField control={control} />
              <DescriptionField control={control} />

              <InputContainer>
                <InputLabel>Thumbnail</InputLabel>
                <ThumbnailUploaderButtons>
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesomeOutlinedIcon />}
                    onClick={handleAutoGenerated}
                    sx={
                      !thumbnail
                        ? { borderColor: "#fff", color: "#fff" }
                        : { borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.3)" }
                    }
                  >
                    auto-generated
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddPhotoAlternateOutlinedIcon />}
                    onClick={handleFileUploadClick}
                    sx={
                      thumbnail
                        ? {
                            borderColor: "#fff",
                            color: "#fff",
                            overflow: "hidden",
                            backgroundImage: thumbnailPreviewUrl
                              ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${thumbnailPreviewUrl})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : { borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.3)" }
                    }
                  >
                    {thumbnail ? thumbnail.name : "Upload a file"}
                  </Button>
                </ThumbnailUploaderButtons>
                <input ref={thumbnailInputRef} type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
              </InputContainer>

              <PlaylistsField control={control} />
              <TagsField control={control} />
            </Grid>

            <Grid size={5}>
              <Card sx={{ background: "transparent" }}>
                <Box
                  sx={{
                    alignItems: "center",
                    background: "#000",
                    borderRadius: "12px",
                    display: "flex",
                    height: 162,
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="bodySmall" color="textSecondary">
                    {isUploading ? `Uploading video… ${uploadProgress}%` : "Upload complete"}
                  </Typography>
                </Box>
                {/* Video Link and Original File Name removed — the shareable link
                    can only be generated after the event is published (needs slug).
                <CardContent sx={{ paddingX: 0 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                      <Typography variant="h5" component="div" sx={{ mb: 0.5 }}>
                        Video Link
                      </Typography>
                      <Typography variant="bodySmall" sx={{ color: "text.secondary", wordBreak: "break-all" }}>
                        {videoFileUrl ?? "—"}
                      </Typography>
                    </Box>
                    <IconButton aria-label="Copy video link" disabled={!videoFileUrl} sx={{ color: "#fff" }}>
                      copy
                    </IconButton>
                  </Box>
                  <Typography variant="h5" component="div" sx={{ mb: 0.5, mt: 1 }}>
                    Original File Name
                  </Typography>
                  <Typography variant="bodySmall" sx={{ color: "text.secondary" }}>{file.name}</Typography>
                </CardContent> */}
              </Card>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography sx={{ color: uploadError ? "error.main" : "#fff", fontSize: "14px" }}>{progressLabel}</Typography>
            <Button
              type="submit"
              variant="contained"
              disabled={(!videoAssetId && !isUploading) || isPublishing || !!pendingData}
              startIcon={isPublishing || !!pendingData ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={{ backgroundColor: "#fff", color: "#3c3e42", "&:hover": { backgroundColor: "#e0e0e0" } }}
            >
              {isPublishing ? "Publishing…" : pendingData ? "Queued…" : "Publish"}
            </Button>
          </Box>
        </CardActions>
      </form>
    </StyledCard>
  );
};

export default VideoForm;
