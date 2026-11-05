import { useState, useMemo, useRef, useLayoutEffect, CSSProperties, KeyboardEvent } from "react";

import { StyledReadMore } from "./styled";
import { ReadMoreProps } from "./types";

const useExpandToggle = (onToggle?: ReadMoreProps["onToggle"]) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    // Called with the current value (not from inside the state updater, which may run twice).
    onToggle?.(!isExpanded);
    setIsExpanded(!isExpanded);
  };

  const handleKeyboard = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleExpand();
    }
  };

  return { isExpanded, toggleExpand, handleKeyboard };
};

const LineClampedReadMore = ({ className, text, maxLines = 4, showMoreText, showLessText, onToggle }: ReadMoreProps) => {
  const { isExpanded, toggleExpand, handleKeyboard } = useExpandToggle(onToggle);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element || isExpanded) return undefined;

    // Only measured while collapsed: when expanded nothing is clamped, so the toggle must stay available.
    const measure = () => setCanExpand(element.scrollHeight > element.clientHeight);

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text, maxLines, isExpanded]);

  return (
    <StyledReadMore className={className} variant="bodySmall" color="textSecondary" tabIndex={0}>
      <span
        ref={textRef}
        data-testid="clamped-text"
        className={isExpanded ? "" : "clamped"}
        style={{ "--read-more-max-lines": maxLines } as CSSProperties}
      >
        {text}
      </span>
      {canExpand && (
        <span
          className="show-more-button"
          data-testid="show-more-button"
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onKeyDown={handleKeyboard}
          onClick={toggleExpand}
        >
          {isExpanded ? showLessText : showMoreText}
        </span>
      )}
    </StyledReadMore>
  );
};

const WordLimitedReadMore = ({ className, text, amountOfWords = 36, showMoreText, showLessText, onToggle }: ReadMoreProps) => {
  const { isExpanded, toggleExpand, handleKeyboard } = useExpandToggle(onToggle);

  const { visibleText, hiddenText, canExpand } = useMemo(() => {
    const words = text.split(" ");
    const canTextExpand = words.length > amountOfWords;
    return {
      visibleText: canTextExpand ? words.slice(0, amountOfWords - 1).join(" ") : text,
      hiddenText: canTextExpand ? words.slice(amountOfWords - 1).join(" ") : "",
      canExpand: canTextExpand,
    };
  }, [text, amountOfWords]);

  return (
    <StyledReadMore className={className} variant="bodySmall" color="textSecondary" tabIndex={0}>
      {visibleText}
      {canExpand && (
        <>
          {!isExpanded && <span>... </span>}
          <span data-testid="hidden-text" className={!isExpanded ? "hidden" : ""} aria-hidden={!isExpanded}>
            {" " + hiddenText}
          </span>
          <span
            className="show-more-button"
            data-testid="show-more-button"
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            onKeyDown={handleKeyboard}
            onClick={toggleExpand}
          >
            {isExpanded ? showLessText : showMoreText}
          </span>
        </>
      )}
    </StyledReadMore>
  );
};

// `key={text}` resets the expanded/measured state when the text changes (e.g. navigating to another video).
const ReadMore = (props: ReadMoreProps) => {
  return props.maxLines ? <LineClampedReadMore key={props.text} {...props} /> : <WordLimitedReadMore {...props} />;
};

export default ReadMore;
