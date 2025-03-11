import "@testing-library/jest-dom";
import "whatwg-fetch";
import { cleanup } from "@testing-library/react";
// Run cleanup after each test
afterEach(() => {
  cleanup();
});

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
