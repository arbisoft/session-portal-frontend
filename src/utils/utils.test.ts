import {
  parseNonPassedParams,
  formatDateTime,
  trimTextLength,
  convertSecondsToFormattedTime,
  initCapital,
  fullName,
} from "./utils";

describe("parseNonPassedParams", () => {
  test("should remove empty strings and empty arrays but keep false values", () => {
    const input = {
      name: "John",
      age: 30,
      active: false,
      emptyString: "",
      emptyArray: [],
      validArray: [1, 2, 3],
      validString: "Hello",
    };

    const expectedOutput = {
      name: "John",
      age: 30,
      active: false,
      validArray: [1, 2, 3],
      validString: "Hello",
    };

    expect(parseNonPassedParams(input)).toEqual(expectedOutput);
  });

  test("should remove null and undefined values", () => {
    const input = {
      key1: null,
      key2: undefined,
      key3: "Valid",
      key4: 0,
      key5: false,
    };

    const expectedOutput = {
      key3: "Valid",
      key4: 0,
      key5: false,
    };

    expect(parseNonPassedParams(input)).toEqual(expectedOutput);
  });

  test("should keep boolean false values but remove empty strings and arrays", () => {
    const input = {
      foo: "",
      bar: [],
      baz: false,
    };

    const expectedOutput = {
      baz: false,
    };

    expect(parseNonPassedParams(input)).toEqual(expectedOutput);
  });

  test("should keep numbers and truthy values", () => {
    const input = {
      a: 0,
      b: 1,
      c: "hello",
      d: "",
      e: [],
      f: [1, 2, 3],
    };

    const expectedOutput = {
      a: 0,
      b: 1,
      c: "hello",
      f: [1, 2, 3],
    };

    expect(parseNonPassedParams(input)).toEqual(expectedOutput);
  });
});

describe("formatDateTime", () => {
  test("should format ISO date string to 'MMM dd, yyyy' format", () => {
    const date = "2023-10-05T12:00:00Z";
    expect(formatDateTime(date)).toBe("Oct 05, 2023");
  });
});

describe("trimTextLength", () => {
  test("should trim text longer than specified length and add ellipsis", () => {
    const text = "This is a long text";
    expect(trimTextLength(text, 10)).toBe("This is a ...");
  });

  test("should return the same text if it is shorter than specified length", () => {
    const text = "Short";
    expect(trimTextLength(text, 10)).toBe("Short");
  });
});

describe("convertSecondsToFormattedTime", () => {
  test("should convert seconds to 'HH:MM:SS' format when hours are present", () => {
    expect(convertSecondsToFormattedTime(3661)).toBe("01:01:01");
  });

  test("should convert seconds to 'MM:SS' format when hours are not present", () => {
    expect(convertSecondsToFormattedTime(125)).toBe("02:05");
  });

  test("should handle zero seconds", () => {
    expect(convertSecondsToFormattedTime(0)).toBe("00:00");
  });
});

describe("initCapital", () => {
  test("should capitalize the first letter of each word", () => {
    expect(initCapital("hello world")).toBe("Hello World");
  });

  test("should handle empty string", () => {
    expect(initCapital("")).toBe("");
  });
});

describe("fullName", () => {
  test("should return full name with capitalized first and last names", () => {
    const user = { first_name: "john", last_name: "doe" };
    expect(fullName(user)).toBe("John Doe");
  });

  test("should handle missing first or last name", () => {
    const user1 = { first_name: "john" };
    const user2 = { last_name: "doe" };
    expect(fullName(user1)).toBe("John");
    expect(fullName(user2)).toBe("Doe");
  });

  test("should return empty string for undefined user", () => {
    expect(fullName()).toBe("");
  });
});

describe("BASE_URL constant", () => {
  beforeEach(() => {
    jest.resetModules(); // Reset module cache to re-import process.env values
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  test("should use NEXT_PUBLIC_BASE_URL when defined", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BASE_URL } = require("./constants");

    expect(BASE_URL).toBe("https://example.com");
  });

  test("should default to an empty string when NEXT_PUBLIC_BASE_URL is undefined", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BASE_URL } = require("./constants");

    expect(BASE_URL).toBe("");
  });
});
