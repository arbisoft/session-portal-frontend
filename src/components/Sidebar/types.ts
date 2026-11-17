export type SidebarProps = {
  handleSidebarToggle?: VoidFunction;
  /** Sort/filter only applies to list pages; hide it where there is no list (the video page). Defaults to true. */
  isFilterVisible?: boolean;
};
