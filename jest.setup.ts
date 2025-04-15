import "@testing-library/jest-dom";
import "whatwg-fetch";
import { cleanup } from "@testing-library/react";
import { enableFetchMocks } from "jest-fetch-mock";

// Mock base URL
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:1234";

enableFetchMocks();

jest.mock("@/hooks/useFeatureFlags", () => ({
  __esModule: true,
  useFeatureFlags: jest.fn(),
}));

afterEach(() => cleanup());
beforeEach(() => fetchMock.resetMocks());

// @ts-ignore
global.preloadedState = {
  login: {
    session: {
      refresh: "test-refresh",
      access: "test-access",
      user_info: {
        avatar: undefined,
        first_name: "Test",
        full_name: "Test User",
        last_name: "User",
      },
    },
    error: null,
    isLoading: false,
  },
};
