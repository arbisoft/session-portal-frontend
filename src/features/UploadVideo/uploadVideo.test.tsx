import { sendGTMEvent } from "@next/third-parties/google";
import { useSelector } from "react-redux";

import { render, screen } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import FileUpload from "./uploadVideo";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockNavigateTo = jest.fn();
const defaultUploadState = {
  uploadProgress: 0,
  isUploading: false,
  videoAssetId: null as number | null,
  error: null as string | null,
  startUpload: jest.fn(),
};
let mockUploadState = defaultUploadState;

jest.mock("@/hooks/useVideoUpload", () => ({
  useVideoUpload: () => mockUploadState,
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({ navigateTo: mockNavigateTo }),
}));

jest.mock("./videoPicker", () => ({
  __esModule: true,
  default: () => <div data-testid="video-picker" />,
}));

describe("FileUpload", () => {
  beforeEach(() => {
    mockNavigateTo.mockClear();
    (sendGTMEvent as jest.Mock).mockClear();
    mockUploadState = defaultUploadState;
  });

  it("should render the video picker for staff users", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(true);

    render(<FileUpload />);

    expect(screen.getByTestId("video-picker")).toBeInTheDocument();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("should redirect non-staff users to the videos page and render nothing", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(false);

    render(<FileUpload />);

    expect(screen.queryByTestId("video-picker")).not.toBeInTheDocument();
    expect(mockNavigateTo).toHaveBeenCalledWith("videos");
  });

  it("should track a completed upload once the video asset id is available", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(true);
    mockUploadState = { ...defaultUploadState, videoAssetId: 12 };

    render(<FileUpload />);

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_VIDEO_COMPLETED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
    });
  });

  it("should track a failed upload with the static failure reason", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(true);
    mockUploadState = { ...defaultUploadState, error: "Network error during upload." };

    render(<FileUpload />);

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_VIDEO_FAILED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      reason: "Network error during upload.",
    });
  });

  it("should not track upload outcomes while nothing has completed or failed", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(true);

    render(<FileUpload />);

    expect(sendGTMEvent).not.toHaveBeenCalled();
  });
});
