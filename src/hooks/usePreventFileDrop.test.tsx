import { renderHook } from "@testing-library/react";

import { usePreventFileDrop } from "./usePreventFileDrop";

const dispatchDrag = (type: "dragover" | "drop", types: string[]) => {
  const event = new Event(type, { cancelable: true }) as Event & { dataTransfer: unknown };
  event.dataTransfer = { types };
  window.dispatchEvent(event);
  return event;
};

describe("usePreventFileDrop", () => {
  it("should cancel file drops so the browser does not navigate to the file", () => {
    renderHook(() => usePreventFileDrop());

    expect(dispatchDrag("dragover", ["Files"]).defaultPrevented).toBe(true);
    expect(dispatchDrag("drop", ["Files"]).defaultPrevented).toBe(true);
  });

  it("should leave other drags such as text alone", () => {
    renderHook(() => usePreventFileDrop());

    expect(dispatchDrag("drop", ["text/plain"]).defaultPrevented).toBe(false);
  });

  it("should stop intercepting once unmounted", () => {
    const { unmount } = renderHook(() => usePreventFileDrop());
    unmount();

    expect(dispatchDrag("drop", ["Files"]).defaultPrevented).toBe(false);
  });
});
