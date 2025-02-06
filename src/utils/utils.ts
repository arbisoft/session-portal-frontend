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
