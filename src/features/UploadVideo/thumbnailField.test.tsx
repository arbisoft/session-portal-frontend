import { useState } from "react";

import { sendGTMEvent } from "@next/third-parties/google";

import { THUMBNAIL_MAX_BYTES } from "@/constants/constants";
import { customRender as render, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";
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

// jsdom never loads images, so the probe Image reports whatever size the test asks for.
const mockImageSize = (width: number, height: number) => {
  jest.spyOn(global, "Image").mockImplementation(() => {
    const probe = { naturalWidth: width, naturalHeight: height, onload: null } as unknown as HTMLImageElement;
    Object.defineProperty(probe, "src", { set: () => setTimeout(() => probe.onload?.(new Event("load"))) });
    return probe;
  });
};

const Harness = ({ initial = null }: { initial?: File | null }) => {
  const [file, setFile] = useState<File | null>(initial);
  return <ThumbnailField thumbnail={file} onChange={setFile} />;
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
      source: "picker",
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
    ["an unsupported type", image("notes.pdf", "application/pdf"), "Thumbnail must be a JPG, PNG or WebP image", "invalid_type"],
    [
      "an image that is too large",
      image("huge.png", "image/png", THUMBNAIL_MAX_BYTES + 1),
      "Thumbnail must be 5MB or smaller",
      "file_too_large",
    ],
  ])("should reject %s and track only the reason", (_, file, message, reason) => {
    const { input, onChange } = setup();

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockNotification.showNotification).toHaveBeenCalledWith({ message, severity: "error" });
    expect(onChange).not.toHaveBeenCalled();
    expect(sendGTMEvent).toHaveBeenCalledTimes(1);
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_THUMBNAIL_REJECTED,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      reason,
    });
    expect(JSON.stringify((sendGTMEvent as jest.Mock).mock.calls)).not.toMatch(/notes|huge/);
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

  it("should show the accepted formats, size limit and recommended size before a file is chosen", () => {
    setup();

    expect(screen.getByText("JPG, PNG or WebP, up to 5MB. Recommended: 16:9, at least 1280×720.")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Thumbnail (optional)" })).toHaveAccessibleDescription(/up to 5MB/);
  });

  it("should keep the chosen image when switching to auto-generated and restore it on Custom image", () => {
    const file = image("kept.png");
    const { container } = render(<Harness initial={file} />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    const click = jest.spyOn(input, "click");

    fireEvent.click(screen.getByRole("button", { name: "Auto-generated" }));
    expect(screen.queryByRole("img", { name: "Selected thumbnail preview" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Custom image" }));

    expect(click).not.toHaveBeenCalled();
    expect(screen.getByText("kept.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replace" })).toBeInTheDocument();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_THUMBNAIL_SELECT,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      option: "custom",
      source: "restored",
    });
  });

  it("should forget the image after Remove so Custom image opens the picker again", () => {
    const { container } = render(<Harness initial={image("gone.png")} />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    const click = jest.spyOn(input, "click");

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.click(screen.getByRole("button", { name: "Custom image" }));

    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("gone.png")).not.toBeInTheDocument();
  });

  it("should warn about a portrait image that is also too small", async () => {
    mockImageSize(720, 1280);
    setup(image("portrait.png"));

    expect(await screen.findByText(/portrait, so it will be cropped to 16:9/)).toBeInTheDocument();
    expect(screen.getByText(/smaller than 1280×720/)).toBeInTheDocument();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_THUMBNAIL_WARNING,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      portrait: true,
      small: true,
    });
  });

  it("should warn about a tiny landscape image only for its size", async () => {
    mockImageSize(160, 90);
    setup(image("tiny.png"));

    expect(await screen.findByText(/smaller than 1280×720/)).toBeInTheDocument();
    expect(screen.queryByText(/portrait/)).not.toBeInTheDocument();
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.UPLOAD_THUMBNAIL_WARNING,
      event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
      portrait: false,
      small: true,
    });
  });

  it("should report a poor image once, not again when it is switched away and back", async () => {
    mockImageSize(160, 90);
    render(<Harness initial={image("tiny.png")} />);
    await screen.findByText(/smaller than 1280×720/);

    fireEvent.click(screen.getByRole("button", { name: "Auto-generated" }));
    fireEvent.click(screen.getByRole("button", { name: "Custom image" }));
    await screen.findByText(/smaller than 1280×720/);

    const warnings = (sendGTMEvent as jest.Mock).mock.calls.filter(([e]) => e.event === GA_EVENTS.UPLOAD_THUMBNAIL_WARNING);
    expect(warnings).toHaveLength(1);
  });

  it("should not warn about a 1280×720 image", async () => {
    mockImageSize(1280, 720);
    setup(image("good.png"));

    await waitFor(() => expect(global.Image).toHaveBeenCalled());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(sendGTMEvent).not.toHaveBeenCalled();
  });
});
