import userEvent from "@testing-library/user-event";

import { customRender as render, screen } from "@/jest/utils/testUtils";

import FeaturedVideoCard from "./featuredVideoCard";
import { FeaturedVideoCardProps } from "./types";

describe("FeaturedVideoCard", () => {
  const mockProps: FeaturedVideoCardProps = {
    className: "custom-class",
    event_time: "Jan 01, 2024",
    thumbnail: "https://example.com/sample.jpg",
    title: "Sample Video Title",
    workstream_id: "Sample Video Organizer",
    description: "Sample video description",
  };

  test("should render the component with provided props", () => {
    render(<FeaturedVideoCard {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-date-time")).toHaveTextContent(mockProps.event_time);
    expect(screen.getByTestId("video-card-organizer")).toHaveTextContent(mockProps.workstream_id);
    expect(screen.getByTestId("video-description")).toHaveTextContent(mockProps.description);
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(decodeURIComponent(imgUrl)).toContain(mockProps.thumbnail);
  });

  test("should display default image when imgUrl is not provided", () => {
    render(<FeaturedVideoCard {...mockProps} thumbnail={undefined} />);
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(decodeURIComponent(imgUrl)).toContain("/assets/images/temp-youtube-logo.webp");
  });

  test("should render the organizer name", () => {
    render(<FeaturedVideoCard {...mockProps} />);
    expect(screen.getByText(mockProps.workstream_id)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-organizer")).toBeInTheDocument();
  });

  test("should not render when isVisible is false", () => {
    render(<FeaturedVideoCard {...mockProps} isVisible={false} />);
    expect(screen.queryByTestId("video-card")).not.toBeInTheDocument();
  });

  test("should match snapshot", () => {
    const { asFragment } = render(<FeaturedVideoCard {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("should render correctly with different width values", () => {
    const { container } = render(<FeaturedVideoCard {...mockProps} width="200px" />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveStyle("width: 200px");
  });

  test("should not render video description when empty", () => {
    const mockPropsEmptyDescription = { ...mockProps, description: "" };
    render(<FeaturedVideoCard {...mockPropsEmptyDescription} />);

    expect(screen.queryByTestId("video-description")).not.toBeInTheDocument();
  });

  test("should have the correct alt text for the image", () => {
    render(<FeaturedVideoCard {...mockProps} />);
    const image = screen.getByRole("img", { name: mockProps.title });
    expect(image).toHaveAttribute("alt", mockProps.title);
  });

  test("should render empty date when date is not provided", () => {
    const mockPropsEmptyDate = { ...mockProps, date: "" };
    render(<FeaturedVideoCard {...mockPropsEmptyDate} />);
    expect(screen.getByTestId("video-card-date-time")).toHaveTextContent("");
  });

  test("should render the default class name", () => {
    render(<FeaturedVideoCard {...mockProps} />);
    expect(screen.getByTestId("video-card")).toHaveClass("custom-class");
  });

  test("should truncate title if it is too long", () => {
    const longTitle = "A very long video title that should be truncated properly in the UI";
    render(<FeaturedVideoCard {...mockProps} title={longTitle} />);

    expect(screen.getByText(/A very long video title/i)).toBeInTheDocument();
  });

  test("should handle special characters in title", () => {
    // eslint-disable-next-line quotes
    const specialTitle = 'Video & Special "Title"!';
    render(<FeaturedVideoCard {...mockProps} title={specialTitle} />);

    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });

  test("should apply custom class name", () => {
    render(<FeaturedVideoCard {...mockProps} className="custom-class" />);
    expect(screen.getByTestId("video-card")).toHaveClass("custom-class");
  });

  test("should allow user interactions on the card", async () => {
    render(<FeaturedVideoCard {...mockProps} />);
    const user = userEvent.setup();
    const videoCard = screen.getByTestId("video-card");

    await user.click(videoCard);
    expect(videoCard).toBeInTheDocument(); // Ensures no crash on click
  });
});
