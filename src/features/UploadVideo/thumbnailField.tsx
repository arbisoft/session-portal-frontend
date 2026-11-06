"use client";

import React, { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import Button from "@/components/Button";
import { useNotification } from "@/components/Notification";
import { THUMBNAIL_ALLOWED_TYPES, THUMBNAIL_MAX_BYTES, THUMBNAIL_MAX_LABEL } from "@/constants/constants";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { formatBytes } from "@/utils/upload";

import { FieldLabel } from "./fields";
import { InputContainer } from "./styled";

type ThumbnailFieldProps = { thumbnail: File | null; onChange: (file: File | null) => void };

const ThumbnailField = ({ thumbnail, onChange }: ThumbnailFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!thumbnail) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(thumbnail);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  const reject = (message: string) => notification.showNotification({ message, severity: "error" });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    // Cleared so choosing the same file again still fires onChange.
    event.target.value = "";
    if (!selected) return;
    if (!THUMBNAIL_ALLOWED_TYPES.includes(selected.type)) {
      reject("Thumbnail must be a JPG, PNG or WebP image");
      return;
    }
    if (selected.size > THUMBNAIL_MAX_BYTES) {
      reject(`Thumbnail must be ${THUMBNAIL_MAX_LABEL} or smaller`);
      return;
    }
    trackEvent(GA_EVENTS.UPLOAD_THUMBNAIL_SELECT, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { option: "custom" });
    onChange(selected);
  };

  const chooseAuto = () => {
    if (!thumbnail) return;
    trackEvent(GA_EVENTS.UPLOAD_THUMBNAIL_SELECT, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { option: "auto_generated" });
    onChange(null);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <InputContainer>
      <FieldLabel id="upload-thumbnail-label" optional>
        Thumbnail
      </FieldLabel>
      <ToggleButtonGroup exclusive value={thumbnail ? "custom" : "auto"} aria-labelledby="upload-thumbnail-label" size="small">
        <ToggleButton value="auto" onClick={chooseAuto} sx={{ px: 2 }}>
          Auto-generated
        </ToggleButton>
        <ToggleButton value="custom" onClick={thumbnail ? undefined : openPicker} sx={{ px: 2 }}>
          Custom image
        </ToggleButton>
      </ToggleButtonGroup>

      {thumbnail && previewUrl ? (
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Box
            component="img"
            src={previewUrl}
            alt="Selected thumbnail preview"
            sx={{ aspectRatio: "16 / 9", borderRadius: 2, maxWidth: 240, objectFit: "cover", width: "100%" }}
          />
          <Box display="flex" flexDirection="column" gap={1} minWidth={0}>
            <Typography variant="bodySmall" sx={{ overflowWrap: "anywhere" }}>
              {thumbnail.name}
            </Typography>
            <Typography variant="bodySmall" color="textSecondary">
              {formatBytes(thumbnail.size)}
            </Typography>
            <Box display="flex" gap={1}>
              <Button size="small" variant="outlined" onClick={openPicker}>
                Replace
              </Button>
              <Button size="small" variant="outlined" onClick={chooseAuto}>
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
