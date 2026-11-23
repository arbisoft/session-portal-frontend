import { Tag, UserSearchResult } from "@/models/Events";
import { createJsonStorage, JsonStorage, KeyValueStore } from "@/services/jsonStorage";

/**
 * The text fields of the upload form, kept so a reload during an upload brings them back together with the unfinished
 * upload. Presenters are stored as the people themselves because the form only holds their ids but must show names.
 */
export type UploadDraft = {
  title: string;
  /** ISO timestamp of the chosen session date. */
  event_date: string;
  description: string;
  presenters: UserSearchResult[];
  playlists: number[];
  tags: (Tag | string)[];
};

export type UploadDraftStorage = JsonStorage<UploadDraft>;

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");

const isPerson = (value: unknown): value is UserSearchResult => {
  const person = value as UserSearchResult | null;
  return typeof person?.id === "number" && typeof person.email === "string" && typeof person.first_name === "string";
};

const isTag = (value: unknown): value is Tag | string => {
  const tag = value as Tag | null;
  return typeof value === "string" || (typeof tag?.id === "number" && typeof tag.name === "string");
};

const isUploadDraft = (value: unknown): value is UploadDraft => {
  const draft = value as UploadDraft | null;
  return (
    typeof draft?.title === "string" &&
    typeof draft.event_date === "string" &&
    typeof draft.description === "string" &&
    Array.isArray(draft.presenters) &&
    draft.presenters.every(isPerson) &&
    isNumberArray(draft.playlists) &&
    Array.isArray(draft.tags) &&
    draft.tags.every(isTag)
  );
};

export const createDraftStorage = (key: string, store?: KeyValueStore): UploadDraftStorage =>
  createJsonStorage(key, isUploadDraft, store);
