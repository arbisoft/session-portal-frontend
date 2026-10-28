import { sendGTMEvent } from "@next/third-parties/google";

import { MAX_VIDEO_FILE_SIZE_BYTES } from "@/constants/constants";
import { customRender as render, fireEvent } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import VideoPicker from "./videoPicker";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockShowNotification = jest.fn();
const mockNotification = { showNotification: mockShowNotification };

jest.mock("@/components/Notification", () => ({
  useNotification: () => mockNotification,
}));

const setup = () => {
  const onFileSelect = jest.fn();
  const utils = render(<VideoPicker onFileSelect={onFileSelect} />);
  const input = utils.container.querySelector("input[type=file]") as HTMLInputElement;
  return { ...utils, input, onFileSelect };
};

const makeFile = (name: string, type: string, size = 1024) => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("VideoPicker analytics", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should track a selected file with type and size but no file name", () => {
    const { input, onFileSelect } = setup();
    const file = makeFile("confidential-session.mp4", "video/mp4", 5 * 1024 ** 2);

    fireEvent.change(input, { target: { files: [file] } });

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_FILE_SELECTED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      source: "picker",
      file_type: "video/mp4",
      size_mb: 5,
    });
    expect(JSON.stringify((sendGTMEvent as jest.Mock).mock.calls)).not.toContain("confidential-session");
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("should track a rejected file type", () => {
    const { input, onFileSelect } = setup();

    fireEvent.change(input, { target: { files: [makeFile("doc.pdf", "application/pdf")] } });

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_FILE_REJECTED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      reason: "invalid_type",
      source: "picker",
    });
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("should track a file rejected for being too large when dropped", () => {
    const { getByText, onFileSelect } = setup();
    const file = makeFile("big.mp4", "video/mp4", MAX_VIDEO_FILE_SIZE_BYTES + 1);

    fireEvent.drop(getByText("Drag and drop a video file to upload"), { dataTransfer: { files: [file] } });

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_FILE_REJECTED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      reason: "file_too_large",
      source: "drop",
    });
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("should not track anything when nothing was chosen", () => {
    const { input, onFileSelect } = setup();

    fireEvent.change(input, { target: { files: [] } });

    expect(sendGTMEvent).not.toHaveBeenCalled();
    expect(onFileSelect).toHaveBeenCalledWith(undefined);
  });
});

describe("VideoPicker interactions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should open the native file dialog when Select File is clicked", () => {
    const { input, getByRole } = setup();
    const click = jest.spyOn(input, "click").mockImplementation(() => undefined);

    fireEvent.click(getByRole("button", { name: "Select File" }));

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("should prompt to drop the file while dragging over and reset when the drag leaves", () => {
    const { getByText, getByRole } = setup();
    const dropZone = getByText("Drag and drop a video file to upload");

    fireEvent.dragOver(dropZone);
    expect(getByRole("button", { name: "Drop File Here" })).toBeInTheDocument();

    fireEvent.dragLeave(dropZone);
    expect(getByRole("button", { name: "Select File" })).toBeInTheDocument();
  });

  it("should accept a valid dropped file and reset the drag state", () => {
    const { getByText, getByRole, onFileSelect } = setup();
    const dropZone = getByText("Drag and drop a video file to upload");
    const file = makeFile("talk.webm", "video/webm", 2 * 1024 ** 2);

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
    expect(getByRole("button", { name: "Select File" })).toBeInTheDocument();
  });

  it("should notify the user when an unsupported file type is chosen", () => {
    const { input } = setup();

    fireEvent.change(input, { target: { files: [makeFile("doc.pdf", "application/pdf")] } });

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Only MP4, MOV, AVI, and WebM video files are allowed",
      severity: "error",
    });
  });

  it("should notify the user when the file is larger than the limit", () => {
    const { input } = setup();

    fireEvent.change(input, { target: { files: [makeFile("big.mp4", "video/mp4", MAX_VIDEO_FILE_SIZE_BYTES + 1)] } });

    expect(mockShowNotification).toHaveBeenCalledWith({ message: "Video files must be 1GB or smaller", severity: "error" });
  });
});
