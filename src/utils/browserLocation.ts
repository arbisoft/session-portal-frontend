// Thin wrappers around window.location so callers (and their tests) don't depend on
// the non-configurable jsdom `window.location`, which can't be redefined in tests.
export const reloadPage = (): void => {
  window.location.reload();
};

export const getLocationSearch = (): string => (typeof window === "undefined" ? "" : window.location.search);
