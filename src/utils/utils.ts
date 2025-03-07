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
