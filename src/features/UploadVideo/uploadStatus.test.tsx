import { sendGTMEvent } from "@next/third-parties/google";

import { customRender as render, fireEvent, screen, within } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import { getPublishStatus, UploadStatusPanel, UploadUi } from "./uploadStatus";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const ui = (overrides: Partial<UploadUi> = {}): UploadUi => ({
  phase: "uploading",
  notice: null,
  percent: 40,
  error: null,
  isActive: true,
  videoAssetId: null,
  canPause: false,
  canResume: false,
  canCancel: false,
  onPause: jest.fn(),
  onResume: jest.fn(),
  onCancel: jest.fn(),
  ...overrides,
});

const file = new File(["x"], "talk.mp4", { type: "video/mp4" });
Object.defineProperty(file, "size", { value: 1024 ** 3 });

const status = (upload: UploadUi, extra: Partial<Parameters<typeof getPublishStatus>[0]> = {}) =>
  getPublishStatus({ hasFile: true, isQueued: false, isPublishing: false, upload, ...extra });

describe("getPublishStatus", () => {
  it.each([
    ["no video chosen", status(ui(), { hasFile: false }), "Select a video to publish."],
    ["publishing", status(ui(), { isPublishing: true }), "Publishing…"],
    ["upload failed", status(ui({ phase: "failed", isActive: false })), "Upload failed. Choose another video to publish."],
    ["queued while uploading", status(ui(), { isQueued: true }), "Will publish automatically when the upload finishes."],
    [
      "queued while paused",
      status(ui({ phase: "paused" }), { isQueued: true }),
      "Waiting for the upload to continue, then it will publish automatically.",
    ],
    ["interrupted", status(ui({ phase: "interrupted", notice: "Retrying…" })), "Retrying…"],
    ["interrupted without notice", status(ui({ phase: "interrupted" })), "Connection problem."],
    ["paused", status(ui({ phase: "paused" })), "Upload paused."],
    ["finalizing", status(ui({ phase: "finalizing", percent: 100 })), "Processing video…"],
    ["uploaded", status(ui({ phase: "completed", isActive: false, videoAssetId: 5 })), "Video uploaded."],
    ["uploading", status(ui()), "Uploading video…"],
    ["creating nothing yet", status(ui({ isActive: false, phase: "idle" })), "Preparing upload…"],
  ])("should describe %s", (_, result, text) => {
    expect(result.text).toBe(text);
  });

  it("should carry the percent only while uploading and flag failures as errors", () => {
    expect(status(ui()).percent).toBe(40);
    expect(status(ui({ phase: "failed", isActive: false })).isError).toBe(true);
  });
});

describe("UploadStatusPanel", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should show the file, determinate progress and transfer details", () => {
    render(<UploadStatusPanel file={file} upload={ui()} />);

    expect(screen.getByText("talk.mp4")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Video upload progress" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText(/40% · 409\.6 MB of 1\.0 GB/)).toBeInTheDocument();
  });

  it("should show an indeterminate bar without numbers while preparing or processing", () => {
    render(<UploadStatusPanel file={file} upload={ui({ phase: "finalizing", percent: 100 })} />);

    expect(screen.getByText("Processing video…")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    expect(screen.queryByText(/of 1\.0 GB/)).not.toBeInTheDocument();
  });

  it("should offer pause while uploading", () => {
    const upload = ui({ canPause: true, canCancel: true });
    render(<UploadStatusPanel file={file} upload={upload} />);

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));

    expect(upload.onPause).toHaveBeenCalled();
  });

  it("should offer resume when paused and retry when interrupted", () => {
    const paused = ui({ phase: "paused", canResume: true });
    const { rerender } = render(<UploadStatusPanel file={file} upload={paused} />);
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    expect(paused.onResume).toHaveBeenCalled();

    rerender(<UploadStatusPanel file={file} upload={ui({ phase: "interrupted", canResume: true, notice: "You're offline." })} />);
    expect(screen.getByRole("button", { name: "Retry now" })).toBeInTheDocument();
    expect(screen.getByText("You're offline.")).toBeInTheDocument();
  });

  it("should ask for confirmation before cancelling an upload and keep it when declined", () => {
    const upload = ui({ canCancel: true });
    render(<UploadStatusPanel file={file} upload={upload} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel upload" }));
    expect(upload.onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Cancel this upload?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Keep uploading" }));
    expect(upload.onCancel).not.toHaveBeenCalled();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_CONFIRM_DECLINED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      dialog: "cancel_upload",
    });
  });

  it("should cancel once confirmed", () => {
    const upload = ui({ canCancel: true });
    render(<UploadStatusPanel file={file} upload={upload} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel upload" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel upload" }));

    expect(upload.onCancel).toHaveBeenCalledTimes(1);
    // The cancellation itself is reported by the upload manager; the panel adds nothing on confirm.
    expect(sendGTMEvent).not.toHaveBeenCalled();
  });

  it("should track keeping a finished video when the removal is declined", () => {
    const upload = ui({ phase: "completed", isActive: false, percent: 100, videoAssetId: 7 });
    render(<UploadStatusPanel file={file} upload={upload} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove video" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep video" }));

    expect(upload.onCancel).not.toHaveBeenCalled();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_CONFIRM_DECLINED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      dialog: "remove_video",
    });
  });

  it("should show success and let a finished video be removed after confirmation", () => {
    const upload = ui({ phase: "completed", isActive: false, percent: 100, videoAssetId: 7 });
    render(<UploadStatusPanel file={file} upload={upload} />);

    expect(screen.getByText("Upload complete")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove video" }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Remove this video?" })).getByRole("button", { name: "Remove video" })
    );

    expect(upload.onCancel).toHaveBeenCalledTimes(1);
  });

  it("should show the failure and let the user choose another video without confirmation", () => {
    const upload = ui({ phase: "failed", isActive: false, error: "Upload failed. Please try again." });
    render(<UploadStatusPanel file={file} upload={upload} />);

    expect(screen.getByText("Upload failed")).toBeInTheDocument();
    expect(screen.getByText("Upload failed. Please try again.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Choose another video" }));

    expect(upload.onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_CHOOSE_ANOTHER_CLICK,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
    });
  });
});
