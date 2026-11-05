import { act, customRender, screen, fireEvent } from "@/jest/utils/testUtils";

import ReadMore from "./readMore";

describe("ReadMore Component", () => {
  const text =
    // eslint-disable-next-line max-len
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum accumsan arcu in nunc pharetra, ac consectetur nulla bibendum.";

  it("renders the initial text correctly", () => {
    customRender(<ReadMore text={text} amountOfWords={5} showMoreText="Read more" showLessText="Read less" />);

    expect(screen.getByTestId("hidden-text")).not.toHaveTextContent(/Lorem ipsum dolor sit amet/);
    expect(screen.getByTestId("hidden-text")).toHaveTextContent(/consectetur adipiscing elit/);
    expect(screen.getByTestId("hidden-text")).toHaveClass("hidden");
    const showMoreButton = screen.getByTestId("show-more-button");
    expect(showMoreButton).toHaveTextContent("Read more");
    expect(showMoreButton).not.toHaveTextContent("Read less");
  });

  it("expands and collapses text when clicking 'Read more' and 'Read less'", () => {
    customRender(<ReadMore text={text} amountOfWords={5} showMoreText="Read more" showLessText="Read less" />);

    const showMoreButton = screen.getByText("Read more");
    expect(showMoreButton).toBeInTheDocument();

    fireEvent.click(showMoreButton);
    expect(screen.getByTestId("hidden-text")).not.toHaveClass("hidden");
    expect(screen.getByText("Read less")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Read less"));
    expect(screen.getByTestId("hidden-text")).toHaveClass("hidden");
  });

  it("toggles expansion with keyboard (Enter and Space keys)", () => {
    customRender(<ReadMore text={text} amountOfWords={5} showMoreText="Read more" showLessText="Read less" />);

    const showMoreButton = screen.getByTestId("show-more-button");

    fireEvent.keyDown(showMoreButton, { key: "Enter" });
    expect(screen.getByTestId("hidden-text")).not.toHaveClass("hidden");

    fireEvent.keyDown(showMoreButton, { key: " " });
    expect(screen.getByTestId("hidden-text")).toHaveClass("hidden");
  });

  it("calls onToggle with the new expanded state in word-limit mode", () => {
    const onToggle = jest.fn();
    customRender(
      <ReadMore text={text} amountOfWords={5} showMoreText="Read more" showLessText="Read less" onToggle={onToggle} />
    );

    fireEvent.click(screen.getByTestId("show-more-button"));
    fireEvent.click(screen.getByTestId("show-more-button"));

    expect(onToggle.mock.calls).toEqual([[true], [false]]);
  });

  it("does not show 'Read more' button if text is shorter than amountOfWords", () => {
    customRender(<ReadMore text="Short text" amountOfWords={10} showMoreText="Read more" showLessText="Read less" />);

    expect(screen.getByText("Short text")).toBeInTheDocument();
    expect(screen.queryByText("Read more")).not.toBeInTheDocument();
  });

  it("should match snapshot", () => {
    const { asFragment } = customRender(
      <ReadMore amountOfWords={10} text={text} showMoreText="Read more" showLessText="Read less" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("ReadMore line clamp mode", () => {
  const longText = "A long description. ".repeat(60);
  const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
  const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");

  const mockHeights = (scrollHeight: number, clientHeight: number) => {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, value: scrollHeight });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, value: clientHeight });
  };

  // jsdom defines these on Element.prototype, so there is usually no own descriptor to restore: delete the mock instead.
  const restore = (property: "scrollHeight" | "clientHeight", original?: PropertyDescriptor) => {
    if (original) Object.defineProperty(HTMLElement.prototype, property, original);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[property];
  };

  afterEach(() => {
    restore("scrollHeight", originalScrollHeight);
    restore("clientHeight", originalClientHeight);
  });

  it("should clamp the text to maxLines and offer to show more when it overflows", () => {
    mockHeights(200, 80);
    customRender(<ReadMore text={longText} maxLines={4} showMoreText="Show More" showLessText="Show Less" />);

    const clamped = screen.getByTestId("clamped-text");
    expect(clamped).toHaveClass("clamped");
    expect(clamped.style.getPropertyValue("--read-more-max-lines")).toBe("4");
    expect(screen.getByTestId("show-more-button")).toHaveTextContent("Show More");
  });

  it("should expand and collapse the clamped text", () => {
    mockHeights(200, 80);
    customRender(<ReadMore text={longText} maxLines={4} showMoreText="Show More" showLessText="Show Less" />);

    fireEvent.click(screen.getByTestId("show-more-button"));
    expect(screen.getByTestId("clamped-text")).not.toHaveClass("clamped");
    expect(screen.getByTestId("show-more-button")).toHaveTextContent("Show Less");
    expect(screen.getByTestId("show-more-button")).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByTestId("show-more-button"));
    expect(screen.getByTestId("clamped-text")).toHaveClass("clamped");
  });

  it("should toggle the clamped text with the Enter and Space keys", () => {
    mockHeights(200, 80);
    customRender(<ReadMore text={longText} maxLines={4} showMoreText="Show More" showLessText="Show Less" />);

    fireEvent.keyDown(screen.getByTestId("show-more-button"), { key: "Enter" });
    expect(screen.getByTestId("clamped-text")).not.toHaveClass("clamped");

    fireEvent.keyDown(screen.getByTestId("show-more-button"), { key: " " });
    expect(screen.getByTestId("clamped-text")).toHaveClass("clamped");
  });

  it("should not show a toggle when the text fits within maxLines", () => {
    mockHeights(60, 60);
    customRender(<ReadMore text="Short description" maxLines={4} showMoreText="Show More" showLessText="Show Less" />);

    expect(screen.getByText("Short description")).toBeInTheDocument();
    expect(screen.queryByTestId("show-more-button")).not.toBeInTheDocument();
  });

  it("should re-measure on window resize", () => {
    mockHeights(60, 60);
    customRender(<ReadMore text={longText} maxLines={4} showMoreText="Show More" showLessText="Show Less" />);
    expect(screen.queryByTestId("show-more-button")).not.toBeInTheDocument();

    mockHeights(200, 80);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(screen.getByTestId("show-more-button")).toBeInTheDocument();
  });

  it("should remove the toggle when a resize makes the text fit", () => {
    mockHeights(200, 80);
    customRender(<ReadMore text={longText} maxLines={4} showMoreText="Show More" showLessText="Show Less" />);
    expect(screen.getByTestId("show-more-button")).toBeInTheDocument();

    mockHeights(60, 60);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(screen.queryByTestId("show-more-button")).not.toBeInTheDocument();
  });

  it("should collapse again when the text changes", () => {
    mockHeights(200, 80);
    const { rerender } = customRender(
      <ReadMore text={longText} maxLines={4} showMoreText="Show More" showLessText="Show Less" />
    );
    fireEvent.click(screen.getByTestId("show-more-button"));
    expect(screen.getByTestId("clamped-text")).not.toHaveClass("clamped");

    rerender(<ReadMore text="Another description. " maxLines={4} showMoreText="Show More" showLessText="Show Less" />);

    expect(screen.getByTestId("clamped-text")).toHaveClass("clamped");
  });

  it("should call onToggle with the new expanded state on click and keyboard toggles", () => {
    mockHeights(200, 80);
    const onToggle = jest.fn();
    customRender(<ReadMore text={longText} maxLines={4} showMoreText="Show More" showLessText="Show Less" onToggle={onToggle} />);

    fireEvent.click(screen.getByTestId("show-more-button"));
    fireEvent.keyDown(screen.getByTestId("show-more-button"), { key: "Enter" });

    expect(onToggle).toHaveBeenNthCalledWith(1, true);
    expect(onToggle).toHaveBeenNthCalledWith(2, false);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("should keep the full text in the DOM while clamped so screen readers can read it", () => {
    mockHeights(200, 80);
    customRender(<ReadMore text={longText} maxLines={4} showMoreText="Show More" showLessText="Show Less" />);

    expect(screen.getByTestId("clamped-text")).toHaveTextContent(longText.trim());
    expect(screen.getByTestId("clamped-text")).not.toHaveAttribute("aria-hidden");
    expect(screen.getByTestId("show-more-button")).toHaveAttribute("aria-expanded", "false");
  });
});
