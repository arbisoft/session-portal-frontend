/** @jest-environment node */
import { GET } from "./route";

describe("health route", () => {
  it("should report ok", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
