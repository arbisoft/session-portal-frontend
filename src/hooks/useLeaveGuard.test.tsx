import { act, renderHook } from "@testing-library/react";

import { useLeaveGuard } from "./useLeaveGuard";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

const addLink = (href: string, attrs: Record<string, string> = {}) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  Object.entries(attrs).forEach(([key, value]) => anchor.setAttribute(key, value));
  document.body.appendChild(anchor);
  return anchor;
};

const click = (element: HTMLElement, init: MouseEventInit = {}) => {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  act(() => {
    element.dispatchEvent(event);
  });
  return event;
};

describe("useLeaveGuard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    mockPush.mockClear();
  });

  it("should intercept an in-app link click while active and navigate only after confirmation", () => {
    const { result } = renderHook(() => useLeaveGuard(true));
    const event = click(addLink("/videos?x=1#top"));

    expect(event.defaultPrevented).toBe(true);
    expect(result.current.isBlocked).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();

    act(() => result.current.leave());

    expect(mockPush).toHaveBeenCalledWith("/videos?x=1#top");
    expect(result.current.isBlocked).toBe(false);
  });

  it("should stay on the page when the user declines", () => {
    const { result } = renderHook(() => useLeaveGuard(true));
    click(addLink("/videos"));

    act(() => result.current.stay());

    expect(result.current.isBlocked).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should not intercept anything when inactive", () => {
    const { result } = renderHook(() => useLeaveGuard(false));
    const event = click(addLink("/videos"));

    expect(event.defaultPrevented).toBe(false);
    expect(result.current.isBlocked).toBe(false);
  });

  it.each([
    ["an external link", () => addLink("https://example.com/x")],
    ["a link to the same page", () => addLink(window.location.href)],
    ["a new-tab link", () => addLink("/videos", { target: "_blank" })],
    ["a download link", () => addLink("/file.zip", { download: "" })],
  ])("should let %s through", (_, build) => {
    const { result } = renderHook(() => useLeaveGuard(true));
    const event = click(build());

    expect(event.defaultPrevented).toBe(false);
    expect(result.current.isBlocked).toBe(false);
  });

  it("should let a protocol-relative path through instead of handing it to the router", () => {
    const { result } = renderHook(() => useLeaveGuard(true));
    const event = click(addLink(`${window.location.origin}//evil.example/path`));

    expect(event.defaultPrevented).toBe(false);
    expect(result.current.isBlocked).toBe(false);
  });

  it("should drop a pending confirmation when the guard is switched off", () => {
    const { result, rerender } = renderHook(({ active }) => useLeaveGuard(active), { initialProps: { active: true } });
    click(addLink("/videos"));
    expect(result.current.isBlocked).toBe(true);

    rerender({ active: false });

    expect(result.current.isBlocked).toBe(false);
  });

  it("should let modified clicks and non-link clicks through", () => {
    renderHook(() => useLeaveGuard(true));
    const withModifier = click(addLink("/videos"), { ctrlKey: true });
    const plain = document.createElement("div");
    document.body.appendChild(plain);

    expect(withModifier.defaultPrevented).toBe(false);
    expect(click(plain).defaultPrevented).toBe(false);
  });

  it("should ask the browser to confirm a reload or tab close while active", () => {
    const { rerender } = renderHook(({ active }) => useLeaveGuard(active), { initialProps: { active: true } });

    const guarded = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(guarded);
    expect(guarded.defaultPrevented).toBe(true);

    rerender({ active: false });
    const free = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(free);
    expect(free.defaultPrevented).toBe(false);
  });
});
