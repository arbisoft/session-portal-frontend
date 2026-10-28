import { useEffect, useRef, useState } from "react";

// Shorter samples are too noisy to turn into a speed or time estimate.
const MIN_SAMPLE_SECONDS = 3;

type Baseline = { time: number; percent: number };

/**
 * Average transfer speed (bytes/second) since the transfer last started or resumed, or null while there is not
 * enough data. Progress only moves in whole percents, so the estimate is a running average rather than an instant rate.
 */
export const useUploadRate = (percent: number, totalBytes: number, isTransferring: boolean): number | null => {
  const baseline = useRef<Baseline | null>(null);
  const [bytesPerSecond, setBytesPerSecond] = useState<number | null>(null);

  useEffect(() => {
    if (!isTransferring) {
      baseline.current = null;
      setBytesPerSecond(null);
      return;
    }
    const now = Date.now();
    if (!baseline.current) {
      baseline.current = { time: now, percent };
      return;
    }
    const elapsedSeconds = (now - baseline.current.time) / 1000;
    const sentBytes = ((percent - baseline.current.percent) / 100) * totalBytes;
    if (elapsedSeconds >= MIN_SAMPLE_SECONDS && sentBytes > 0) setBytesPerSecond(sentBytes / elapsedSeconds);
  }, [percent, totalBytes, isTransferring]);

  return bytesPerSecond;
};
