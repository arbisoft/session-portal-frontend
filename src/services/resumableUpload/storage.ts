import { createJsonStorage, JsonStorage, KeyValueStore } from "@/services/jsonStorage";
import { FileFingerprint } from "@/utils/upload";

// Only what is needed to find the server session again. The file itself cannot be stored: after a reload the user
// must pick it again, and the fingerprint decides whether it is the same file.
export type StoredUpload = {
  sessionId: string;
  fingerprint: FileFingerprint;
  confirmedBytes: number;
  updatedAt: number;
};

export type UploadStorage = JsonStorage<StoredUpload>;

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

export const createUploadStorage = (key: string, store?: KeyValueStore): UploadStorage =>
  createJsonStorage(key, isStoredUpload, store);
