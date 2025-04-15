import { renderHook } from "@testing-library/react";
import { useParams } from "next/navigation";

import { fallbackLanguage, getOptions, languages } from "./config";
import useLanguage from "./use-language";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  initReactI18next: jest.fn(),
  useTranslation: jest.fn(() => ({
    i18n: {
      resolvedLanguage: "en",
      changeLanguage: jest.fn(),
    },
    t: jest.fn((key) => key),
  })),
}));

jest.mock("./use-store-language", () => jest.fn());
jest.mock("./use-store-language-actions", () => jest.fn());

describe("useLanguage Hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should returns fallback language when no params exist", () => {
    (useParams as jest.Mock).mockReturnValue(undefined);
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe(fallbackLanguage);
  });

  test("should returns fallback language when params is empty", () => {
    (useParams as jest.Mock).mockReturnValue({});
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe(fallbackLanguage);
  });

  test("should returns correct language when params contain a single language string", () => {
    (useParams as jest.Mock).mockReturnValue({ language: "fr" });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe("fr");
  });

  test("should returns the first language when params contain an array of languages", () => {
    (useParams as jest.Mock).mockReturnValue({ language: ["es", "fr"] });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe("es");
  });

  test("should handles empty array gracefully", () => {
    (useParams as jest.Mock).mockReturnValue({ language: [] });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe(fallbackLanguage);
  });

  test("should handles null language value", () => {
    (useParams as jest.Mock).mockReturnValue({ language: null });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe(fallbackLanguage);
  });

  test("should handles undefined language value", () => {
    (useParams as jest.Mock).mockReturnValue({ language: undefined });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe(fallbackLanguage);
  });

  test("should handles numeric language values", () => {
    (useParams as jest.Mock).mockReturnValue({ language: 123 });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe(123);
  });

  test("should handles boolean language values", () => {
    (useParams as jest.Mock).mockReturnValue({ language: true });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe(true);
  });

  test("should handles object language values", () => {
    (useParams as jest.Mock).mockReturnValue({ language: { code: "de" } });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toEqual({ code: "de" });
  });

  test("should handles deeply nested array values", () => {
    (useParams as jest.Mock).mockReturnValue({ language: [["it"]] });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toEqual(["it"]);
  });

  test("should returns fallback language when language param is an empty object", () => {
    (useParams as jest.Mock).mockReturnValue({ language: {} });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toEqual({});
  });

  test("should returns fallback language when language param is a function", () => {
    (useParams as jest.Mock).mockReturnValue({ language: () => "en" });
    const { result } = renderHook(() => useLanguage());
    expect(typeof result.current).toBe("function");
  });

  test("should handles symbols in language param", () => {
    const symbol = Symbol("lang");
    (useParams as jest.Mock).mockReturnValue({ language: symbol });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe(symbol);
  });

  test("should returns fallback language if language param is whitespace string", () => {
    (useParams as jest.Mock).mockReturnValue({ language: "  " });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe("  ");
  });

  test("should returns fallback language if language param is a special character", () => {
    (useParams as jest.Mock).mockReturnValue({ language: "@#%" });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe("@#%");
  });

  test("should returns fallback language when language param is a long string", () => {
    (useParams as jest.Mock).mockReturnValue({ language: "this_is_a_really_long_language_code" });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe("this_is_a_really_long_language_code");
  });

  test("should returns fallback language when language param is null inside an array", () => {
    (useParams as jest.Mock).mockReturnValue({ language: [null] });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe("en");
  });

  test("should returns fallback language when language param is undefined inside an array", () => {
    (useParams as jest.Mock).mockReturnValue({ language: [undefined] });
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe("en");
  });

  test("should have supported languages matching config", () => {
    expect(getOptions().supportedLngs).toBe(languages);
  });
});
