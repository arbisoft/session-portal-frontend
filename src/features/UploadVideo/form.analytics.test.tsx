import { sendGTMEvent } from "@next/third-parties/google";

import { customRender as render, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import VideoForm from "./form";
import { UploadUi } from "./uploadStatus";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockCreateEvent = jest.fn();
const mockCreateTag = jest.fn();
const mockNavigateTo = jest.fn();
const mockNotification = { showNotification: jest.fn() };

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({ navigateTo: mockNavigateTo }),
}));

jest.mock("@/components/Notification", () => ({
  useNotification: () => mockNotification,
}));

jest.mock("@/redux/events/apiSlice", () => ({
  useCreateEventMutation: () => [mockCreateEvent, { isLoading: false }],
  useCreateTagMutation: () => [mockCreateTag],
}));

// The real inputs are covered in form.test.tsx. Here a single stub fills every required value so the
// submit/publish flow (and its analytics) can be exercised without driving MUI pickers/autocompletes.
jest.mock("./fields", () => {
  const { useController } = jest.requireActual("react-hook-form");
  const FillAll = ({ control }: { control: unknown }) => {
    const title = useController({ control, name: "title" } as never).field;
    const description = useController({ control, name: "description" } as never).field;
    const eventDate = useController({ control, name: "event_date" } as never).field;
    const presenters = useController({ control, name: "presenter_ids" } as never).field;
    const playlists = useController({ control, name: "playlists" } as never).field;
    const tags = useController({ control, name: "tags" } as never).field;
    return (
      <>
        <button
          type="button"
          onClick={() => {
            title.onChange("Secret title");
            description.onChange("Secret description");
            eventDate.onChange(new Date(2025, 0, 2, 0, 0, 0));
            presenters.onChange([1, 2]);
            playlists.onChange([5]);
            tags.onChange([{ id: 9, name: "existing" }, "#brand-new"]);
          }}
        >
          fill form
        </button>
        <button type="button" onClick={() => title.onChange("Edited title")}>
          edit title
        </button>
      </>
    );
  };
  return {
    ...jest.requireActual("./fields"),
    TitleField: FillAll,
    EventDateField: () => null,
    DescriptionField: () => null,
  };
});

jest.mock("./selectFields", () => ({
  PresenterField: () => null,
  PlaylistsField: () => null,
  TagsField: () => null,
}));

const mockThumbnail = new File(["x"], "private-name.png", { type: "image/png" });
jest.mock("./thumbnailField", () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (file: File | null) => void }) => (
    <button type="button" onClick={() => onChange(mockThumbnail)}>
      choose thumbnail
    </button>
  ),
}));

const makeUpload = (overrides: Partial<UploadUi> = {}): UploadUi => ({
  phase: "completed",
  notice: null,
  percent: 100,
  error: null,
  isActive: false,
  videoAssetId: 42,
  canPause: false,
  canResume: false,
  canCancel: false,
  onPause: jest.fn(),
  onResume: jest.fn(),
  onCancel: jest.fn(),
  ...overrides,
});

const uploading = makeUpload({ phase: "uploading", percent: 30, isActive: true, videoAssetId: null, canCancel: true });
const file = new File(["x"], "talk.mp4", { type: "video/mp4" });

// `null` means "no video chosen" (undefined would fall back to the default file).
const withForm = (upload: UploadUi, formFile: File | null = file) => (
  <VideoForm file={formFile ?? undefined} upload={upload} onFileSelect={jest.fn()} />
);

const renderForm = (upload: UploadUi = makeUpload()) => render(withForm(upload));

const eventsSent = () => (sendGTMEvent as jest.Mock).mock.calls.map(([payload]) => payload);
const publishButton = () => screen.getByRole("button", { name: /^(Publish|Queued…)$/ });

