/** @jest-environment node */
import { GET, HEAD } from "./route";

describe("video route without a slug", () => {
  it.each([
    ["GET", GET],
    ["HEAD", HEAD],
  ])("should answer %s with 400 Invalid video", async (_method, handler) => {
    const response = handler();

    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toEqual({ message: "Invalid video" });
  });
});
