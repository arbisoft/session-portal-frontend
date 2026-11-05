export interface ReadMoreProps {
  amountOfWords?: number;
  className?: string;
  /** Clamp the text to this many lines (CSS line clamp) instead of truncating by word count. */
  maxLines?: number;
  /** Called when the user toggles the text, with the new expanded state. Lets callers attach analytics. */
  onToggle?: (isExpanded: boolean) => void;
  showLessText: string;
  showMoreText: string;
  text: string;
}
