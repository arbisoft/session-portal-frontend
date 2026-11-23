import { sendGTMEvent } from "@next/third-parties/google";

import { customRender as render, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";
import { UploadSession } from "@/models/Events";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import UnfinishedUploads from "./unfinishedUploads";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockNotification = { showNotification: jest.fn() };
jest.mock("@/components/Notification", () => ({ useNotification: () => mockNotification }));

const session = (overrides: Partial<UploadSession> = {}): UploadSession => ({
  id: "s1",
  filename: "talk.mp4",
  file_size: 1000,
  offset: 400,
  upload_status: "UPLOADING",
  error_code: "",
  video_asset_id: null,
  expires_at: "2030-01-01T00:00:00Z",
  chunk_size: 8,
  max_chunk_size: 16,
  ...overrides,
});

const makeFile = (name: string, size: number, type = "video/mp4") => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const setup = (props: Partial<React.ComponentProps<typeof UnfinishedUploads>> = {}) => {
  const onContinue = jest.fn();
  const onDelete = jest.fn().mockResolvedValue(true);
  const utils = render(
    <UnfinishedUploads sessions={[session()]} isUploadActive={false} onContinue={onContinue} onDelete={onDelete} {...props} />
  );
  const input = () => utils.container.querySelector("input[type=file]") as HTMLInputElement;
  return { ...utils, input, onContinue, onDelete };
};

describe("UnfinishedUploads", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should render nothing without unfinished uploads", () => {
    const { container } = setup({ sessions: [] });

    expect(container).toBeEmptyDOMElement();
  });

  it("should list each upload with its size and progress", () => {
    setup({ sessions: [session(), session({ id: "s2", filename: "demo.webm", file_size: 2048, offset: 1024 })] });

    expect(screen.getByRole("heading", { name: "Unfinished uploads" })).toBeInTheDocument();
    expect(screen.getByText("talk.mp4")).toBeInTheDocument();
    expect(screen.getByText(/40% uploaded/)).toBeInTheDocument();
    expect(screen.getByText("demo.webm")).toBeInTheDocument();
    expect(screen.getByText(/50% uploaded/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Continue upload of/ })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /^Delete upload of/ })).toHaveLength(2);
  });

  it("should continue the upload when the same video is selected", () => {
    const { input, onContinue } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Continue upload of talk.mp4" }));
    const file = makeFile("talk.mp4", 1000);

    fireEvent.change(input(), { target: { files: [file] } });

    expect(onContinue).toHaveBeenCalledWith(session(), file);
    expect(sendGTMEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: GA_EVENTS.UPLOAD_UNFINISHED_CONTINUE_CLICK,
        event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      })
    );
  });

  it("should refuse a different video and say which one is expected", () => {
    const { input, onContinue } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Continue upload of talk.mp4" }));

    fireEvent.change(input(), { target: { files: [makeFile("other.mp4", 1000)] } });

    expect(onContinue).not.toHaveBeenCalled();
    expect(screen.getByText(/That is not the same video\. Select "talk\.mp4"/)).toBeInTheDocument();
    expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({ event: GA_EVENTS.UPLOAD_UNFINISHED_WRONG_FILE }));
  });

  it("should refuse a file that is not a video", () => {
    const { input, onContinue } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Continue upload of talk.mp4" }));

    fireEvent.change(input(), { target: { files: [makeFile("talk.mp4", 1000, "application/pdf")] } });

    expect(onContinue).not.toHaveBeenCalled();
    expect(screen.getByText("Only MP4, MOV, AVI and WebM videos can be uploaded.")).toBeInTheDocument();
  });

  it("should ignore an empty selection", () => {
    const { input, onContinue } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Continue upload of talk.mp4" }));

    fireEvent.change(input(), { target: { files: [] } });

    expect(onContinue).not.toHaveBeenCalled();
  });

  it("should clear the mismatch warning when it is closed", () => {
    const { input } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Continue upload of talk.mp4" }));
    fireEvent.change(input(), { target: { files: [makeFile("other.mp4", 1)] } });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByText(/not the same video/)).not.toBeInTheDocument();
  });

  it("should disable Continue while another upload is running but still allow Delete", () => {
    setup({ isUploadActive: true });

    expect(screen.getByRole("button", { name: "Continue upload of talk.mp4" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete upload of talk.mp4" })).toBeEnabled();
  });

  it("should delete an upload only after confirmation", async () => {
    const { onDelete } = setup();

    fireEvent.click(screen.getByRole("button", { name: "Delete upload of talk.mp4" }));
    expect(onDelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete upload" }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(session()));
    expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({ event: GA_EVENTS.UPLOAD_PENDING_DISCARDED }));
  });

  it("should keep the upload when the confirmation is declined", () => {
    const { onDelete } = setup();

    fireEvent.click(screen.getByRole("button", { name: "Delete upload of talk.mp4" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(sendGTMEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: GA_EVENTS.UPLOAD_CONFIRM_DECLINED, dialog: "delete_unfinished" })
    );
  });

  it("should tell the user when an upload could not be deleted", async () => {
    const { onDelete } = setup();
    onDelete.mockResolvedValue(false);

    fireEvent.click(screen.getByRole("button", { name: "Delete upload of talk.mp4" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete upload" }));

    await waitFor(() =>
      expect(mockNotification.showNotification).toHaveBeenCalledWith({
        message: "The upload could not be deleted. Please try again.",
        severity: "error",
      })
    );
    expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({ event: GA_EVENTS.UPLOAD_UNFINISHED_DELETE_FAILED }));
  });
});
