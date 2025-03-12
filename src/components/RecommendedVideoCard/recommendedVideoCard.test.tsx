import { customRender as render, screen } from "@/jest/utils/testUtils";

import RecommendedVideoCard from "./recommendedVideoCard";
import { RecommendedVideoCardProps } from "./types";

const mockProps: RecommendedVideoCardProps = {
  className: "custom-class",
  date: "Jan 01, 2024",
  duration: "10:15",
  imgUrl: "https://example.com/sample.jpg",
  title: "Sample Video Title",
  width: "300px",
};

describe("RecommendedVideoCard", () => {
  it("should renders the component with provided props", () => {
    render(<RecommendedVideoCard {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByTestId("date-time")).toHaveTextContent(mockProps.date);
    expect(screen.getByTestId("duration")).toHaveTextContent(mockProps.duration);
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(screen.getByRole("img", { name: mockProps.title })).toHaveAttribute("src", imgUrl);
  });

  it("should displays default image when imgUrl is not provided", () => {
    render(<RecommendedVideoCard {...mockProps} imgUrl={undefined} />);
    const imgUrl = screen.getByRole("img", { name: mockProps.title }).getAttribute("src") ?? "";
    expect(screen.getByRole("img", { name: mockProps.title })).toHaveAttribute("src", imgUrl);
  });

  it("should applies custom className if provided", () => {
    render(<RecommendedVideoCard {...mockProps} />);
    expect(screen.getByTestId("recommended-video-card")).toHaveClass(mockProps.className!);
  });

  it("should matches snapshot", () => {
    const { asFragment } = render(<RecommendedVideoCard {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
