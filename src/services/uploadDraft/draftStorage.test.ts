import { createDraftStorage, UploadDraft } from "./draftStorage";

const draft: UploadDraft = {
  title: "Quarterly talk",
  event_date: "2026-11-10T12:00:00.000Z",
  description: "What we shipped",
  presenters: [{ id: 7, first_name: "Ada", last_name: "Lovelace", full_name: "Ada Lovelace", email: "ada@arbisoft.com" }],
  playlists: [3],
  tags: [{ id: 1, name: "react" }, "brand-new"],
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

describe("createDraftStorage", () => {
  it("should round-trip a draft and clear it", () => {
    const storage = createDraftStorage("k", memoryStore());

    storage.save(draft);
    expect(storage.load()).toEqual(draft);

    storage.clear();
    expect(storage.load()).toBeNull();
  });

  it.each([
    ["not JSON", "{oops"],
    ["a different shape", JSON.stringify({ title: 1 })],
    ["a presenter without an id", JSON.stringify({ ...draft, presenters: [{ email: "a@b.c" }] })],
    ["a malformed tag", JSON.stringify({ ...draft, tags: [{ name: "no id" }] })],
    ["non-numeric playlists", JSON.stringify({ ...draft, playlists: ["3"] })],
  ])("should ignore stored data that is %s", (_name, raw) => {
    const store = memoryStore();
    store.setItem("k", raw);

    expect(createDraftStorage("k", store).load()).toBeNull();
  });

  it("should keep working when storage throws", () => {
    const blocked = {
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
    const storage = createDraftStorage("k", blocked);

    expect(() => storage.save(draft)).not.toThrow();
    expect(storage.load()).toBeNull();
    expect(() => storage.clear()).not.toThrow();
  });
});
