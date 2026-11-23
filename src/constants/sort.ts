import { SortOption } from "@/models/Events";

export const DEFAULT_SORT: SortOption = "newest";

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

export const SORT_LABELS = Object.fromEntries(SORT_OPTIONS.map(({ label, value }) => [value, label])) as Record<
  SortOption,
  string
>;
