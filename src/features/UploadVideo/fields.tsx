"use client";

import React, { ReactNode } from "react";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Control, Controller } from "react-hook-form";

import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "@/constants/constants";
import { Tag } from "@/models/Events";

import { InputContainer } from "./styled";

export type FormValues = {
  title: string;
  event_date: Date;
  description: string;
  presenter_ids: number[];
  playlists: number[];
  tags: (Tag | string)[];
};

export type FieldProps = { control: Control<FormValues> };

type FieldLabelProps = {
  /** Omit for groups of controls, which are named through aria-labelledby on the group instead. */
  htmlFor?: string;
  id?: string;
  children: ReactNode;
  optional?: boolean;
};

/** Required fields get the label asterisk; optional ones say so, so nobody has to guess. */
export const FieldLabel = ({ htmlFor, id, children, optional = false }: FieldLabelProps) => (
  <InputLabel id={id} htmlFor={htmlFor} required={!optional}>
    {children}
    {optional && (
      <Typography component="span" variant="bodySmall" color="textSecondary">
        {" "}
        (optional)
      </Typography>
    )}
  </InputLabel>
);

type HelperTextProps = { error?: string; length: number; max: number };

/** The validation message (if any) on the left and a live "used/limit" counter on the right. */
const HelperText = ({ error, length, max }: HelperTextProps) => (
  <Box component="span" sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
    <span>{error}</span>
    <Box component="span" sx={{ flexShrink: 0, marginInlineStart: "auto", fontVariantNumeric: "tabular-nums" }}>
      {length}/{max}
    </Box>
  </Box>
);

export const TitleField = ({ control }: FieldProps) => (
  <Controller
    name="title"
    control={control}
    render={({ field: { ref, ...field }, fieldState }) => (
      <InputContainer>
        <FieldLabel htmlFor="upload-title">Title</FieldLabel>
        <TextField
          {...field}
          id="upload-title"
          inputRef={ref}
          variant="outlined"
          fullWidth
          error={!!fieldState.error}
          helperText={<HelperText error={fieldState.error?.message} length={field.value.length} max={TITLE_MAX_LENGTH} />}
          // Typing and pasting stop at the limit, so the counter never shows a value that cannot be published.
          slotProps={{ htmlInput: { "aria-required": true, maxLength: TITLE_MAX_LENGTH } }}
        />
      </InputContainer>
    )}
  />
);

export const OptionCheckbox = ({ checked }: { checked: boolean }) => (
  <Checkbox
    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
    checkedIcon={<CheckBoxIcon fontSize="small" />}
    checked={checked}
  />
);

export const EventDateField = ({ control }: FieldProps) => (
  <Controller
    name="event_date"
    control={control}
    render={({ field, fieldState }) => (
      <InputContainer>
        <FieldLabel htmlFor="upload-event-date">Session date</FieldLabel>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={field.value ?? null}
            // A session must already have happened to be uploaded.
            disableFuture
            onChange={field.onChange}
            onClose={field.onBlur}
            inputRef={field.ref}
            slotProps={{
              textField: {
                id: "upload-event-date",
                error: !!fieldState.error,
                helperText: fieldState.error?.message,
              },
            }}
          />
        </LocalizationProvider>
      </InputContainer>
    )}
  />
);

export const DescriptionField = ({ control }: FieldProps) => (
  <Controller
    name="description"
    control={control}
    render={({ field: { ref, ...field }, fieldState }) => (
      <InputContainer>
        <FieldLabel htmlFor="upload-description">Description</FieldLabel>
        <TextField
          {...field}
          id="upload-description"
          inputRef={ref}
          multiline
          minRows={4}
          fullWidth
          error={!!fieldState.error}
          helperText={<HelperText error={fieldState.error?.message} length={field.value.length} max={DESCRIPTION_MAX_LENGTH} />}
          sx={{ "& textarea": { resize: "vertical" } }}
          slotProps={{ htmlInput: { "aria-required": true, maxLength: DESCRIPTION_MAX_LENGTH } }}
        />
      </InputContainer>
    )}
  />
);
