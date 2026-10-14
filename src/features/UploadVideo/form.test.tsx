import { customRender as render, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";

import VideoForm from "./form";

const mockCreateEvent = jest.fn();

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

const baseProps = { uploadProgress: 40, isUploading: true, videoAssetId: null, uploadError: null };

describe("VideoForm", () => {
  beforeEach(() => {
    mockCreateEvent.mockClear();
  });

  it("should label every form control so it has an accessible name", () => {
    render(<VideoForm {...baseProps} />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Presenter")).toBeInTheDocument();
    expect(screen.getByLabelText("Playlists")).toBeInTheDocument();
    expect(screen.getByLabelText("Tags")).toBeInTheDocument();
  });

  it("should announce upload progress in a status region", () => {
    render(<VideoForm {...baseProps} />);

    expect(screen.getByRole("status")).toHaveTextContent("Uploading 40%");
  });

  it("should show validation errors and not publish when required fields are missing", async () => {
    render(<VideoForm {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("At least one presenter is required")).toBeInTheDocument();
    await waitFor(() => expect(mockCreateEvent).not.toHaveBeenCalled());
  });

  it("should disable publishing until an upload has started or finished", () => {
    render(<VideoForm {...baseProps} isUploading={false} />);

    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
  });

  it("should show the upload error instead of the progress label", () => {
    render(<VideoForm {...baseProps} isUploading={false} uploadError="Upload failed. Please try again." />);

    expect(screen.getByRole("status")).toHaveTextContent("Upload failed. Please try again.");
  });
});
