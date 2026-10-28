import { sendGTMEvent } from "@next/third-parties/google";

import { customRender as render, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import VideoForm from "./form";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockCreateEvent = jest.fn();
const mockCreateTag = jest.fn();
const mockNavigateTo = jest.fn();
let mockIsPublishing = false;
const mockNotification = { showNotification: jest.fn() };

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({ navigateTo: mockNavigateTo }),
}));

jest.mock("@/components/Notification", () => ({
  useNotification: () => mockNotification,
}));

jest.mock("@/redux/events/apiSlice", () => ({
  useCreateEventMutation: () => [mockCreateEvent, { isLoading: mockIsPublishing }],
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
      <button
        type="button"
        onClick={() => {
          title.onChange("Secret title");
          description.onChange("Secret description");
          eventDate.onChange(new Date("2025-01-02T00:00:00Z"));
          presenters.onChange([1, 2]);
          playlists.onChange([5]);
          tags.onChange([{ id: 9, name: "existing" }, "#brand-new"]);
        }}
      >
        fill form
      </button>
    );
  };
  return {
    FORM_SCROLL_CONTAINER_ID: "upload-form-scroll",
    FormCardHeader: () => null,
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

const baseProps = { uploadProgress: 100, isUploading: false, videoAssetId: 42, uploadError: null };

const eventsSent = () => (sendGTMEvent as jest.Mock).mock.calls.map(([payload]) => payload);

describe("VideoForm analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPublishing = false;
    global.URL.createObjectURL = jest.fn(() => "blob:preview");
    global.URL.revokeObjectURL = jest.fn();
    mockCreateTag.mockReturnValue({ unwrap: () => Promise.resolve({ id: 77 }) });
    mockCreateEvent.mockReturnValue({ unwrap: () => Promise.resolve({ slug: "new-video" }) });
  });

  it("should track the thumbnail choice without exposing the file name", () => {
    const { container } = render(<VideoForm {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "auto-generated" }));
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    const file = new File(["x"], "private-name.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_THUMBNAIL_SELECT,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      option: "auto_generated",
    });
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_THUMBNAIL_SELECT,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      option: "custom",
    });
    expect(JSON.stringify(eventsSent())).not.toContain("private-name");
  });

  it("should not track a custom thumbnail when no file was chosen", () => {
    const { container } = render(<VideoForm {...baseProps} />);

    fireEvent.change(container.querySelector("input[type=file]") as HTMLInputElement, { target: { files: [] } });

    expect(sendGTMEvent).not.toHaveBeenCalled();
  });

  it("should reject a non-image thumbnail without tracking or selecting it", () => {
    const { container } = render(<VideoForm {...baseProps} />);

    const file = new File(["x"], "notes.pdf", { type: "application/pdf" });
    fireEvent.change(container.querySelector("input[type=file]") as HTMLInputElement, { target: { files: [file] } });

    expect(mockNotification.showNotification).toHaveBeenCalledWith({
      message: "Thumbnail must be an image file",
      severity: "error",
    });
    expect(sendGTMEvent).not.toHaveBeenCalled();
    expect(screen.queryByText("notes.pdf")).not.toBeInTheDocument();
  });

  it("should reuse tags created by a failed publish when retrying", async () => {
    mockCreateEvent
      .mockReturnValueOnce({ unwrap: () => Promise.reject(new Error("boom")) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ slug: "new-video" }) });
    render(<VideoForm {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole("button", { name: "Publish" })).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalledTimes(2));

    expect(mockCreateTag).toHaveBeenCalledTimes(1);
    expect(mockCreateEvent.mock.calls[1][0].tags).toEqual([9, 77]);
  });

  it("should track publish submit and success with counts only", async () => {
    render(<VideoForm {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

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
    expect(JSON.stringify(eventsSent())).not.toMatch(/Secret|brand-new|existing/);
  });

  it("should track a publish failure with the stage that failed", async () => {
    mockCreateEvent.mockReturnValue({ unwrap: () => Promise.reject(new Error("boom")) });
    render(<VideoForm {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

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
    render(<VideoForm {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() =>
      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.UPLOAD_PUBLISH_FAILED,
        event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
        reason: "create_tag",
      })
    );
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("should track a queued publish that is dropped because the upload failed", async () => {
    const { rerender } = render(<VideoForm {...baseProps} videoAssetId={null} isUploading uploadProgress={30} />);

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() =>
      expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({ event: GA_EVENTS.UPLOAD_PUBLISH_SUBMIT, queued: true }))
    );

    rerender(<VideoForm {...baseProps} videoAssetId={null} isUploading={false} uploadError="Upload failed. Please try again." />);

    await waitFor(() =>
      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.UPLOAD_PUBLISH_FAILED,
        event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
        reason: "upload_failed",
      })
    );
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("should open the thumbnail file picker when Upload a file is clicked", () => {
    const { container } = render(<VideoForm {...baseProps} />);
    const click = jest
      .spyOn(container.querySelector("input[type=file]") as HTMLInputElement, "click")
      .mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "Upload a file" }));

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("should queue the publish while uploading and publish automatically once the upload finishes", async () => {
    const { rerender } = render(<VideoForm {...baseProps} videoAssetId={null} isUploading uploadProgress={30} />);

    fireEvent.click(screen.getByRole("button", { name: "fill form" }));
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    const queued = await screen.findByRole("button", { name: "Queued…" });
    expect(queued).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Uploading 30%… (will auto-publish when done)");
    expect(mockCreateEvent).not.toHaveBeenCalled();

    rerender(<VideoForm {...baseProps} videoAssetId={42} isUploading={false} />);

    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalledTimes(1));
    expect(mockNavigateTo).toHaveBeenCalled();
  });

  it("should disable the button and show Publishing… while the event is being created", () => {
    mockIsPublishing = true;
    render(<VideoForm {...baseProps} />);

    expect(screen.getByRole("button", { name: "Publishing…" })).toBeDisabled();
  });
});
