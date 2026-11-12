import { sendGTMEvent } from "@next/third-parties/google";
import userEvent from "@testing-library/user-event";

import { UPLOAD_DRAFT_KEY } from "@/constants/constants";
import { customRender as render, fireEvent, screen, waitFor, within } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import VideoForm from "./form";
import { UploadUi } from "./uploadStatus";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockCreateEvent = jest.fn();
const mockPush = jest.fn();

const mockLoadThumbnail = jest.fn();
const mockSaveThumbnail = jest.fn();
jest.mock("@/services/uploadDraft/thumbnailStore", () => ({
  loadDraftThumbnail: (...args: unknown[]) => mockLoadThumbnail(...args),
  saveDraftThumbnail: (...args: unknown[]) => mockSaveThumbnail(...args),
}));

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({ navigateTo: jest.fn() }),
}));

jest.mock("@/components/Notification", () => ({
  useNotification: () => ({ showNotification: jest.fn() }),
}));

jest.mock("@/redux/events/apiSlice", () => ({
  useAllTagsQuery: () => ({ data: [] }),
  useCreateEventMutation: () => [mockCreateEvent, { isLoading: false }],
  useCreateTagMutation: () => [jest.fn()],
  useLazySearchUsersQuery: () => [jest.fn(), { data: [], isFetching: false }],
  usePlaylistsQuery: () => ({ data: [] }),
}));

const makeUpload = (overrides: Partial<UploadUi> = {}): UploadUi => ({
  phase: "uploading",
  notice: null,
  percent: 40,
  error: null,
  isActive: true,
  videoAssetId: null,
  canPause: true,
  canResume: false,
  canCancel: true,
  onPause: jest.fn(),
  onResume: jest.fn(),
  onCancel: jest.fn(),
  ...overrides,
});

const idleUpload = makeUpload({ phase: "idle", isActive: false, percent: 0, canPause: false, canCancel: false });
const file = new File(["x"], "my_quarterly-talk.mp4", { type: "video/mp4" });

const renderForm = (props: Partial<React.ComponentProps<typeof VideoForm>> = {}) =>
  render(<VideoForm file={file} upload={makeUpload()} onFileSelect={jest.fn()} {...props} />);

