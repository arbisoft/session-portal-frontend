import { customRender, screen, fireEvent } from "@/jest/utils/testUtils";

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
