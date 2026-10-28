import { renderHook } from "@testing-library/react";

import { useUploadRate } from "./useUploadRate";

const TOTAL = 100 * 1024 ** 2;

describe("useUploadRate", () => {
  let now = 0;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, "now").mockImplementation(() => now);
  });

  afterEach(() => jest.restoreAllMocks());

  it("should report nothing until enough time has passed", () => {
    const { result, rerender } = renderHook(({ percent }) => useUploadRate(percent, TOTAL, true), {
      initialProps: { percent: 0 },
    });

    now += 1000;
    rerender({ percent: 5 });

    expect(result.current).toBeNull();
  });

  it("should average the speed over the elapsed time", () => {
    const { result, rerender } = renderHook(({ percent }) => useUploadRate(percent, TOTAL, true), {
      initialProps: { percent: 0 },
    });

    now += 10_000;
    rerender({ percent: 10 });

    expect(result.current).toBeCloseTo((TOTAL * 0.1) / 10);
  });

  it("should forget the speed when the transfer stops", () => {
    const { result, rerender } = renderHook(({ active, percent }) => useUploadRate(percent, TOTAL, active), {
      initialProps: { active: true, percent: 0 },
    });
    now += 10_000;
    rerender({ active: true, percent: 10 });
    expect(result.current).not.toBeNull();

    rerender({ active: false, percent: 10 });

    expect(result.current).toBeNull();
  });
});
