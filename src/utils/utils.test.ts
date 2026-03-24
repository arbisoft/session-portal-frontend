import { Event } from "@/models/Events";

import {
  parseNonPassedParams,
  formatDateTime,
  trimTextLength,
  convertSecondsToFormattedTime,
  initCapital,
  fullName,
  generateYearList,
  getQueryValue,
  transformVideoToCardData,
  isValidInternalRedirectPath,
} from "./utils";

describe("parseNonPassedParams", () => {
  it("should remove empty strings and empty arrays but keep false values", () => {
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

  it("should remove null and undefined values", () => {
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

  it("should keep boolean false values but remove empty strings and arrays", () => {
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

  it("should keep numbers and truthy values", () => {
    const input = {
      a: 0,
      b: 1,
      c: "hello",
      d: "",
      e: [],
      f: [1, 2, 3],
      g: { nested: true },
      h: true,
    };

    const expectedOutput = {
      a: 0,
      b: 1,
      c: "hello",
      f: [1, 2, 3],
      g: { nested: true },
      h: true,
    };

    expect(parseNonPassedParams(input)).toEqual(expectedOutput);
  });
});

describe("formatDateTime", () => {
  it("should format ISO date string to 'MMM dd, yyyy' format", () => {
    const date = "2023-10-05T12:00:00Z";
    expect(formatDateTime(date)).toBe("Oct 05, 2023");
  });
});

describe("trimTextLength", () => {
  it("should trim text longer than specified length and add ellipsis", () => {
    const text = "This is a long text";
    expect(trimTextLength(text, 10)).toBe("This is a ...");
  });

  it("should return the same text if it is shorter than specified length", () => {
    const text = "Short";
    expect(trimTextLength(text, 10)).toBe("Short");
  });
});

describe("convertSecondsToFormattedTime", () => {
  it("should returns 00:00 when seconds is 0", () => {
    expect(convertSecondsToFormattedTime(0)).toBe("00:00");
  });

  it("should formats seconds less than 10 correctly", () => {
    expect(convertSecondsToFormattedTime(5)).toBe("00:05");
  });

  it("should formats seconds less than a minute correctly", () => {
    expect(convertSecondsToFormattedTime(45)).toBe("00:45");
  });

  it("should formats exactly one minute", () => {
    expect(convertSecondsToFormattedTime(60)).toBe("01:00");
  });

  it("should formats minutes and seconds correctly", () => {
    expect(convertSecondsToFormattedTime(125)).toBe("02:05");
  });

  it("should formats exactly one hour", () => {
    expect(convertSecondsToFormattedTime(3600)).toBe("01:00:00");
  });

  it("should formats hours, minutes, and seconds correctly", () => {
    expect(convertSecondsToFormattedTime(3665)).toBe("01:01:05");
  });

  it("should formats hours with padded values", () => {
    expect(convertSecondsToFormattedTime(7322)).toBe("02:02:02");
  });

  it("should handles large durations correctly", () => {
    expect(convertSecondsToFormattedTime(86399)).toBe("23:59:59");
  });

  it("should handles exactly one hour minus one second", () => {
    expect(convertSecondsToFormattedTime(3599)).toBe("59:59");
  });

  it("should handles hour with zero minutes and seconds", () => {
    expect(convertSecondsToFormattedTime(7200)).toBe("02:00:00");
  });

  it("should handles minutes with zero seconds", () => {
    expect(convertSecondsToFormattedTime(180)).toBe("03:00");
  });

  it("should handles seconds producing single digit minutes", () => {
    expect(convertSecondsToFormattedTime(65)).toBe("01:05");
  });

  it("should handles seconds producing single digit seconds", () => {
    expect(convertSecondsToFormattedTime(61)).toBe("01:01");
  });
});

describe("initCapital", () => {
  it("should capitalize the first letter of each word", () => {
    expect(initCapital("hello world")).toBe("Hello World");
  });

  it("should handle empty string", () => {
    expect(initCapital("")).toBe("");
  });
});

describe("fullName", () => {
  it("should return full name with capitalized first and last names", () => {
    const user = { first_name: "john", last_name: "doe" };
    expect(fullName(user)).toBe("john doe");
  });

  it("should handle missing first or last name", () => {
    const user1 = { first_name: "john" };
    const user2 = { last_name: "doe" };
    expect(fullName(user1)).toBe("john");
    expect(fullName(user2)).toBe("doe");
  });

  it("should return empty string for undefined user", () => {
    expect(fullName()).toBe("");
  });
});

describe("isValidInternalRedirectPath", () => {
  it("should allow simple internal paths", () => {
    expect(isValidInternalRedirectPath("/videos/123")).toBe(true);
    expect(isValidInternalRedirectPath("/")).toBe(true);
  });

  it("should reject external protocol-relative paths", () => {
    expect(isValidInternalRedirectPath("//evil.com")).toBe(false);
    expect(isValidInternalRedirectPath("///evil.com")).toBe(false);
  });

  it("should reject paths with double slashes after first slash", () => {
    expect(isValidInternalRedirectPath("/videos//123")).toBe(false);
  });

  it("should reject non-leading-slash or empty paths", () => {
    expect(isValidInternalRedirectPath("http://example.com")).toBe(false);
    expect(isValidInternalRedirectPath("/\nfoo")).toBe(false);
    expect(isValidInternalRedirectPath("")).toBe(false);
    expect(isValidInternalRedirectPath(null)).toBe(false);
  });
});

describe("BASE_URL constant", () => {
  beforeEach(() => {
    jest.resetModules(); // Reset module cache to re-import process.env values
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  it("should use NEXT_PUBLIC_BASE_URL when defined", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    const { BASE_URL } = require("../constants/constants");

    expect(BASE_URL).toBe("https://example.com");
  });

  it("should default to an empty string when NEXT_PUBLIC_BASE_URL is undefined", () => {
    const { BASE_URL } = require("../constants/constants");

    expect(BASE_URL).toBe("");
  });
});

describe("generateYearList", () => {
  beforeEach(() => {
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2023);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should generate a list of years starting from the current year to the start year", () => {
    const startYear = 2020;
    const expectedOutput = [
      { value: "2023", label: "This Year" },
      { value: "2022", label: "2022" },
      { value: "2021", label: "2021" },
      { value: "2020", label: "2020" },
    ];
    const result = generateYearList(startYear);
    expect(result).toEqual(expectedOutput);
  });

  it("should return an array with 'This Year' only if startYear is the current year", () => {
    const startYear = 2023;
    const expectedOutput = [{ value: "2023", label: "This Year" }];
    const result = generateYearList(startYear);
    expect(result).toEqual(expectedOutput);
  });

  it("should return an empty array if startYear is greater than the current year", () => {
    const startYear = 2024;
    const expectedOutput: string[] = [];
    const result = generateYearList(startYear);
    expect(result).toEqual(expectedOutput);
  });
});

describe("getQueryValue", () => {
  it("returns first element if array is passed", () => {
    expect(getQueryValue(["abc", "def"])).toBe("abc");
  });

  it("returns the same string if string is passed", () => {
    expect(getQueryValue("xyz")).toBe("xyz");
  });

  it("returns empty string when undefined is passed", () => {
    expect(getQueryValue(undefined)).toBe("");
  });
});

describe("transformVideoToCardData", () => {
  it("should transform event data to card data format", () => {
    const mockEvent = {
      event_time: "2023-10-05T12:00:00Z",
      presenters: [{ first_name: "John", last_name: "Doe" }],
      thumbnail: "thumb.jpg",
      title: "Test Video",
      video_duration: 125,
      video_file: "video.mp4",
      description: "Test description",
    };

    const result = transformVideoToCardData(mockEvent as Event);

    expect(result).toEqual({
      event_time: "Oct 05, 2023",
      organizer: "John Doe",
      thumbnail: "http://localhost:1234thumb.jpg",
      title: "Test Video",
      video_duration: "02:05",
      video_file: "http://localhost:1234video.mp4",
      description: "Test description",
    });
  });

  it("should handle missing thumbnail and video_file", () => {
    const mockEvent = {
      event_time: "2023-10-05T12:00:00Z",
      presenters: [],
      thumbnail: null,
      title: "Test Video",
      video_duration: 0,
      video_file: null,
      description: "Test description",
    };

    const result = transformVideoToCardData(mockEvent as unknown as Event);

    expect(result.thumbnail).toBe("/assets/images/temp-youtube-logo.webp");
    expect(result.video_file).toBeUndefined();
    expect(result.organizer).toBe("");
  });
});
