import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
// Run cleanup after each test
afterEach(() => {
  cleanup();
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({ "Content-Type": "application/json" }),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve("{}"),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    clone: () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({}),
      text: () => Promise.resolve("{}"),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }),
  } as Response)
);
