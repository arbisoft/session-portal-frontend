import { sendGTMEvent } from "@next/third-parties/google";

import { MAX_VIDEO_FILE_SIZE_BYTES } from "@/constants/constants";
import { createEvent, customRender as render, fireEvent, screen, within } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import VideoPicker from "./videoPicker";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const setup = (props: Partial<React.ComponentProps<typeof VideoPicker>> = {}) => {
  const onFileSelect = jest.fn();
  const utils = render(<VideoPicker onFileSelect={onFileSelect} {...props} />);
  const input = utils.container.querySelector("input[type=file]") as HTMLInputElement;
  const dropzone = screen.getByText("Drag and drop a video here").parentElement as HTMLElement;
  return { ...utils, input, dropzone, onFileSelect };
};

const makeFile = (name: string, type: string, size = 1024) => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

// jsdom has no DragEvent, so relatedTarget has to be attached by hand.
const dragLeave = (element: HTMLElement, relatedTarget: EventTarget | null) => {
  const event = createEvent.dragLeave(element);
  Object.defineProperty(event, "relatedTarget", { value: relatedTarget });
  fireEvent(element, event);
};

const pendingUpload = {
  sessionId: "abc",
  fingerprint: { name: "big-talk.mp4", size: 4 * 1024 ** 3, lastModified: 1 },
  confirmedBytes: 1024 ** 3,
  updatedAt: 1,
};

describe("VideoPicker", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should state the accepted formats and the size limit next to the button", () => {
    setup();

    expect(screen.getByText(/MP4, MOV, AVI or WebM, up to 20GB/)).toBeInTheDocument();
  });

  it("should offer the allowed MIME types and extensions in the file dialog", () => {
    const { input } = setup();

    expect(input).toHaveAttribute("accept", expect.stringContaining("video/quicktime"));
    expect(input).toHaveAttribute("accept", expect.stringContaining(".mov"));
  });

  it("should open the file dialog from the Select video button", () => {
    const { input } = setup();
    const click = jest.spyOn(input, "click");

    fireEvent.click(screen.getByRole("button", { name: "Select video" }));

    expect(click).toHaveBeenCalled();
  });

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

  it("should accept a .mov file the browser reported without a MIME type", () => {
    const { input, onFileSelect } = setup();

    fireEvent.change(input, { target: { files: [makeFile("clip.mov", "")] } });

    expect(onFileSelect).toHaveBeenCalled();
  });

  it("should keep a visible error and track a rejected file type", () => {
    const { input, onFileSelect } = setup();

    fireEvent.change(input, { target: { files: [makeFile("doc.pdf", "application/pdf")] } });

    expect(screen.getByRole("alert")).toHaveTextContent("Only MP4, MOV, AVI and WebM video files are allowed.");
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_FILE_REJECTED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      reason: "invalid_type",
      source: "picker",
    });
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("should reject a dropped file over the limit and clear the error after a valid choice", () => {
    const { dropzone, input, onFileSelect } = setup();

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [makeFile("big.mp4", "video/mp4", MAX_VIDEO_FILE_SIZE_BYTES + 1)] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Video files must be 20GB or smaller.");
    expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({ reason: "file_too_large", source: "drop" }));
    expect(onFileSelect).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { files: [makeFile("ok.mp4", "video/mp4")] } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onFileSelect).toHaveBeenCalledTimes(1);
  });

  it("should accept a file exactly at the limit", () => {
    const { input, onFileSelect } = setup();

    fireEvent.change(input, { target: { files: [makeFile("max.mp4", "video/mp4", MAX_VIDEO_FILE_SIZE_BYTES)] } });

    expect(onFileSelect).toHaveBeenCalled();
  });

  it("should use the first of several dropped files and say so", () => {
    const { dropzone, onFileSelect } = setup();
    const first = makeFile("one.mp4", "video/mp4");

    fireEvent.drop(dropzone, { dataTransfer: { files: [first, makeFile("two.mp4", "video/mp4")] } });

    expect(onFileSelect).toHaveBeenCalledWith(first);
    expect(screen.getByText("Only one video can be uploaded at a time, so the first file was used.")).toBeInTheDocument();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_MULTI_FILE_DROPPED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      file_count: 2,
    });
    expect(JSON.stringify((sendGTMEvent as jest.Mock).mock.calls)).not.toMatch(/one\.mp4|two\.mp4/);
  });

  it("should not do anything when nothing was chosen", () => {
    const { input, onFileSelect } = setup();

    fireEvent.change(input, { target: { files: [] } });

    expect(sendGTMEvent).not.toHaveBeenCalled();
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("should highlight on drag over and stay highlighted when moving over its own children", () => {
    const { dropzone } = setup();

    fireEvent.dragOver(dropzone);
    expect(screen.getByText("Drop the video to start uploading")).toBeInTheDocument();

    dragLeave(dropzone, screen.getByRole("button", { name: "Select video" }));
    expect(screen.getByText("Drop the video to start uploading")).toBeInTheDocument();

    dragLeave(dropzone, document.body);
    expect(screen.getByText("Drag and drop a video here")).toBeInTheDocument();
  });
});

describe("VideoPicker resumable upload", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should not show the unfinished upload notice by default", () => {
    setup();

    expect(screen.queryByText(/Unfinished upload/)).not.toBeInTheDocument();
  });

  it("should describe an unfinished upload and how to continue it", () => {
    setup({ pendingUpload, onDiscardPending: jest.fn() });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Unfinished upload: big-talk.mp4 (4.0 GB, 25% sent). Select the same file to continue; any other file starts over."
    );
  });

  it("should only discard after confirmation and track it without the file name", () => {
    const onDiscardPending = jest.fn();
    setup({ pendingUpload, onDiscardPending });

    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onDiscardPending).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Discard upload" }));

    expect(onDiscardPending).toHaveBeenCalled();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_PENDING_DISCARDED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
    });
  });

  it("should keep the unfinished upload when the discard is declined", () => {
    const onDiscardPending = jest.fn();
    setup({ pendingUpload, onDiscardPending });

    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));

    expect(onDiscardPending).not.toHaveBeenCalled();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_CONFIRM_DECLINED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      dialog: "discard_pending",
    });
    expect(sendGTMEvent).not.toHaveBeenCalledWith(expect.objectContaining({ event: GA_EVENTS.UPLOAD_PENDING_DISCARDED }));
  });
});
