import { TAG_MAX_LENGTH } from "@/constants/constants";
import { Tag } from "@/models/Events";

export const normalizeTagName = (name: string): string => name.trim().replace(/^#+/, "").trim().slice(0, TAG_MAX_LENGTH);

/**
 * Cleans the tag selection: strips "#", drops empty and duplicate entries (case-insensitive) and swaps a typed name for
 * the existing tag with the same name, so "react" never creates a second tag next to "React".
 */
export const normalizeTagSelection = (selected: (Tag | string)[], existing: Tag[]): (Tag | string)[] => {
  const seen = new Set<string>();
  const result: (Tag | string)[] = [];

  selected.forEach((item) => {
    const name = typeof item === "string" ? normalizeTagName(item) : item.name;
    const key = name.toLowerCase();
    if (!name || seen.has(key)) return;
    seen.add(key);
    result.push(typeof item === "string" ? (existing.find((tag) => tag.name.toLowerCase() === key) ?? name) : item);
  });

  return result;
};