describe("VideoForm publishing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTag.mockReturnValue({ unwrap: () => Promise.resolve({ id: 77 }) });
    mockCreateEvent.mockReturnValue({ unwrap: () => Promise.resolve({ slug: "new-video" }) });
  });

  it("should send the thumbnail with the event when a custom one was chosen", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "choose thumbnail" }));
    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(publishButton());

    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalled());
    expect(mockCreateEvent.mock.calls[0][0].thumbnail).toBe(mockThumbnail);
    expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({ has_custom_thumbnail: true }));
  });

  it("should send the session date as a timestamp that stays on the chosen day", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(publishButton());

    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalled());
    const sent = new Date(mockCreateEvent.mock.calls[0][0].event_time);
    expect([sent.getFullYear(), sent.getMonth(), sent.getDate(), sent.getHours()]).toEqual([2025, 0, 2, 12]);
  });

  it("should open the new session and confirm with a toast after publishing", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(publishButton());

    await waitFor(() => expect(mockNavigateTo).toHaveBeenCalledWith("videoDetail", { id: "new-video" }));
    expect(mockNotification.showNotification).toHaveBeenCalledWith({
      message: "Session published successfully!",
      severity: "success",
    });
  });

  it("should reuse tags created by a failed publish when retrying", async () => {
    mockCreateEvent
      .mockReturnValueOnce({ unwrap: () => Promise.reject(new Error("boom")) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ slug: "new-video" }) });
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(publishButton());
    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(publishButton()).not.toBeDisabled());

    fireEvent.click(publishButton());
    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalledTimes(2));

    expect(mockCreateTag).toHaveBeenCalledTimes(1);
    expect(mockCreateEvent.mock.calls[1][0].tags).toEqual([9, 77]);
  });

  it("should track publish submit and success with counts only", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(publishButton());

    await waitFor(() =>
      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.UPLOAD_PUBLISH_SUCCESS,
        event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      })
    );
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_PUBLISH_SUBMIT,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      queued: false,
      has_custom_thumbnail: false,
      presenter_count: 2,
      playlist_count: 1,
      tag_count: 2,
      new_tag_count: 1,
    });
    expect(JSON.stringify(eventsSent())).not.toMatch(/Secret|brand-new|existing|private-name/);
  });

  it("should track a publish failure with the stage that failed", async () => {
    mockCreateEvent.mockReturnValue({ unwrap: () => Promise.reject(new Error("boom")) });
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(publishButton());

    await waitFor(() =>
      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.UPLOAD_PUBLISH_FAILED,
        event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
        reason: "create_event",
      })
    );
  });

  it("should track a tag creation failure as the create_tag stage", async () => {
    mockCreateTag.mockReturnValue({ unwrap: () => Promise.reject(new Error("boom")) });
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(publishButton());

    await waitFor(() =>
      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.UPLOAD_PUBLISH_FAILED,
        event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
        reason: "create_tag",
      })
    );
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });
});

describe("VideoForm queued publish", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTag.mockReturnValue({ unwrap: () => Promise.resolve({ id: 77 }) });
    mockCreateEvent.mockReturnValue({ unwrap: () => Promise.resolve({ slug: "new-video" }) });
  });

  const queuePublish = async (upload = uploading) => {
    const utils = renderForm(upload);
    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(publishButton());
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Will publish automatically"));
    return utils;
  };

  it("should publish automatically with the latest edits once the upload finishes", async () => {
    const { rerender } = await queuePublish();
    expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({ event: GA_EVENTS.UPLOAD_PUBLISH_SUBMIT, queued: true }));
    expect(mockCreateEvent).not.toHaveBeenCalled();

    // Edits made after clicking Publish must not be lost.
    fireEvent.click(screen.getByRole("button", { name: "edit title" }));
    rerender(withForm(makeUpload()));

    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalledTimes(1));
    expect(mockCreateEvent.mock.calls[0][0]).toEqual(expect.objectContaining({ title: "Edited title", video_asset_id: 42 }));
    expect(eventsSent().filter((e) => e.event === GA_EVENTS.UPLOAD_PUBLISH_SUBMIT)).toHaveLength(1);
  });

  it("should word the queued status for a paused upload", async () => {
    const { rerender } = await queuePublish();

    rerender(withForm({ ...uploading, phase: "paused" }));

    expect(screen.getByRole("status")).toHaveTextContent("Waiting for the upload to continue");
  });

  it("should let the user cancel the queued publish", async () => {
    const { rerender } = await queuePublish();

    fireEvent.click(screen.getByRole("button", { name: "Cancel queued publish" }));
    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();

    rerender(withForm(makeUpload()));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Video uploaded."));
    expect(mockCreateEvent).not.toHaveBeenCalled();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_PUBLISH_QUEUE_CANCELLED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      phase: "uploading",
    });
  });

  it("should drop the queued publish when the video is removed", async () => {
    const { rerender } = await queuePublish();

    rerender(withForm({ ...uploading, phase: "idle", isActive: false, percent: 0 }, null));

    await waitFor(() => expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled());
    expect(screen.queryByRole("button", { name: "Cancel queued publish" })).not.toBeInTheDocument();
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("should track a queued publish that is dropped because the upload failed", async () => {
    const { rerender } = await queuePublish();

    rerender(withForm({ ...uploading, phase: "failed", isActive: false, error: "Upload failed. Please try again." }));

    await waitFor(() =>
      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.UPLOAD_PUBLISH_FAILED,
        event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
        reason: "upload_failed",
      })
    );
    expect(mockCreateEvent).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Cancel queued publish" })).not.toBeInTheDocument();
  });
});
