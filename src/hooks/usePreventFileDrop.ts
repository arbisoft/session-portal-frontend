import { useEffect } from "react";

const isFileDrag = (event: DragEvent) => !!event.dataTransfer?.types?.includes("Files");

/**
 * Without this, dropping a file anywhere outside a drop zone makes the browser open it and navigate away,
 * which would abandon the page (and any upload) it was on.
 */
export const usePreventFileDrop = () => {
  useEffect(() => {
    const prevent = (event: DragEvent) => {
      if (isFileDrag(event)) event.preventDefault();
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);
};
