"use client";

import React, { useState } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Controller, useFormState } from "react-hook-form";

import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import { Tag } from "@/models/Events";
import { useAllTagsQuery, useLazySearchUsersQuery, usePlaylistsQuery } from "@/redux/events/apiSlice";

import { FieldProps, FORM_SCROLL_CONTAINER_ID, OptionCheckbox } from "./fields";
import { InputContainer } from "./styled";

type PresenterAutocompleteProps = {
  onChange: (ids: number[]) => void;
  error?: boolean;
};

const PresenterAutocomplete = ({ onChange, error }: PresenterAutocompleteProps) => {
  const [presenterQuery, setPresenterQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchUsers, { data: userResults = [], isFetching: isSearchingUsers }] = useLazySearchUsersQuery();

  useCloseOnScroll(FORM_SCROLL_CONTAINER_ID, () => setDropdownOpen(false));

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
      id="upload-presenter"
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
            <OptionCheckbox checked={selected} />
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

export const PresenterField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="presenter_ids"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel htmlFor="upload-presenter">Presenter</InputLabel>
          <PresenterAutocomplete onChange={field.onChange} error={!!errors?.presenter_ids} />
          <Typography color="error" variant="bodySmall">
            {errors?.presenter_ids?.message}
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

  useCloseOnScroll(FORM_SCROLL_CONTAINER_ID, () => setOpen(false));

  return (
    <Autocomplete
      id="upload-playlists"
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
            <OptionCheckbox checked={selected} />
            {option.name}
          </li>
        );
      }}
      fullWidth
      renderInput={(params) => <TextField {...params} placeholder="Select playlists" error={error} />}
    />
  );
};

export const PlaylistsField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="playlists"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel htmlFor="upload-playlists">Playlists</InputLabel>
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

  useCloseOnScroll(FORM_SCROLL_CONTAINER_ID, () => setOpen(false));

  return (
    <Autocomplete
      id="upload-tags"
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
            <OptionCheckbox checked={selected} />#{label}
          </li>
        );
      }}
      renderValue={(value: (Tag | string)[], getItemProps) =>
        value.map((option, index) => {
          const label = typeof option === "string" ? option.replace(/^#+/, "") : option.name;
          const { key, ...itemProps } = getItemProps({ index });
          return <Chip key={key} label={`#${label}`} size="small" {...itemProps} />;
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

export const TagsField = ({ control }: FieldProps) => {
  const { errors } = useFormState({ control });
  return (
    <Controller
      name="tags"
      control={control}
      render={({ field }) => (
        <InputContainer>
          <InputLabel htmlFor="upload-tags">Tags</InputLabel>
          <TagsAutocomplete onChange={field.onChange} error={!!errors?.tags} />
          <Typography color="error" variant="bodySmall">
            {errors?.tags?.message as string}
          </Typography>
        </InputContainer>
      )}
    />
  );
};
