import { parseError } from "./parseError";

describe("parseError", () => {
  it("should return generic message when statusCode is not a number or is 500", () => {
    expect(parseError("some error", "CUSTOM_ERROR")).toEqual([{ statusCode: "CUSTOM_ERROR", message: "Something went wrong." }]);
    expect(parseError("server error", 500)).toEqual([{ statusCode: 500, message: "Something went wrong." }]);
  });

  it("should return the error message when error is a string", () => {
    expect(parseError("Invalid request", 400)).toEqual([{ statusCode: 400, message: "Invalid request" }]);
  });

  it("should recursively parse errors when error is an array", () => {
    expect(parseError(["Error 1", "Error 2"], 400)).toEqual([
      { statusCode: 400, message: "Error 1" },
      { statusCode: 400, message: "Error 2" },
    ]);
  });

  it("should handle object errors with simple key-value pairs", () => {
    expect(parseError({ email: "Invalid email" }, 422)).toEqual([{ statusCode: 422, message: "Email: Invalid email" }]);
  });

  it("should handle object errors with array values", () => {
    expect(parseError({ errors: ["Error 1", "Error 2"] }, 400)).toEqual([
      { statusCode: 400, message: "Errors: Error 1" },
      { statusCode: 400, message: "Errors: Error 2" },
    ]);
  });

  it("should handle object errors with nested object values", () => {
    expect(parseError({ user: { name: "Required" } }, 400)).toEqual([{ statusCode: 400, message: "User: Name: Required" }]);
  });

  it("should handle object errors with null or undefined values", () => {
    expect(parseError({ key1: null, key2: undefined }, 400)).toEqual([
      { statusCode: 400, message: "Key1: unknown value" },
      { statusCode: 400, message: "Key2: unknown value" },
    ]);
  });

  it("should handle deeply nested error structures", () => {
    const error = {
      user: {
        profile: {
          email: ["Invalid email"],
          age: null,
        },
      },
    };
    expect(parseError(error, 400)).toEqual([
      { statusCode: 400, message: "User: Profile: Email: Invalid email" },
      { statusCode: 400, message: "User: Profile: Age: unknown value" },
    ]);
  });

  it("should return fallback error message for unknown types", () => {
    expect(parseError(12345, 400)).toEqual([{ statusCode: 400, message: "Something went wrong." }]);
    expect(parseError(undefined, 400)).toEqual([{ statusCode: 400, message: "Something went wrong." }]);
  });
});
