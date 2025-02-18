import { format, parseISO } from "date-fns";

export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const formatNumber = (num: number): string =>
    num.toLocaleString(undefined, {
      useGrouping: false,
      minimumIntegerDigits: 2,
    });

  return `${formatNumber(hours)}:${formatNumber(minutes)}`;
}

export function formatDateTime(event_time: string) {
  return format(parseISO(event_time), "MMM dd, yyyy");
}

export function trimTextLength(text: string, length: number) {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}
