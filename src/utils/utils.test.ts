import { parseNonPassedParams } from "./utils";

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
