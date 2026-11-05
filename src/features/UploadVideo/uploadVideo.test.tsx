import { sendGTMEvent } from "@next/third-parties/google";
import { useSelector } from "react-redux";

import { fireEvent, render, screen } from "@/jest/utils/testUtils";
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
  default: ({ onFileSelect }: { onFileSelect: (file: File | undefined) => void }) => (
    <div data-testid="video-picker">
      <button type="button" onClick={() => onFileSelect(new File(["x"], "talk.mp4", { type: "video/mp4" }))}>
        pick file
      </button>
      <button type="button" onClick={() => onFileSelect(undefined)}>
        clear file
      </button>
      <div data-testid="other-scrollable" style={{ overflowY: "auto" }}>
        <span data-testid="inside-other-scrollable" />
      </div>
    </div>
  ),
}));

jest.mock("./form", () => ({
  __esModule: true,
  default: ({ isUploading }: { isUploading: boolean }) => (
    <div id="upload-form-scroll" data-testid="video-form" data-uploading={String(isUploading)}>
      <span data-testid="inside-form" />
    </div>
  ),
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

  describe("file selection", () => {
    beforeEach(() => {
      (useSelector as unknown as jest.Mock).mockReturnValue(true);
    });

    it("should start the upload and show the form once a file is picked", () => {
      const startUpload = jest.fn();
      mockUploadState = { ...defaultUploadState, startUpload };
      render(<FileUpload />);

      fireEvent.click(screen.getByRole("button", { name: "pick file" }));

      expect(startUpload).toHaveBeenCalledWith(expect.objectContaining({ name: "talk.mp4" }));
      expect(screen.getByTestId("video-form")).toBeInTheDocument();
      expect(screen.queryByTestId("video-picker")).not.toBeInTheDocument();
    });

    it("should stay on the picker and not upload when the selection is cleared", () => {
      const startUpload = jest.fn();
      mockUploadState = { ...defaultUploadState, startUpload };
      render(<FileUpload />);

      fireEvent.click(screen.getByRole("button", { name: "clear file" }));

      expect(startUpload).not.toHaveBeenCalled();
      expect(screen.getByTestId("video-picker")).toBeInTheDocument();
    });
  });

  describe("wheel forwarding", () => {
    const setup = () => {
      const utils = render(<FileUpload />);
      fireEvent.click(screen.getByRole("button", { name: "pick file" }));
      const scrollEl = document.getElementById("upload-form-scroll") as HTMLElement;
      scrollEl.scrollBy = jest.fn();
      return { ...utils, scrollEl, root: utils.container.firstChild as HTMLElement };
    };

    beforeEach(() => {
      (useSelector as unknown as jest.Mock).mockReturnValue(true);
    });

    it("should scroll the form when the wheel is used outside of it", () => {
      const { root, scrollEl } = setup();

      fireEvent.wheel(root, { deltaY: 40 });

      expect(scrollEl.scrollBy).toHaveBeenCalledWith({ top: 40 });
    });

    it("should leave the wheel alone when it is used inside the form", () => {
      const { scrollEl } = setup();

      fireEvent.wheel(screen.getByTestId("inside-form"), { deltaY: 40 });

      expect(scrollEl.scrollBy).not.toHaveBeenCalled();
    });

    it("should not hijack the wheel over another scrollable element", () => {
      const scrollHeight = jest.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
      const clientHeight = jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
      try {
        const { root, scrollEl } = setup();
        const other = document.createElement("div");
        other.style.overflowY = "scroll";
        root.appendChild(other);

        fireEvent.wheel(other, { deltaY: 40 });

        expect(scrollEl.scrollBy).not.toHaveBeenCalled();
      } finally {
        scrollHeight.mockRestore();
        clientHeight.mockRestore();
      }
    });

    it("should still forward the wheel over an overflow element that has nothing to scroll", () => {
      const { root, scrollEl } = setup();
      const other = document.createElement("div");
      other.style.overflowY = "auto";
      root.appendChild(other);

      fireEvent.wheel(other, { deltaY: 25 });

      expect(scrollEl.scrollBy).toHaveBeenCalledWith({ top: 25 });
    });

    it("should do nothing before the form exists", () => {
      const { container } = render(<FileUpload />);

      expect(() => fireEvent.wheel(container.firstChild as HTMLElement, { deltaY: 40 })).not.toThrow();
    });
  });
});
