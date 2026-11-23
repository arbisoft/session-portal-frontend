import { useEffect, useRef, useState } from "react";

// Shorter samples are too noisy to turn into a speed or time estimate.
const MIN_SAMPLE_SECONDS = 2;

type Baseline = { time: number; sentBytes: number };

/**
 * Average transfer speed (bytes/second) since the transfer last started or resumed, or null while there is not
 * enough data. It is a running average rather than an instant rate, so it settles instead of jumping.
 */
export const useUploadRate = (sentBytes: number, isTransferring: boolean): number | null => {
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
      baseline.current = { time: now, sentBytes };
      return;
    }
    const elapsedSeconds = (now - baseline.current.time) / 1000;
    const transferred = sentBytes - baseline.current.sentBytes;
    if (elapsedSeconds >= MIN_SAMPLE_SECONDS && transferred > 0) setBytesPerSecond(transferred / elapsedSeconds);
  }, [sentBytes, isTransferring]);

  return bytesPerSecond;
};
