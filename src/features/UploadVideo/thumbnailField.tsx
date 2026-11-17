"use client";

import React, { useEffect, useRef, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import Button from "@/components/Button";
import { useNotification } from "@/components/Notification";
import {
  THUMBNAIL_ALLOWED_TYPES,
  THUMBNAIL_MAX_BYTES,
  THUMBNAIL_MAX_LABEL,
  THUMBNAIL_RECOMMENDED_HEIGHT,
  THUMBNAIL_RECOMMENDED_WIDTH,
} from "@/constants/constants";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { formatBytes, thumbnailIssues, thumbnailWarnings } from "@/utils/upload";

import { FieldLabel } from "./fields";
import { InputContainer } from "./styled";

type ThumbnailFieldProps = { thumbnail: File | null; onChange: (file: File | null) => void };

const HINT_ID = "upload-thumbnail-hint";
const FORMAT_HINT =
  `JPG, PNG or WebP, up to ${THUMBNAIL_MAX_LABEL}. ` +
  `Recommended: 16:9, at least ${THUMBNAIL_RECOMMENDED_WIDTH}×${THUMBNAIL_RECOMMENDED_HEIGHT}.`;

const ThumbnailField = ({ thumbnail, onChange }: ThumbnailFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // The custom image is kept here while Auto-generated is selected, so switching back restores it.
  const [stashed, setStashed] = useState<File | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  // Warnings come back every time the same image is shown again (kept image restored, draft restored), but the
  // choice of a poor image is reported once.
  const reportedWarningFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (!thumbnail) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(thumbnail);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  useEffect(() => {
    setWarnings([]);
    if (!previewUrl) return;
    const probe = new Image();
    probe.onload = () => {
      const fit = { width: probe.naturalWidth, height: probe.naturalHeight };
      const found = thumbnailWarnings(fit);
      setWarnings(found);
      if (found.length > 0 && reportedWarningFileRef.current !== thumbnail) {
        reportedWarningFileRef.current = thumbnail;
        trackEvent(GA_EVENTS.UPLOAD_THUMBNAIL_WARNING, ANALYTICS_CATEGORY.UPLOAD_VIDEO, thumbnailIssues(fit));
      }
    };
    probe.src = previewUrl;
    return () => {
      probe.onload = null;
    };
  }, [previewUrl]);

  const openPicker = () => inputRef.current?.click();

  const reject = (message: string) => notification.showNotification({ message, severity: "error" });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    // Cleared so choosing the same file again still fires onChange.
    event.target.value = "";
    if (!selected) return;
    if (!THUMBNAIL_ALLOWED_TYPES.includes(selected.type)) {
      trackEvent(GA_EVENTS.UPLOAD_THUMBNAIL_REJECTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: "invalid_type" });
      reject("Thumbnail must be a JPG, PNG or WebP image");
      return;
    }
    if (selected.size > THUMBNAIL_MAX_BYTES) {
      trackEvent(GA_EVENTS.UPLOAD_THUMBNAIL_REJECTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: "file_too_large" });
      reject(`Thumbnail must be ${THUMBNAIL_MAX_LABEL} or smaller`);
      return;
    }
    trackEvent(GA_EVENTS.UPLOAD_THUMBNAIL_SELECT, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { option: "custom", source: "picker" });
    setStashed(null);
    onChange(selected);
  };

  const switchToAuto = (keepImage: boolean) => {
    if (!thumbnail) return;
    trackEvent(GA_EVENTS.UPLOAD_THUMBNAIL_SELECT, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { option: "auto_generated" });
    setStashed(keepImage ? thumbnail : null);
    onChange(null);
  };

  const chooseCustom = () => {
    if (thumbnail) return;
    if (!stashed) {
      openPicker();
      return;
    }
    trackEvent(GA_EVENTS.UPLOAD_THUMBNAIL_SELECT, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { option: "custom", source: "restored" });
    onChange(stashed);
    setStashed(null);
  };

  return (
    <InputContainer>
      <FieldLabel id="upload-thumbnail-label" optional>
        Thumbnail
      </FieldLabel>
      <ToggleButtonGroup
        exclusive
        value={thumbnail ? "custom" : "auto"}
        aria-labelledby="upload-thumbnail-label"
        aria-describedby={HINT_ID}
        size="small"
      >
        <ToggleButton value="auto" onClick={() => switchToAuto(true)} sx={{ px: 2 }}>
          Auto-generated
        </ToggleButton>
        <ToggleButton value="custom" onClick={chooseCustom} sx={{ px: 2 }}>
          Custom image
        </ToggleButton>
      </ToggleButtonGroup>

      <Typography id={HINT_ID} variant="bodySmall" color="textSecondary">
        {FORMAT_HINT}
      </Typography>

      {thumbnail && previewUrl ? (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <Box
            component="img"
            src={previewUrl}
            alt="Selected thumbnail preview"
            sx={{ aspectRatio: "16 / 9", borderRadius: 2, maxWidth: 240, objectFit: "cover", width: "100%" }}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <Typography variant="bodySmall" sx={{ overflowWrap: "anywhere" }}>
              {thumbnail.name}
            </Typography>
            <Typography variant="bodySmall" color="textSecondary">
              {formatBytes(thumbnail.size)}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" variant="outlined" color="inherit" onClick={openPicker}>
                Replace
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={() => switchToAuto(false)}>
                Remove
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography variant="bodySmall" color="textSecondary">
          A frame from the video is picked automatically once it has been processed.
        </Typography>
      )}

      {thumbnail &&
        warnings.map((warning) => (
          <Alert key={warning} severity="warning" role="status">
            {warning}
          </Alert>
        ))}

      <input
        ref={inputRef}
        type="file"
        hidden
        aria-label="Thumbnail image"
        accept={THUMBNAIL_ALLOWED_TYPES.join(",")}
        onChange={handleChange}
      />
    </InputContainer>
  );
};

export default ThumbnailField;
