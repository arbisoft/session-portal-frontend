import { render, screen } from "@testing-library/react";

import FeaturedVideoCard from "./featuredVideoCard";
import { FeaturedVideoCardProps } from "./types";

const mockProps: FeaturedVideoCardProps = {
  className: "custom-class",
  date: "Jan 01, 2024",
  imgUrl: "https://example.com/sample.jpg",
  title: "Sample Video Title",
  organizerName: "Sample Video Organizer",
  description: "Sample video description",
};

describe("FeaturedVideoCard", () => {
  test("should renders the component with provided props", () => {
    render(<FeaturedVideoCard {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-date-time")).toBeInTheDocument();
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(screen.getByRole("img", { name: mockProps.title })).toHaveAttribute("src", imgUrl);
  });

  test("should displays default image when imgUrl is not provided", () => {
    render(<FeaturedVideoCard {...mockProps} imgUrl={undefined} />);

    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";

    expect(decodeURIComponent(imgUrl)).toContain("/assets/images/temp-youtube-logo.webp");
  });

  test("should renders the organizer name", () => {
    render(<FeaturedVideoCard {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-organizer")).toBeInTheDocument();
  });

  test("should matches snapshot", () => {
    const { asFragment } = render(<FeaturedVideoCard {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
