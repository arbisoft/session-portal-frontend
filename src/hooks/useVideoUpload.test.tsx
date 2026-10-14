import { ReactNode } from "react";

import { renderHook, act } from "@testing-library/react";
import { useDispatch } from "react-redux";

import { logout } from "@/redux/login/actions";

import { useVideoUpload } from "./useVideoUpload";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

class MockXhr {
  static instances: MockXhr[] = [];

  upload: { onprogress?: (event: { lengthComputable: boolean; loaded: number; total: number }) => void } = {};
  onload?: () => void;
  onerror?: () => void;
  status = 0;
  responseText = "";
  open = jest.fn();
  send = jest.fn();
  setRequestHeader = jest.fn();
  abort = jest.fn();

  constructor() {
    MockXhr.instances.push(this);
  }
}

const file = new File(["video"], "talk.mp4", { type: "video/mp4" });
const wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;
const latestRequest = () => MockXhr.instances[MockXhr.instances.length - 1];

describe("useVideoUpload", () => {
  const dispatch = jest.fn();
  const originalXhr = global.XMLHttpRequest;

  beforeEach(() => {
    MockXhr.instances = [];
    dispatch.mockClear();
    (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    global.XMLHttpRequest = MockXhr as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    global.XMLHttpRequest = originalXhr;
  });

  it("should post the file through the BFF proxy with the guard header", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });

    act(() => result.current.startUpload(file));

    const request = latestRequest();
    expect(request.open).toHaveBeenCalledWith("POST", "/bff/events/videoassets");
    expect(request.setRequestHeader).toHaveBeenCalledWith("x-requested-with", "session-portal");
    expect(result.current.isUploading).toBe(true);
  });

  it("should report upload progress", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));

    act(() => latestRequest().upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 200 }));

    expect(result.current.uploadProgress).toBe(25);
  });

  it("should ignore progress events whose length is not computable", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));

    act(() => latestRequest().upload.onprogress?.({ lengthComputable: false, loaded: 50, total: 0 }));

    expect(result.current.uploadProgress).toBe(0);
  });

  it("should expose the asset id after a successful upload", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));

    act(() => {
      const request = latestRequest();
      request.status = 201;
      request.responseText = JSON.stringify({ id: 42, title: "t", video_file: "u", status: "ok" });
      request.onload?.();
    });

    expect(result.current.videoAssetId).toBe(42);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should report an error when a successful response is not valid JSON", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));

    act(() => {
      const request = latestRequest();
      request.status = 201;
      request.responseText = "<html>";
      request.onload?.();
    });

    expect(result.current.videoAssetId).toBeNull();
    expect(result.current.error).toBe("Upload failed. Please try again.");
  });

  it("should report a generic error for a failed response", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));

    act(() => {
      const request = latestRequest();
      request.status = 500;
      request.onload?.();
    });

    expect(result.current.error).toBe("Upload failed. Please try again.");
  });

  it("should log the user out when the session has expired", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));

    act(() => {
      const request = latestRequest();
      request.status = 401;
      request.onload?.();
    });

    expect(dispatch).toHaveBeenCalledWith(logout());
    expect(result.current.error).toBe("Your session has expired. Please log in again.");
  });

  it("should report a network error", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));

    act(() => latestRequest().onerror?.());

    expect(result.current.error).toBe("Network error during upload.");
    expect(result.current.isUploading).toBe(false);
  });

  it("should abort the previous upload when a new file is selected", () => {
    const { result } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));
    const firstRequest = latestRequest();

    act(() => result.current.startUpload(file));

    expect(firstRequest.abort).toHaveBeenCalledTimes(1);
  });

  it("should abort the in-flight upload on unmount", () => {
    const { result, unmount } = renderHook(() => useVideoUpload(), { wrapper });
    act(() => result.current.startUpload(file));
    const request = latestRequest();

    unmount();

    expect(request.abort).toHaveBeenCalledTimes(1);
  });
});
