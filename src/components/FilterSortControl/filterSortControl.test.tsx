import { customRender, fireEvent, screen } from "@/jest/utils/testUtils";

import FilterSortControl from "./filterSortControl";
import { FilterSortControlProps } from "./types";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

describe("FilterSortControl", () => {
  const years = [
    { label: "This Year", value: "2026" },
    { label: "2020", value: "2020" },
  ];

  const renderControl = (props: Partial<FilterSortControlProps> = {}) => {
    const handlers = { onClear: jest.fn(), onSortChange: jest.fn(), onYearChange: jest.fn() };
    customRender(<FilterSortControl availableYears={years} sort="newest" {...handlers} {...props} />);
    return handlers;
  };

  it("should show the visible label and the current sort", () => {
    renderControl();

    expect(screen.getByText("Filter and Sort")).toBeVisible();
    expect(screen.getByRole("button", { name: /Filter and Sort/ })).toHaveTextContent("Newest first");
  });

  it("should include the year in the current choice when one is applied", () => {
    renderControl({ sort: "oldest", year: "2020" });

    expect(screen.getByRole("button", { name: /Filter and Sort/ })).toHaveTextContent("2020 · Oldest first");
  });

  it("should open the menu from the button and report a picked year", () => {
    const { onYearChange } = renderControl();
    const button = screen.getByRole("button", { name: /Filter and Sort/ });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toHaveAttribute("aria-labelledby", expect.stringContaining("-label"));

    fireEvent.click(screen.getByRole("menuitemradio", { name: "2020" }));
    expect(onYearChange).toHaveBeenCalledWith("2020");
  });
});
