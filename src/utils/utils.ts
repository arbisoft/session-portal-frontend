import { format, parseISO } from "date-fns";

import { BASE_URL, DEFAULT_THUMBNAIL } from "@/constants/constants";
import { Event } from "@/models/Events";

export function formatDateTime(event_time: string) {
  return format(parseISO(event_time), "MMM dd, yyyy");
}

export function trimTextLength(text: string, length: number) {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

export const convertSecondsToFormattedTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours > 0 ? hours.toString().padStart(2, "0") : "";
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  if (formattedHours) {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedMinutes}:${formattedSeconds}`;
};

export function parseNonPassedParams<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (value === false) return true;
      if (typeof value === "number") return true;
      if (typeof value === "string" || Array.isArray(value)) return value.length > 0;
      return Boolean(value);
    })
  );
}

export const initCapital = (str: string) => str && str.toLowerCase().replace(/(?:^|\s)[a-z]/g, (m) => m.toUpperCase());

export const fullName = (user?: Partial<{ first_name: string; last_name: string }>) => {
  return `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
};

export function generateYearList(startYear: number) {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push({ value: year.toString(), label: year === currentYear ? "This Year" : year.toString() });
  }

  return years;
}

export const getQueryValue = (key?: string | string[]) => {
  const value = Array.isArray(key) ? key[0] : key;
  return value ?? "";
};

export const transformVideoToCardData = (video: Event) => ({
  event_time: formatDateTime(video.event_time),
  organizer: video.presenters.map(fullName).join(", "),
  thumbnail: video.thumbnail ? BASE_URL.concat(video.thumbnail) : DEFAULT_THUMBNAIL,
  title: video.title,
  video_duration: convertSecondsToFormattedTime(video.video_duration),
  video_file: video.video_file ? BASE_URL.concat(video.video_file) : undefined,
  description: video.description,
});

export function isValidInternalRedirectPath(redirectPath?: string | null): boolean {
  if (typeof redirectPath !== "string" || redirectPath.length === 0) return false;
  if (!redirectPath.startsWith("/")) return false;
  if (redirectPath.startsWith("//")) return false;
  if (/[\\\n\r]/.test(redirectPath)) return false;
  if (redirectPath.slice(1).includes("//")) return false;

  try {
    const parsedUrl = new URL(redirectPath, "http://example.com");
    return parsedUrl.origin === "http://example.com";
  } catch {
    return false;
  }
}
