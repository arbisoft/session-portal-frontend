import { format, parseISO } from "date-fns";

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
  return `${initCapital(user?.first_name ?? "")} ${initCapital(user?.last_name ?? "")}`.trim();
};
