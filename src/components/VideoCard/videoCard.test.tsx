import { fireEvent, customRender as render, screen } from "@/jest/utils/testUtils";
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/utils/constants";
import { convertSecondsToFormattedTime, formatDateTime } from "@/utils/utils";

import { VideoCardProps } from "./types";
import VideoCard from "./videoCard";

const mockProps: VideoCardProps = {
  className: "custom-class",
  data: {
    title: "Refresher & AMA Session on Competency Framework Changes - January 2025",
    event_time: formatDateTime("2025-01-09T06:00:00Z"),
    thumbnail: `${BASE_URL}/media/thumbnails/Screenshot_2025-02-12_at_1.13.39PM.png`,
    video_duration: convertSecondsToFormattedTime(1830),
    organizer: "John Doe",
  },
  onClick: jest.fn(),
  width: "300px",
};

describe("VideoCard", () => {
  it("should renders the component with provided props", () => {
    render(<VideoCard {...mockProps} />);

    expect(screen.getByTestId("video-card-title")).toHaveTextContent(mockProps.data.title);
    expect(screen.getByTestId("video-card-date-time")).toHaveTextContent(mockProps.data.event_time);
    expect(screen.getByTestId("video-card-organizer")).toHaveTextContent(mockProps.data.organizer);
    expect(screen.getByTestId("video-card-duration")).toHaveTextContent(mockProps.data.video_duration);
    const imgUrl = screen.getByTestId("video-card-image").getAttribute("src") ?? "";
    expect(decodeURIComponent(imgUrl)).toContain(mockProps.data.thumbnail);
  });

  it("should displays default image when thumbnail is not provided", () => {
    render(<VideoCard {...mockProps} data={{ ...mockProps.data, thumbnail: "" }} />);

    const imgUrl = screen.getByTestId("video-card-image").getAttribute("src") ?? "";
    expect(decodeURIComponent(imgUrl)).toContain(DEFAULT_THUMBNAIL);
  });

  it("should renders the organizer name", () => {
    render(<VideoCard {...mockProps} />);
    expect(screen.getByTestId("video-card-organizer")).toBeInTheDocument();
    expect(screen.getByTestId("video-card-organizer")).toHaveTextContent(mockProps.data.organizer);
  });

  it("should matches snapshot", () => {
    const { asFragment } = render(<VideoCard {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("should calls onClick when clicked", () => {
    render(<VideoCard {...mockProps} />);
    fireEvent.click(screen.getByTestId("video-card"));
    expect(mockProps.onClick).toHaveBeenCalled();
  });

  it("should renders skeleton loader correctly", () => {
    render(<VideoCard {...mockProps} />);
    expect(screen.getByTestId("video-card")).toBeInTheDocument();
  });
});
