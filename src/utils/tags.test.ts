import { normalizeTagName, normalizeTagSelection } from "./tags";

const existing = [
  { id: 1, name: "React" },
  { id: 2, name: "Testing" },
];

describe("normalizeTagName", () => {
  it("should strip leading hashes and whitespace", () => {
    expect(normalizeTagName("  ##devops ")).toBe("devops");
  });

  it("should cap the length at the backend limit", () => {
    expect(normalizeTagName("a".repeat(150))).toHaveLength(100);
  });
});

describe("normalizeTagSelection", () => {
  it("should drop empty names such as a bare hash", () => {
    expect(normalizeTagSelection(["#", "  "], existing)).toEqual([]);
  });

  it("should replace a typed name with the existing tag of the same name, ignoring case", () => {
    expect(normalizeTagSelection(["react"], existing)).toEqual([existing[0]]);
  });

  it("should keep new names as strings without the hash", () => {
    expect(normalizeTagSelection(["#brand-new"], existing)).toEqual(["brand-new"]);
  });

  it("should remove duplicates regardless of case", () => {
    expect(normalizeTagSelection([existing[1], "TESTING", "new", "New"], existing)).toEqual([existing[1], "new"]);
  });
});
