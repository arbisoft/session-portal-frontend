// A thumbnail can be several MB, which does not fit in localStorage, so the chosen image is kept in IndexedDB.
// Everything here is best effort: when IndexedDB is missing or blocked the draft simply has no thumbnail.

const DB_NAME = "upload-video-draft";
const STORE_NAME = "thumbnails";

const openDatabase = (): Promise<IDBDatabase | null> =>
  new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

const run = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> => {
  const database = await openDatabase();
  if (!database) return null;
  return new Promise<T | null>((resolve) => {
    try {
      const request = action(database.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    } finally {
      database.close();
    }
  });
};

/** Stores the image, or removes the stored one when `file` is null. */
export const saveDraftThumbnail = async (key: string, file: File | null): Promise<void> => {
  await (file ? run("readwrite", (store) => store.put(file, key)) : run("readwrite", (store) => store.delete(key)));
};

export const loadDraftThumbnail = async (key: string): Promise<File | null> => {
  const stored = await run<unknown>("readonly", (store) => store.get(key));
  return stored instanceof File ? stored : null;
};
