"use client";

import React, { useState } from "react";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Control, Controller, useFormState, useWatch } from "react-hook-form";

import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import { Tag } from "@/models/Events";

import { InputContainer } from "./styled";

export const FORM_SCROLL_CONTAINER_ID = "upload-form-scroll";

export type FormValues = {
  title: string;
  event_date: Date;
  description: string;
  presenter_ids: number[];
  playlists: number[];
  tags: (Tag | string)[];
};

export type FieldProps = { control: Control<FormValues> };

export const FormCardHeader = ({ control }: FieldProps) => {
  const title = useWatch({ control, name: "title" });
  return <CardHeader title={title || "Upload Video"} />;
};

export const TitleField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="title"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel htmlFor="upload-title">Title</InputLabel>
          <TextField {...field} id="upload-title" variant="outlined" fullWidth error={!!errors?.title} />
          <Typography color="error" variant="bodySmall">
            {errors?.title?.message}
          </Typography>
        </InputContainer>
      )}
    />
  );
};

export const OptionCheckbox = ({ checked }: { checked: boolean }) => (
  <Checkbox
    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
    checkedIcon={<CheckBoxIcon fontSize="small" />}
    checked={checked}
  />
);

type EventDateInputProps = { value: Date | undefined; onChange: (date: Date | null) => void; error: boolean };

const EventDateInput = ({ value, onChange, error }: EventDateInputProps) => {
  const [open, setOpen] = useState(false);

  useCloseOnScroll(FORM_SCROLL_CONTAINER_ID, () => setOpen(false));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={value ?? null}
        onChange={onChange}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          textField: { id: "upload-event-date", onClick: () => setOpen(true), error },
        }}
      />
    </LocalizationProvider>
  );
};

export const EventDateField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="event_date"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel htmlFor="upload-event-date">Event Date</InputLabel>
          <EventDateInput value={field.value} onChange={field.onChange} error={!!errors?.event_date} />
          <Typography color="error" variant="bodySmall">
            {errors?.event_date?.message}
          </Typography>
        </InputContainer>
      )}
    />
  );
};

export const DescriptionField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="description"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel htmlFor="upload-description">Description</InputLabel>
          <TextField
            id="upload-description"
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
