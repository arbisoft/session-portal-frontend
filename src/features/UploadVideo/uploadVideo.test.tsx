import { sendGTMEvent } from "@next/third-parties/google";
import { useSelector } from "react-redux";

import { fireEvent, render, screen } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import FileUpload from "./uploadVideo";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockNavigateTo = jest.fn();
const mockNotification = { showNotification: jest.fn() };
const defaultUploadState = {
  uploadProgress: 0,
  isUploading: false,
  videoAssetId: null as number | null,
  error: null as string | null,
  startUpload: jest.fn(),
  phase: "idle",
  notice: null as string | null,
  canPause: false,
  canResume: false,
  canCancel: false,
  pauseUpload: jest.fn(),
  resumeUpload: jest.fn(),
  cancelUpload: jest.fn(),
  pendingUpload: null as unknown,
  discardPendingUpload: jest.fn(),
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

jest.mock("@/components/Notification", () => ({
  useNotification: () => mockNotification,
}));

const mockFile = new File(["x"], "talk.mp4", { type: "video/mp4" });

jest.mock("./form", () => ({
  __esModule: true,
  default: (props: {
    file: File | undefined;
    upload: {
      phase: string;
      percent: number;
      isActive: boolean;
      onPause: () => void;
      onResume: () => void;
      onCancel: () => void;
    };
    pendingUpload: { sessionId: string } | null;
    onFileSelect: (file: File) => void;
    onDiscardPending: () => void;
  }) => (
    <div
      data-testid="video-form"
      data-file={props.file?.name ?? ""}
      data-phase={props.upload.phase}
      data-percent={props.upload.percent}
      data-active={String(props.upload.isActive)}
      data-pending={props.pendingUpload?.sessionId ?? ""}
    >
      <button onClick={() => props.onFileSelect(mockFile)}>select</button>
      <button onClick={props.onDiscardPending}>discard</button>
      <button onClick={props.upload.onPause}>pause</button>
      <button onClick={props.upload.onResume}>resume</button>
      <button onClick={props.upload.onCancel}>cancel</button>
    </div>
  ),
}));

const asStaff = (isStaff: boolean) => (useSelector as unknown as jest.Mock).mockReturnValue(isStaff);

describe("FileUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadState = defaultUploadState;
    asStaff(true);
  });

  it("should show the whole form straight away, without a chosen file", () => {
    render(<FileUpload />);

    expect(screen.getByTestId("video-form")).toHaveAttribute("data-file", "");
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("should start the upload and pass the file and upload state to the form when a file is selected", () => {
    mockUploadState = { ...defaultUploadState, phase: "uploading", uploadProgress: 30, isUploading: true, canPause: true };

    render(<FileUpload />);
    fireEvent.click(screen.getByText("select"));

    expect(mockUploadState.startUpload).toHaveBeenCalledWith(mockFile);
    expect(screen.getByTestId("video-form")).toHaveAttribute("data-file", "talk.mp4");
    expect(screen.getByTestId("video-form")).toHaveAttribute("data-phase", "uploading");
    expect(screen.getByTestId("video-form")).toHaveAttribute("data-percent", "30");
    expect(screen.getByTestId("video-form")).toHaveAttribute("data-active", "true");
  });

  it("should wire pause and resume to the upload hook", () => {
    render(<FileUpload />);

    fireEvent.click(screen.getByText("pause"));
    fireEvent.click(screen.getByText("resume"));

    expect(mockUploadState.pauseUpload).toHaveBeenCalled();
    expect(mockUploadState.resumeUpload).toHaveBeenCalled();
  });

  it("should cancel the upload and clear the chosen file while the form stays mounted", () => {
    render(<FileUpload />);
    fireEvent.click(screen.getByText("select"));
    expect(screen.getByTestId("video-form")).toHaveAttribute("data-file", "talk.mp4");

    fireEvent.click(screen.getByText("cancel"));

    expect(mockUploadState.cancelUpload).toHaveBeenCalled();
    expect(screen.getByTestId("video-form")).toHaveAttribute("data-file", "");
  });

  it("should hand an unfinished upload to the form and let it be discarded", () => {
    mockUploadState = { ...defaultUploadState, pendingUpload: { sessionId: "abc" } };

    render(<FileUpload />);
    fireEvent.click(screen.getByText("discard"));

    expect(screen.getByTestId("video-form")).toHaveAttribute("data-pending", "abc");
    expect(mockUploadState.discardPendingUpload).toHaveBeenCalled();
  });

  it("should tell non-staff users why they are redirected and render nothing", () => {
    asStaff(false);

    render(<FileUpload />);

    expect(screen.queryByTestId("video-form")).not.toBeInTheDocument();
    expect(mockNotification.showNotification).toHaveBeenCalledWith({
      message: "Only staff members can upload videos",
      severity: "info",
    });
    expect(mockNavigateTo).toHaveBeenCalledWith("videos");
  });

  it("should stop a file dropped outside the drop zone from navigating the browser away", () => {
    render(<FileUpload />);
    const drop = new Event("drop", { cancelable: true }) as Event & { dataTransfer: unknown };
    drop.dataTransfer = { types: ["Files"] };

    window.dispatchEvent(drop);

    expect(drop.defaultPrevented).toBe(true);
  });

  it("should track a completed upload once the video asset id is available", () => {
    mockUploadState = { ...defaultUploadState, videoAssetId: 12 };

    render(<FileUpload />);

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_VIDEO_COMPLETED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
    });
  });

  it("should track a failed upload with the static failure reason", () => {
    mockUploadState = { ...defaultUploadState, error: "Network error during upload." };

    render(<FileUpload />);

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_VIDEO_FAILED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      reason: "Network error during upload.",
    });
  });

  it("should not track upload outcomes while nothing has completed or failed", () => {
    render(<FileUpload />);

    expect(sendGTMEvent).not.toHaveBeenCalled();
  });
});
