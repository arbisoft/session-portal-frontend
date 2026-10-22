import { customRender as render, fireEvent, screen, waitFor, within } from "@/jest/utils/testUtils";

import VideoForm from "./form";
import { UploadUi } from "./uploadStatus";

const mockCreateEvent = jest.fn();
const mockPush = jest.fn();

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
    expect(screen.getByLabelText(/^Description/)).toHaveAccessibleDescription("Description is required");
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
});
