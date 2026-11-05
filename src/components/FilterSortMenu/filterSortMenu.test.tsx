import { sendGTMEvent } from "@next/third-parties/google";

import { customRender, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import FilterSortMenu from "./filterSortMenu";
import { FilterSortMenuProps } from "./types";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

describe("FilterSortMenu", () => {
  const years = [
    { label: "This Year", value: "2026" },
    { label: "2025", value: "2025" },
  ];

  const renderMenu = (props: Partial<FilterSortMenuProps> = {}) => {
    const anchorEl = document.body.appendChild(document.createElement("button"));
    const handlers = { onClear: jest.fn(), onClose: jest.fn(), onSortChange: jest.fn(), onYearChange: jest.fn() };
    customRender(<FilterSortMenu anchorEl={anchorEl} availableYears={years} sort="newest" {...handlers} {...props} />);
    return handlers;
  };

  beforeEach(() => jest.clearAllMocks());

  it("should render nothing while there is no anchor element", () => {
    renderMenu({ anchorEl: null });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("should list the sort options and years with the current ones checked", () => {
    renderMenu({ sort: "oldest", year: "2025" });

    expect(screen.getByRole("menuitemradio", { name: "Newest first" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("menuitemradio", { name: "Oldest first" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "This Year" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("menuitemradio", { name: "2025" })).toHaveAttribute("aria-checked", "true");
  });

  it("should report a sort change, track it and close", () => {
    const { onSortChange, onClose } = renderMenu();

    fireEvent.click(screen.getByRole("menuitemradio", { name: "Oldest first" }));

    expect(onSortChange).toHaveBeenCalledWith("oldest");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.VIDEO_SORT_CHANGE,
      event_category: ANALYTICS_CATEGORY.VIDEOS_LISTING,
      sort: "oldest",
    });
  });

  it("should report a year change, track it and close", () => {
    const { onYearChange, onClose } = renderMenu();

    fireEvent.click(screen.getByRole("menuitemradio", { name: "2025" }));

    expect(onYearChange).toHaveBeenCalledWith("2025");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.VIDEO_FILTER_YEAR,
      event_category: ANALYTICS_CATEGORY.VIDEOS_LISTING,
      year: "2025",
    });
  });

  it("should clear the filters, track it and close", () => {
    const { onClear, onClose } = renderMenu();

    fireEvent.click(screen.getByRole("menuitem", { name: "Clear all filters" }));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.VIDEO_FILTER_CLEAR,
      event_category: ANALYTICS_CATEGORY.VIDEOS_LISTING,
    });
  });

  it("should close on Escape", async () => {
    const { onClose } = renderMenu();

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("should label the menu with the element that opened it", () => {
    renderMenu({ labelledBy: "opener" });

    expect(screen.getByRole("menu")).toHaveAttribute("aria-labelledby", "opener");
  });
});
