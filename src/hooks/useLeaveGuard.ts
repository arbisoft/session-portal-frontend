import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { isValidInternalRedirectPath } from "@/utils/utils";

const hasModifier = (event: MouseEvent) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

const findInternalHref = (event: MouseEvent): string | null => {
  if (event.defaultPrevented || event.button !== 0 || hasModifier(event)) return null;
  const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return null;
  // getAttribute, not anchor.href: for an SVG <a> the property is an object, not a string.
  const url = new URL(anchor.getAttribute("href") ?? "", window.location.href);
  const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search;
  if (url.origin !== window.location.origin || isSamePage) return null;
  // The target is later passed to router.push, so it has to be a plain in-app path (never protocol-relative).
  if (!isValidInternalRedirectPath(url.pathname)) return null;
  return `${url.pathname}${url.search}${url.hash}`;
};

/**
 * Warns before the user loses work. A reload or tab close gets the browser's native prompt; clicking an in-app link is
 * intercepted (the App Router has no navigation blocker) and reported through `blockedHref` so the page can show its
 * own confirmation. Programmatic navigation (router.push) is deliberately not blocked.
 */
export const useLeaveGuard = (shouldBlock: boolean) => {
  const router = useRouter();
  const [blockedHref, setBlockedHref] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldBlock) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Required by some browsers to show the prompt.
      event.returnValue = "";
    };
    const handleClick = (event: MouseEvent) => {
      const href = findInternalHref(event);
      if (!href) return;
      event.preventDefault();
      event.stopPropagation();
      setBlockedHref(href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    // Capture phase: runs before the Next.js Link handler, which can then be stopped.
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [shouldBlock]);

  const stay = useCallback(() => setBlockedHref(null), []);

  const leave = useCallback(() => {
    if (blockedHref) router.push(blockedHref);
    setBlockedHref(null);
  }, [blockedHref, router]);

  // Gated on shouldBlock so a dialog opened before the work was finished or discarded cannot linger.
  return { isBlocked: shouldBlock && blockedHref !== null, stay, leave };
};
