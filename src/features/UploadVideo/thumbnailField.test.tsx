import { sendGTMEvent } from "@next/third-parties/google";

import { THUMBNAIL_MAX_BYTES } from "@/constants/constants";
import { customRender as render, fireEvent, screen } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import ThumbnailField from "./thumbnailField";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockNotification = { showNotification: jest.fn() };
jest.mock("@/components/Notification", () => ({ useNotification: () => mockNotification }));

const image = (name = "cover.png", type = "image/png", size = 2048) => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const setup = (thumbnail: File | null = null) => {
  const onChange = jest.fn();
  const utils = render(<ThumbnailField thumbnail={thumbnail} onChange={onChange} />);
  const input = utils.container.querySelector("input[type=file]") as HTMLInputElement;
  return { ...utils, input, onChange };
};

describe("ThumbnailField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => "blob:preview");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("should mark auto-generated as the pressed choice and explain it", () => {
    setup();

    expect(screen.getByRole("button", { name: "Auto-generated" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Custom image" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/A frame from the video is picked automatically/)).toBeInTheDocument();
  });

  it("should open the file dialog when Custom image is chosen", () => {
    const { input } = setup();
    const click = jest.spyOn(input, "click");

    fireEvent.click(screen.getByRole("button", { name: "Custom image" }));

    expect(click).toHaveBeenCalled();
  });

  it("should accept an image, track it without the file name and report it", () => {
    const { input, onChange } = setup();
    const file = image("private-name.png");

    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith(file);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_THUMBNAIL_SELECT,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      option: "custom",
    });
    expect(JSON.stringify((sendGTMEvent as jest.Mock).mock.calls)).not.toContain("private-name");
  });

  it("should ignore an empty selection", () => {
    const { input, onChange } = setup();

    fireEvent.change(input, { target: { files: [] } });

    expect(onChange).not.toHaveBeenCalled();
    expect(sendGTMEvent).not.toHaveBeenCalled();
  });

  it.each([
    ["an unsupported type", image("notes.pdf", "application/pdf"), "Thumbnail must be a JPG, PNG or WebP image"],
    ["an image that is too large", image("huge.png", "image/png", THUMBNAIL_MAX_BYTES + 1), "Thumbnail must be 5MB or smaller"],
  ])("should reject %s", (_, file, message) => {
    const { input, onChange } = setup();

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockNotification.showNotification).toHaveBeenCalledWith({ message, severity: "error" });
    expect(onChange).not.toHaveBeenCalled();
    expect(sendGTMEvent).not.toHaveBeenCalled();
  });

  it("should preview the chosen image and let it be replaced or removed", () => {
    const { input, onChange } = setup(image("cover.png", "image/png", 2048));
    const click = jest.spyOn(input, "click");

    expect(screen.getByRole("img", { name: "Selected thumbnail preview" })).toHaveAttribute("src", "blob:preview");
    expect(screen.getByText("cover.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Custom image" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(click).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_THUMBNAIL_SELECT,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      option: "auto_generated",
    });
  });

  it("should do nothing when auto-generated is clicked while it is already chosen", () => {
    const { onChange } = setup();

    fireEvent.click(screen.getByRole("button", { name: "Auto-generated" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(sendGTMEvent).not.toHaveBeenCalled();
  });
});
