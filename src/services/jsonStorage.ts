export type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface JsonStorage<T> {
  load(): T | null;
  save(value: T): void;
  clear(): void;
}

// Storage can be missing, full or blocked (private windows, site-data settings), so every access is guarded and the
// feature keeps working without it, only without surviving a reload. Stored data is checked on read and dropped
// when it has the wrong shape.
export const createJsonStorage = <T>(
  key: string,
  isValid: (value: unknown) => value is T,
  store?: KeyValueStore
): JsonStorage<T> => {
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
        return isValid(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    save(value) {
      try {
        resolve()?.setItem(key, JSON.stringify(value));
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
