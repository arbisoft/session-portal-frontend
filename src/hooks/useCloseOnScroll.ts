import { useEffect, useRef } from "react";

export const useCloseOnScroll = (scrollContainerId: string, onScroll: VoidFunction) => {
  const onScrollRef = useRef(onScroll);

  useEffect(() => {
    onScrollRef.current = onScroll;
  });

  useEffect(() => {
    const scrollContainer = document.getElementById(scrollContainerId);
    if (!scrollContainer) return;

    const handleScroll = () => onScrollRef.current();
    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [scrollContainerId]);
};
