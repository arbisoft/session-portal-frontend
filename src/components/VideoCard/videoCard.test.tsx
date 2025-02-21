import { customRender as render, screen } from "@/jest/utils/testUtils";

import { VideoCardProps } from "./types";
import VideoCard from "./videoCard";

const mockProps: VideoCardProps = {
  className: "custom-class",
  date: "Jan 01, 2024",
  imgUrl: "https://example.com/sample.jpg",
  title: "Sample Video Title",
  organizerName: "Sample Video Organizer",
  width: "300px",
};

describe("VideoCard", () => {
  test("should renders the component with provided props", () => {
    render(<VideoCard {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-date-time")).toBeInTheDocument();
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(decodeURIComponent(imgUrl)).toContain(mockProps.imgUrl);
  });

  test("should displays default image when imgUrl is not provided", () => {
    render(<VideoCard {...mockProps} imgUrl={undefined} />);

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