describe("VideoForm", () => {
  beforeEach(() => {
    mockCreateEvent.mockClear();
    mockPush.mockClear();
  });

  it("should show the whole form before any video is chosen, with the picker inside it", () => {
    renderForm({ file: undefined, upload: idleUpload });

    expect(screen.getByRole("heading", { level: 1, name: "Upload Video" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Presenters/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Playlists/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Tags/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Auto-generated" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select video" })).toBeInTheDocument();
  });

  it("should explain why Publish is unavailable until a video is chosen", () => {
    renderForm({ file: undefined, upload: idleUpload });

    expect(screen.getByRole("status")).toHaveTextContent("Select a video to publish.");
    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
  });

  it("should mark required and optional fields", () => {
    renderForm();

    expect(screen.getByText("Title", { selector: "label" })).toHaveTextContent("Title *");
    expect(screen.getByText(/Playlists/, { selector: "label" })).toHaveTextContent("(optional)");
    expect(screen.getByText(/Tags/, { selector: "label" })).toHaveTextContent("(optional)");
    expect(screen.getByText(/Thumbnail/, { selector: "label" })).toHaveTextContent("(optional)");
  });

  it("should suggest a title from the file name without overwriting the user's own", () => {
    const { rerender } = renderForm();
    expect(screen.getByLabelText(/^Title/)).toHaveValue("my quarterly talk");

    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Q3 Review" } });
    rerender(
      <VideoForm file={new File(["y"], "another.mp4", { type: "video/mp4" })} upload={makeUpload()} onFileSelect={jest.fn()} />
    );

    expect(screen.getByLabelText(/^Title/)).toHaveValue("Q3 Review");
  });

  it("should show the video panel instead of the picker once a video is chosen", () => {
    renderForm();

    expect(screen.getByText("my_quarterly-talk.mp4")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Select video" })).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Video upload progress" })).toHaveAttribute("aria-valuenow", "40");
  });

  it("should announce the upload state once, keeping the percent out of the live region text", () => {
    renderForm();

    expect(screen.getByRole("status")).toHaveTextContent("Uploading video… · 40%");
    expect(within(screen.getByRole("status")).getByText(/40%/)).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("should flag failed fields next to the inputs and in the footer when publishing is incomplete", async () => {
    renderForm({ upload: makeUpload({ phase: "completed", isActive: false, percent: 100, videoAssetId: 9 }) });

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    expect(await screen.findByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("At least one presenter is required")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Description/)).toHaveAccessibleDescription("Description is required 0/5000");
    expect(screen.getByRole("alert")).toHaveTextContent("Fix the highlighted fields to publish.");
    // Focus moves to the first invalid field in form order, which is Presenters.
    await waitFor(() => expect(screen.getByLabelText(/^Presenters/)).toHaveFocus());
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("should reject a title over the backend limit", async () => {
    renderForm({ upload: makeUpload({ phase: "completed", isActive: false, videoAssetId: 9 }) });

    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "a".repeat(256) } });
    fireEvent.blur(screen.getByLabelText(/^Title/));

    expect(await screen.findByText("Title can be at most 255 characters")).toBeInTheDocument();
  });

  it("should validate a field when the user leaves it, before any submit", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "" } });
    fireEvent.blur(screen.getByLabelText(/^Title/));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
  });

  it("should keep Publish disabled after the upload failed and say why", () => {
    renderForm({ upload: makeUpload({ phase: "failed", isActive: false, error: "Upload failed. Please try again." }) });

    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Upload failed. Choose another video to publish.");
    expect(screen.getByText("Upload failed. Please try again.")).toBeInTheDocument();
  });

  it("should enable Publish while the upload is still running so it can be queued", () => {
    renderForm();

    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();
  });

  it("should not steal focus on first load but focus Select video once a chosen video is removed", () => {
    const { rerender } = renderForm({ file: undefined, upload: idleUpload });
    expect(screen.getByRole("button", { name: "Select video" })).not.toHaveFocus();

    rerender(<VideoForm file={file} upload={makeUpload()} onFileSelect={jest.fn()} />);
    rerender(<VideoForm file={undefined} upload={idleUpload} onFileSelect={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Select video" })).toHaveFocus();
  });

  it("should confirm before an in-app link discards the work and navigate only on confirmation", () => {
    renderForm();
    const link = document.createElement("a");
    link.href = "/videos";
    document.body.appendChild(link);

    fireEvent.click(link);
    const dialog = screen.getByRole("dialog", { name: "Leave this page?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Stay" }));
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.click(link);
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Leave page" }));

    expect(mockPush).toHaveBeenCalledWith("/videos");
    link.remove();
  });

  it("should show a live counter and stop typing at the limit for the title and the description", () => {
    // No file, so the title is not pre-filled from a file name.
    renderForm({ file: undefined, upload: idleUpload });
    const title = screen.getByLabelText(/^Title/);
    const description = screen.getByLabelText(/^Description/);

    expect(title).toHaveAttribute("maxlength", "255");
    expect(description).toHaveAttribute("maxlength", "5000");
    expect(screen.getByText("0/255")).toBeInTheDocument();
    expect(screen.getByText("0/5000")).toBeInTheDocument();

    fireEvent.change(title, { target: { value: "Quarterly talk" } });
    fireEvent.change(description, { target: { value: "x".repeat(1234) } });

    expect(screen.getByText("14/255")).toBeInTheDocument();
    expect(screen.getByText("1234/5000")).toBeInTheDocument();
  });

  it("should reject a description over the limit that slipped past the input", async () => {
    renderForm({ upload: makeUpload({ videoAssetId: 9, phase: "completed", isActive: false, percent: 100 }) });
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Talk" } });
    // maxLength only limits typing; a restored draft or script can still set a longer value.
    fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: "x".repeat(5001) } });

    fireEvent.click(screen.getByRole("button", { name: /^publish/i }));

    expect(await screen.findByText("Description can be at most 5000 characters")).toBeInTheDocument();
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("should reject a session date in the future instead of publishing it", async () => {
    renderForm({ upload: makeUpload({ videoAssetId: 9, phase: "completed", isActive: false, percent: 100 }) });
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Talk" } });
    fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: "About it" } });
    const year = String(new Date().getFullYear() + 1);
    await userEvent.click(screen.getByRole("spinbutton", { name: "Month" }));
    await userEvent.keyboard(`1225${year}`);

    fireEvent.click(screen.getByRole("button", { name: /^publish/i }));

    expect(await screen.findByText("Session date can't be in the future")).toBeInTheDocument();
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  describe("draft kept across a reload", () => {
    const DRAFT_KEY = `${UPLOAD_DRAFT_KEY}:anonymous`;
    const pendingUpload = {
      sessionId: "s1",
      fingerprint: { name: "my_quarterly-talk.mp4", size: 10, lastModified: 1 },
      confirmedBytes: 0,
      updatedAt: 1,
    };
    const draft = {
      title: "Quarterly talk",
      event_date: "2026-01-10T12:00:00.000Z",
      description: "What we shipped",
      presenters: [{ id: 7, first_name: "Ada", last_name: "Lovelace", full_name: "Ada Lovelace", email: "ada@arbisoft.com" }],
      playlists: [],
      tags: ["brand-new"],
    };

    beforeEach(() => {
      jest.mocked(sendGTMEvent).mockClear();
      window.localStorage.clear();
      global.URL.createObjectURL = jest.fn(() => "blob:preview");
      global.URL.revokeObjectURL = jest.fn();
      mockLoadThumbnail.mockReset().mockResolvedValue(null);
      mockSaveThumbnail.mockReset().mockResolvedValue(undefined);
    });

    it("should restore the saved details when an unfinished upload is found", async () => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      mockLoadThumbnail.mockResolvedValue(new File(["x"], "cover.png", { type: "image/png" }));

      renderForm({ file: undefined, upload: idleUpload, pendingUpload });

      expect(await screen.findByDisplayValue("Quarterly talk")).toBeInTheDocument();
      expect(screen.getByDisplayValue("What we shipped")).toBeInTheDocument();
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
      expect(screen.getByText("#brand-new")).toBeInTheDocument();
      expect(await screen.findByText("cover.png")).toBeInTheDocument();
      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.UPLOAD_DRAFT_RESTORED,
        event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
        details_restored: true,
        thumbnail_restored: true,
      });
      expect(JSON.stringify((sendGTMEvent as jest.Mock).mock.calls)).not.toContain("Quarterly talk");
    });

    it("should save what was typed just before the form closes, without waiting for the debounce", () => {
      const { unmount } = renderForm();

      fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Typed right before leaving" } });
      unmount();

      expect(JSON.parse(window.localStorage.getItem(DRAFT_KEY) as string)).toMatchObject({ title: "Typed right before leaving" });
    });

    it("should not write the draft back when the form closes after it was cleared on purpose", async () => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      const { unmount } = renderForm({ file: undefined, upload: idleUpload, pendingUpload });
      await screen.findByDisplayValue("Quarterly talk");

      fireEvent.click(screen.getByRole("button", { name: "Discard" }));
      fireEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: /discard/i }));
      await waitFor(() => expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull());
      unmount();

      expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it("should not restore anything when there is no unfinished upload", async () => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      renderForm({ file: undefined, upload: idleUpload, pendingUpload: null });

      await waitFor(() => expect(screen.getByLabelText(/^Title/)).toHaveValue(""));
      expect(sendGTMEvent).not.toHaveBeenCalledWith(expect.objectContaining({ event: GA_EVENTS.UPLOAD_DRAFT_RESTORED }));
      expect(window.localStorage.getItem(DRAFT_KEY)).toBe(JSON.stringify(draft));
    });

    it("should not overwrite the saved draft with an empty form before restoring it", async () => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      renderForm({ file: undefined, upload: idleUpload, pendingUpload });
      await screen.findByDisplayValue("Quarterly talk");
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(JSON.parse(window.localStorage.getItem(DRAFT_KEY) as string)).toMatchObject({ title: "Quarterly talk" });
    });

    it("should save edits while a video is chosen", async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Typed while uploading" } });

      await waitFor(() =>
        expect(JSON.parse(window.localStorage.getItem(DRAFT_KEY) as string)).toMatchObject({ title: "Typed while uploading" })
      );
    });

    it("should not save anything before an upload exists", async () => {
      renderForm({ file: undefined, upload: idleUpload, pendingUpload: null });

      fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Just typing" } });
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it("should remove the saved details when the unfinished upload is discarded", async () => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      const onDiscardPending = jest.fn();
      renderForm({ file: undefined, upload: idleUpload, pendingUpload, onDiscardPending });
      await screen.findByDisplayValue("Quarterly talk");

      fireEvent.click(screen.getByRole("button", { name: "Discard" }));
      const dialog = await screen.findByRole("dialog");
      fireEvent.click(within(dialog).getByRole("button", { name: /discard/i }));

      await waitFor(() => expect(onDiscardPending).toHaveBeenCalled());
      expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
      expect(mockSaveThumbnail).toHaveBeenCalledWith(DRAFT_KEY, null);
    });
  });
});
