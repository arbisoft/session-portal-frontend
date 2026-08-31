import { render, screen, fireEvent } from "@testing-library/react";

import ErrorPage from "./error";

const mockCaptureException = jest.fn();

jest.mock("@sentry/nextjs", () => ({
  captureException: (error: unknown) => mockCaptureException(error),
}));

const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ back: mockBack })),
}));

jest.mock("@/components/Button", () => ({
  __esModule: true,
  default: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock("@/components/EmptyState", () => ({
  __esModule: true,
  default: ({ heading, ctas }: { heading: string; ctas: React.ReactNode }) => (
    <div>
      <p>{heading}</p>
      {ctas}
    </div>
  ),
}));

describe("Error", () => {
  const mockReload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });
  });

  it("should report the error to Sentry", () => {
    const error = Object.assign(new Error("Something exploded"), { digest: "abc" });
    render(<ErrorPage error={error} reset={jest.fn()} />);

    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it("should call reset when the Reload button is clicked", () => {
    const reset = jest.fn();
    const error = Object.assign(new Error("Something exploded"), { digest: "abc" });
    render(<ErrorPage error={error} reset={reset} />);

    fireEvent.click(screen.getByText("Reload"));

    expect(reset).toHaveBeenCalled();
  });

  it("should call router.back when the Go back button is clicked", () => {
    const error = Object.assign(new Error("Something exploded"), { digest: "abc" });
    render(<ErrorPage error={error} reset={jest.fn()} />);

    fireEvent.click(screen.getByText("Go back"));

    expect(mockBack).toHaveBeenCalled();
  });

  it("should hard reload once when a chunk load error occurs", () => {
    const error = Object.assign(new Error("Failed to load chunk /_next/static/chunks/859914510891f211.js from module 964893"), {
      digest: "abc",
    });
    render(<ErrorPage error={error} reset={jest.fn()} />);

    expect(mockReload).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("chunk-load-error-reloaded")).toBe("true");
  });

  it("should recognize ChunkLoadError by name as well as message", () => {
    const error = Object.assign(new Error("boom"), { name: "ChunkLoadError", digest: "abc" });
    render(<ErrorPage error={error} reset={jest.fn()} />);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("should not reload again if a chunk load error already triggered a reload this session", () => {
    sessionStorage.setItem("chunk-load-error-reloaded", "true");
    const error = Object.assign(new Error("Failed to load chunk foo.js from module 123"), { digest: "abc" });
    render(<ErrorPage error={error} reset={jest.fn()} />);

    expect(mockReload).not.toHaveBeenCalled();
  });

  it("should not reload for non-chunk errors", () => {
    const error = Object.assign(new Error("Unrelated failure"), { digest: "abc" });
    render(<ErrorPage error={error} reset={jest.fn()} />);

    expect(mockReload).not.toHaveBeenCalled();
  });
});
