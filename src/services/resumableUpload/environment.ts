import { UploadNetwork } from "./types";

/** Resolves after `ms`, or as soon as `signal` aborts. Callers check `signal.aborted` afterwards. */
export const abortableSleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, ms);
    signal.addEventListener("abort", finish, { once: true });
  });

export const browserNetwork: UploadNetwork = {
  isOnline: () => typeof navigator === "undefined" || navigator.onLine !== false,
  waitForOnline: (signal) =>
    new Promise((resolve) => {
      if (browserNetwork.isOnline() || signal.aborted) {
        resolve();
        return;
      }
      const finish = () => {
        window.removeEventListener("online", finish);
        signal.removeEventListener("abort", finish);
        resolve();
      };
      window.addEventListener("online", finish);
      signal.addEventListener("abort", finish, { once: true });
    }),
};
