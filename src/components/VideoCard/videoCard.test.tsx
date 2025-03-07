import useNavigation from "@/hooks/useNavigation";
import { fireEvent, customRender as render, screen } from "@/jest/utils/testUtils";

import { VideoCardProps } from "./types";
import VideoCard from "./videoCard";

const mockProps: VideoCardProps = {
  id: 1,
  className: "custom-class",
  event_time: "2024-10-22T12:00:00Z",
  event_type: "SESSION",
  description: "Sample Video Description",
  thumbnail: "assets/images/temp-youtube-logo.webp",
  title: "Sample Video Title",
  publisher: { id: 1, first_name: "John", last_name: "Doe" },
  tags: ["Workshop", "Ollama", "AI"],
  is_featured: false,
  status: "PUBLISHED",
  workstream_id: "Ikram Ali",
  width: "300px",
  video_duration: 1800,
};

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: jest.fn(() => ({ navigateTo: jest.fn() })),
}));

describe("VideoCard", () => {
  const mockNavigateTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ navigateTo: mockNavigateTo });
  });

  test("should renders the component with provided props", () => {
    render(<VideoCard {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("video-card-date-time")).toBeInTheDocument();
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(decodeURIComponent(imgUrl)).toContain(mockProps.thumbnail);
    expect(screen.getByText("30:00")).toBeInTheDocument();
  });

  test("should displays default image when imgUrl is not provided", () => {
    render(<VideoCard {...mockProps} />);

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

  test("should calls navigateTo when clicked", () => {
    render(<VideoCard {...mockProps} />);
    fireEvent.click(screen.getByTestId("video-card"));
    expect(mockNavigateTo).toHaveBeenCalledWith("videoDetail", { id: 1 });
  });

  test("should displays fallback thumbnail when no thumbnail is provided", () => {
    render(<VideoCard {...mockProps} thumbnail={""} />);
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(decodeURIComponent(imgUrl)).toContain(mockProps.thumbnail);
  });
});
