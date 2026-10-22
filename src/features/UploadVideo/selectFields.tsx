"use client";

import React, { Ref, useState } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";

import { Tag, UserSearchResult } from "@/models/Events";
import { useAllTagsQuery, useLazySearchUsersQuery, usePlaylistsQuery } from "@/redux/events/apiSlice";
import { normalizeTagSelection } from "@/utils/tags";

import { FieldLabel, FieldProps, OptionCheckbox } from "./fields";
import { InputContainer } from "./styled";

const MIN_SEARCH_LENGTH = 2;

type AutocompleteFieldProps<T> = {
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
  inputRef: Ref<unknown>;
  error?: string;
};

const presenterName = (user: UserSearchResult) => user.full_name || `${user.first_name} ${user.last_name}`.trim();

const PresenterAutocomplete = ({ onChange, onBlur, inputRef, error }: Omit<AutocompleteFieldProps<number[]>, "value">) => {
  const [selected, setSelected] = useState<UserSearchResult[]>([]);
  const [presenterQuery, setPresenterQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchUsers, { data: userResults = [], isFetching: isSearchingUsers }] = useLazySearchUsersQuery();

  const canSearch = presenterQuery.trim().length >= MIN_SEARCH_LENGTH;
  // Selected people stay in the options so the controlled value never points at a user the latest search dropped.
  const options = [...selected, ...userResults.filter((user) => !selected.some((chosen) => chosen.id === user.id))];

  const handleInputChange = (_: React.SyntheticEvent, value: string, reason: string) => {
    setPresenterQuery(value);
    // "reset" fires when an option is picked or the field is cleared; the list should not re-open for it.
    if (reason === "reset") return;
    if (value.trim().length >= MIN_SEARCH_LENGTH) {
      searchUsers(value.trim());
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  };

  const noOptionsText = canSearch ? "No people found" : `Type at least ${MIN_SEARCH_LENGTH} characters to search`;

  return (
    <Autocomplete
      id="upload-presenter"
      multiple
      value={selected}
      options={options}
      getOptionLabel={presenterName}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={isSearchingUsers}
      loadingText="Searching…"
      noOptionsText={noOptionsText}
      open={dropdownOpen}
      onClose={() => setDropdownOpen(false)}
      filterOptions={(x) => x}
      inputValue={presenterQuery}
      onInputChange={handleInputChange}
      onChange={(_, next) => {
        setSelected(next);
        onChange(next.map((user) => user.id));
      }}
      onBlur={onBlur}
      renderOption={(props, option, { selected: isSelected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <OptionCheckbox checked={isSelected} />
            {presenterName(option)} — {option.email}
          </li>
        );
      }}
      renderValue={(value, getItemProps) =>
        value.map((user, index) => {
          const { key, ...itemProps } = getItemProps({ index });
          // Two people can share a name; the email tells them apart.
          const hasSameName = value.some((other) => other.id !== user.id && presenterName(other) === presenterName(user));
          return (
            <Chip
              key={key}
              label={hasSameName ? `${presenterName(user)} (${user.email})` : presenterName(user)}
              size="small"
              {...itemProps}
            />
          );
        })
      }
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          placeholder="Search by name or email"
          error={!!error}
          helperText={error ?? `Type at least ${MIN_SEARCH_LENGTH} characters to search`}
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
            htmlInput: { ...params.inputProps, "aria-required": true },
          }}
        />
      )}
    />
  );
};

export const PresenterField = ({ control }: FieldProps) => (
  <Controller
    name="presenter_ids"
    control={control}
    render={({ field, fieldState }) => (
      <InputContainer>
        <FieldLabel htmlFor="upload-presenter">Presenters</FieldLabel>
        <PresenterAutocomplete
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          error={fieldState.error?.message}
        />
      </InputContainer>
    )}
  />
);

const PlaylistsAutocomplete = ({ onChange, onBlur, inputRef }: Omit<AutocompleteFieldProps<number[]>, "value" | "error">) => {
  const { data: playlists = [] } = usePlaylistsQuery();

  return (
    <Autocomplete
      id="upload-playlists"
      multiple
      options={playlists}
      disableCloseOnSelect
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, selected) => onChange(selected.map((p) => p.id))}
      onBlur={onBlur}
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
      renderInput={(params) => <TextField {...params} inputRef={inputRef} placeholder="Select playlists" />}
    />
  );
};

export const PlaylistsField = ({ control }: FieldProps) => (
  <Controller
    name="playlists"
    control={control}
    render={({ field }) => (
      <InputContainer>
        <FieldLabel htmlFor="upload-playlists" optional>
          Playlists
        </FieldLabel>
        <PlaylistsAutocomplete onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref} />
      </InputContainer>
    )}
  />
);

type TagValue = (Tag | string)[];

const TagsAutocomplete = ({ value, onChange, onBlur, inputRef }: Omit<AutocompleteFieldProps<TagValue>, "error">) => {
  const { data: allTags = [] } = useAllTagsQuery();

  return (
    <Autocomplete
      id="upload-tags"
      multiple
      freeSolo
      value={value}
      options={allTags}
      disableCloseOnSelect
      getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
      isOptionEqualToValue={(option, selected) =>
        typeof option !== "string" && typeof selected !== "string" && option.id === selected.id
      }
      onChange={(_, selected) => onChange(normalizeTagSelection(selected, allTags))}
      onBlur={onBlur}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        const label = typeof option === "string" ? option : option.name;
        return (
          <li key={key} {...optionProps}>
            <OptionCheckbox checked={selected} />#{label}
          </li>
        );
      }}
      renderValue={(selected: TagValue, getItemProps) =>
        selected.map((option, index) => {
          const label = typeof option === "string" ? option : option.name;
          const { key, ...itemProps } = getItemProps({ index });
          return <Chip key={key} label={`#${label}`} size="small" {...itemProps} />;
        })
      }
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          placeholder="Search or create tags"
          helperText="Press Enter to create a new tag"
        />
      )}
    />
  );
};

export const TagsField = ({ control }: FieldProps) => (
  <Controller
    name="tags"
    control={control}
    render={({ field }) => (
      <InputContainer>
        <FieldLabel htmlFor="upload-tags" optional>
          Tags
        </FieldLabel>
        <TagsAutocomplete value={field.value} onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref} />
      </InputContainer>
    )}
  />
);
