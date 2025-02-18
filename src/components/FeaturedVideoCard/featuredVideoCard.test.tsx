import { render, screen } from "@testing-library/react";

import FeaturedVideoCard from "./featuredVideoCard";
import { FeaturedVideoCardProps } from "./types";

const mockProps: FeaturedVideoCardProps = {
  className: "custom-class",
  event_time: "Jan 01, 2024",
  thumbnail: "https://example.com/sample.jpg",
  title: "Sample Video Title",
  workstream_id: "Sample Video Organizer",
  description: "Sample video description",
};

describe("FeaturedVideoCard", () => {
  test("should render the component with provided props", () => {
    render(<FeaturedVideoCard {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-date-time")).toBeInTheDocument();
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(screen.getByRole("img", { name: mockProps.title })).toHaveAttribute("src", imgUrl);
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

  test("should match snapshot", () => {
    const { asFragment } = render(<FeaturedVideoCard {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("should not render when isVisible is false", () => {
    render(<FeaturedVideoCard {...mockProps} isVisible={false} />);
    expect(screen.queryByTestId("video-card")).toBeNull();
  });

  test("should render correctly with different width values", () => {
    const { container } = render(<FeaturedVideoCard {...mockProps} width="200px" />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveStyle("width: 200px");
  });

  test("should render with empty description", () => {
    const mockPropsEmptyDescription = { ...mockProps, description: "" };
    render(<FeaturedVideoCard {...mockPropsEmptyDescription} />);
    expect(screen.getByTestId("video-description")).toBeEmptyDOMElement();
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
});
