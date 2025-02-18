import { render, screen } from "@testing-library/react";

import { VideoCardProps } from "./types";
import VideoCard from "./videoCard";

const mockProps: VideoCardProps = {
  id: 1,
  className: "custom-class",
  event_time: "2024-10-22T12:00:00Z",
  event_type: "SESSION",
  description: "Sample Video Description",
  thumbnail: "https://example.com/sample.jpg",
  title: "Sample Video Title",
  publisher: { id: 1, first_name: "John", last_name: "Doe" },
  tags: ["Workshop", "Ollama", "AI"],
  is_featured: false,
  status: "PUBLISHED",
  workstream_id: "Ikram Ali",
  width: "300px",
};

describe("VideoCard", () => {
  test("should renders the component with provided props", () => {
    render(<VideoCard {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-date-time")).toBeInTheDocument();
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(screen.getByRole("img", { name: mockProps.title })).toHaveAttribute("src", imgUrl);
  });

  test("should displays default image when imgUrl is not provided", () => {
    render(<VideoCard {...mockProps} thumbnail={""} />);

    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";

    expect(decodeURIComponent(imgUrl)).toContain("/assets/images/temp-youtube-logo.webp");
  });

  test("should renders the organizer name", () => {
    render(<VideoCard {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-organizer")).toBeInTheDocument();
  });

  test("should matches snapshot", () => {
    const { asFragment } = render(<VideoCard {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
