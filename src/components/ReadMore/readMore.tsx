import { useState, useMemo, KeyboardEvent } from "react";

import { StyledReadMore } from "./styled";
import { ReadMoreProps } from "./types";

const ReadMore = ({ className, text, amountOfWords = 36, showMoreText, showLessText }: ReadMoreProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { visibleText, hiddenText, canExpand } = useMemo(() => {
    const words = text.split(" ");
    const canTextExpand = words.length > amountOfWords;
    return {
      visibleText: canTextExpand ? words.slice(0, amountOfWords - 1).join(" ") : text,
      hiddenText: canTextExpand ? words.slice(amountOfWords - 1).join(" ") : "",
      canExpand: canTextExpand,
    };
  }, [text, amountOfWords]);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const handleKeyboard = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleExpand();
    }
  };

  return (
    <StyledReadMore className={className} variant="bodySmall" color="textSecondary">
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

export default ReadMore;
