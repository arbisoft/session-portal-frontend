import { createUploadStorage, StoredUpload } from "./storage";

const record: StoredUpload = {
  sessionId: "abc",
  fingerprint: { name: "talk.mp4", size: 10, lastModified: 5 },
  confirmedBytes: 4,
  updatedAt: 99,
};

const memoryStore = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    data,
  };
};

describe("createUploadStorage", () => {
  it("should round-trip a record and clear it", () => {
    const store = memoryStore();
    const storage = createUploadStorage("k", store);

    storage.save(record);
    expect(storage.load()).toEqual(record);

    storage.clear();
    expect(storage.load()).toBeNull();
  });

  it("should store only session metadata, never file content or tokens", () => {
    const store = memoryStore();

    createUploadStorage("k", store).save(record);

    expect(Object.keys(JSON.parse(store.data.get("k") as string)).sort()).toEqual([
      "confirmedBytes",
      "fingerprint",
      "sessionId",
      "updatedAt",
    ]);
  });

  it.each([
    "not json",
    "null",
    "{}",
    JSON.stringify({ ...record, sessionId: 5 }),
    JSON.stringify({ ...record, fingerprint: null }),
  ])("should ignore a corrupted record: %s", (raw) => {
    const store = memoryStore();
    store.setItem("k", raw);

    expect(createUploadStorage("k", store).load()).toBeNull();
  });

  it("should keep working when storage throws", () => {
    const failing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const storage = createUploadStorage("k", failing);

    expect(() => storage.save(record)).not.toThrow();
    expect(() => storage.clear()).not.toThrow();
    expect(storage.load()).toBeNull();
  });

  it("should use localStorage by default and survive it being inaccessible", () => {
    const storage = createUploadStorage("default-key");
    storage.save(record);
    expect(window.localStorage.getItem("default-key")).not.toBeNull();
    storage.clear();

    const spy = jest.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(createUploadStorage("default-key").load()).toBeNull();
    spy.mockRestore();
  });
});
