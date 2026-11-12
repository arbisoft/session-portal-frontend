import { redirect } from "next/navigation";

import Results from "./page";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock(
  "next/dynamic",
  () => () =>
    function SearchResultsPageMock() {
      return null;
    }
);

const renderPage = (search?: string | string[]) => Results({ searchParams: Promise.resolve({ search }) });

describe("Results page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([undefined, "", "   ", "%20%20".replace(/%20/g, " ")])(
    "should redirect to /videos when search is %p",
    async (search) => {
      await renderPage(search);
      expect(redirect).toHaveBeenCalledWith("/videos");
    }
  );

  it("should redirect to /videos when the first search value is blank", async () => {
    await renderPage([" ", "react"]);
    expect(redirect).toHaveBeenCalledWith("/videos");
  });

  it("should not redirect when a search term is present", async () => {
    await renderPage("react");
    expect(redirect).not.toHaveBeenCalled();
  });
});
