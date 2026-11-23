import { sendGTMEvent } from "@next/third-parties/google";

import { customRender, fireEvent, screen } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import ActiveFilters from "./activeFilters";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

describe("ActiveFilters", () => {
  const renderFilters = (props: Partial<React.ComponentProps<typeof ActiveFilters>> = {}) => {
    const handlers = { onClearAll: jest.fn(), onClearSort: jest.fn(), onClearYear: jest.fn() };
    customRender(<ActiveFilters sort="newest" {...handlers} {...props} />);
    return handlers;
  };

  beforeEach(() => jest.clearAllMocks());

  it("should render nothing for the default sort and no year", () => {
    renderFilters();

    expect(screen.queryByTestId("active-filters")).not.toBeInTheDocument();
  });

  it("should show a year chip and a clear action when a year is applied", () => {
    renderFilters({ year: "2020" });

    expect(screen.getByRole("group", { name: "Active filters" })).toBeInTheDocument();
    expect(screen.getByText("Year: 2020")).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeVisible();
    expect(screen.queryByText(/^Sort:/)).not.toBeInTheDocument();
  });

  it("should show a sort chip only when the order is not the default", () => {
    renderFilters({ sort: "oldest" });

    expect(screen.getByText("Sort: Oldest first")).toBeVisible();
    expect(screen.queryByText(/^Year:/)).not.toBeInTheDocument();
  });

  it("should remove the year and track it when its chip is activated", () => {
    const { onClearYear } = renderFilters({ year: "2020" });

    fireEvent.click(screen.getByRole("button", { name: "Remove filter Year: 2020" }));

    expect(onClearYear).toHaveBeenCalledTimes(1);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.VIDEO_FILTER_REMOVE,
      event_category: ANALYTICS_CATEGORY.VIDEOS_LISTING,
      filter: "year",
    });
  });

  it("should reset the sort and track it when its chip is activated", () => {
    const { onClearSort } = renderFilters({ sort: "oldest" });

    fireEvent.click(screen.getByRole("button", { name: "Remove filter Sort: Oldest first" }));

    expect(onClearSort).toHaveBeenCalledTimes(1);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.VIDEO_FILTER_REMOVE,
      event_category: ANALYTICS_CATEGORY.VIDEOS_LISTING,
      filter: "sort",
    });
  });

  it("should clear everything and track the source when Clear filters is pressed", () => {
    const { onClearAll } = renderFilters({ year: "2020", sort: "oldest" });

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onClearAll).toHaveBeenCalledTimes(1);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.VIDEO_FILTER_CLEAR,
      event_category: ANALYTICS_CATEGORY.VIDEOS_LISTING,
      source: "active_filters",
    });
  });
});
