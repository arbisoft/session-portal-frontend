import { renderHook } from "@testing-library/react";

import { useCloseOnScroll } from "./useCloseOnScroll";

describe("useCloseOnScroll", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "scroll-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("should call the callback when the container scrolls", () => {
    const onScroll = jest.fn();
    renderHook(() => useCloseOnScroll("scroll-container", onScroll));

    container.dispatchEvent(new Event("scroll"));

    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it("should call the latest callback after a re-render", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(({ callback }) => useCloseOnScroll("scroll-container", callback), {
      initialProps: { callback: first },
    });

    rerender({ callback: second });
    container.dispatchEvent(new Event("scroll"));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("should stop listening after unmount", () => {
    const onScroll = jest.fn();
    const { unmount } = renderHook(() => useCloseOnScroll("scroll-container", onScroll));

    unmount();
    container.dispatchEvent(new Event("scroll"));

    expect(onScroll).not.toHaveBeenCalled();
  });

  it("should do nothing when the container does not exist", () => {
    const onScroll = jest.fn();

    expect(() => renderHook(() => useCloseOnScroll("missing-container", onScroll))).not.toThrow();
  });
});
