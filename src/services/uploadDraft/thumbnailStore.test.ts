import { loadDraftThumbnail, saveDraftThumbnail } from "./thumbnailStore";

type Listener = (() => void) | null;
type FakeRequest = { result?: unknown; onsuccess: Listener; onerror: Listener; onupgradeneeded?: Listener; onblocked?: Listener };

// A just-enough IndexedDB: one object store backed by a Map, with requests that succeed asynchronously.
const installFakeIndexedDb = (records: Map<string, unknown>) => {
  const succeed = (request: FakeRequest, result: unknown) => {
    request.result = result;
    setTimeout(() => request.onsuccess?.(), 0);
    return request;
  };
  const store = {
    put: (value: unknown, key: string) => {
      records.set(key, value);
      return succeed({ onsuccess: null, onerror: null }, key);
    },
    delete: (key: string) => {
      records.delete(key);
      return succeed({ onsuccess: null, onerror: null }, undefined);
    },
    get: (key: string) => succeed({ onsuccess: null, onerror: null }, records.get(key)),
  };
  const database = { transaction: () => ({ objectStore: () => store }), close: jest.fn(), createObjectStore: jest.fn() };
  const open = jest.fn(() => {
    const request: FakeRequest = { onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
    request.result = database;
    setTimeout(() => {
      request.onupgradeneeded?.();
      request.onsuccess?.();
    }, 0);
    return request;
  });
  Object.defineProperty(window, "indexedDB", { value: { open }, configurable: true });
  return { database, open };
};

describe("thumbnailStore", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "indexedDB");
  });

  it("should find nothing and not throw when IndexedDB is unavailable", async () => {
    // jsdom has no IndexedDB, which is the same situation as a browser that blocks it.
    await expect(loadDraftThumbnail("k")).resolves.toBeNull();
    await expect(saveDraftThumbnail("k", new File(["x"], "a.png", { type: "image/png" }))).resolves.toBeUndefined();
    await expect(saveDraftThumbnail("k", null)).resolves.toBeUndefined();
  });

  it("should store the image under the key and load it back", async () => {
    const records = new Map<string, unknown>();
    const { database } = installFakeIndexedDb(records);
    const image = new File(["x"], "a.png", { type: "image/png" });

    await saveDraftThumbnail("k", image);

    expect(records.get("k")).toBe(image);
    await expect(loadDraftThumbnail("k")).resolves.toBe(image);
    expect(database.close).toHaveBeenCalled();
  });

  it("should remove the stored image when saving null", async () => {
    const records = new Map<string, unknown>([["k", new File(["x"], "a.png")]]);
    installFakeIndexedDb(records);

    await saveDraftThumbnail("k", null);

    expect(records.has("k")).toBe(false);
    await expect(loadDraftThumbnail("k")).resolves.toBeNull();
  });

  it("should ignore a stored value that is not a file", async () => {
    installFakeIndexedDb(new Map<string, unknown>([["k", "not a file"]]));

    await expect(loadDraftThumbnail("k")).resolves.toBeNull();
  });
});
