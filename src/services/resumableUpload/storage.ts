import { FileFingerprint } from "@/utils/upload";

// Only what is needed to find the server session again. The file itself cannot be stored: after a reload the user
// must pick it again, and the fingerprint decides whether it is the same file.
export type StoredUpload = {
  sessionId: string;
  fingerprint: FileFingerprint;
  confirmedBytes: number;
  updatedAt: number;
};

export interface UploadStorage {
  load(): StoredUpload | null;
  save(record: StoredUpload): void;
  clear(): void;
}

type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const isStoredUpload = (value: unknown): value is StoredUpload => {
  const record = value as StoredUpload | null;
  return (
    typeof record?.sessionId === "string" &&
    typeof record.confirmedBytes === "number" &&
    typeof record.updatedAt === "number" &&
    typeof record.fingerprint?.name === "string" &&
    typeof record.fingerprint.size === "number" &&
    typeof record.fingerprint.lastModified === "number"
  );
};

// Storage can be missing, full or blocked (private windows, site-data settings), so every access is guarded and the
// upload still works without it, only without surviving a reload.
export const createUploadStorage = (key: string, store?: KeyValueStore): UploadStorage => {
  const resolve = (): KeyValueStore | null => {
    try {
      return store ?? window.localStorage;
    } catch {
      return null;
    }
  };

  return {
    load() {
      try {
        const raw = resolve()?.getItem(key);
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        return isStoredUpload(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    save(record) {
      try {
        resolve()?.setItem(key, JSON.stringify(record));
      } catch {
        // Persistence is best effort.
      }
    },
    clear() {
      try {
        resolve()?.removeItem(key);
      } catch {
        // Persistence is best effort.
      }
    },
  };
};
