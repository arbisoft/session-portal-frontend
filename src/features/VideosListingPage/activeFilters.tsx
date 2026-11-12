import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import { DEFAULT_SORT, SORT_LABELS } from "@/constants/sort";
import { SortOption } from "@/models/Events";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

interface ActiveFiltersProps {
  onClearAll: VoidFunction;
  onClearSort: VoidFunction;
  onClearYear: VoidFunction;
  sort: SortOption;
  year?: string;
}

// onClick on the whole chip (not only the cross) makes removal work from the keyboard with Enter.
const FilterChip = ({ label, onRemove }: { label: string; onRemove: VoidFunction }) => (
  <Chip
    label={label}
    size="small"
    variant="outlined"
    aria-label={`Remove filter ${label}`}
    onClick={onRemove}
    onDelete={onRemove}
  />
);

const ActiveFilters = ({ onClearAll, onClearSort, onClearYear, sort, year }: ActiveFiltersProps) => {
  const isSortActive = sort !== DEFAULT_SORT;

  if (!year && !isSortActive) return null;

  const remove = (filter: "year" | "sort", onRemove: VoidFunction) => () => {
    trackEvent(GA_EVENTS.VIDEO_FILTER_REMOVE, ANALYTICS_CATEGORY.VIDEOS_LISTING, { filter });
    onRemove();
  };

  const clearAll = () => {
    trackEvent(GA_EVENTS.VIDEO_FILTER_CLEAR, ANALYTICS_CATEGORY.VIDEOS_LISTING, { source: "active_filters" });
    onClearAll();
  };

  return (
    <Box
      role="group"
      aria-label="Active filters"
      data-testid="active-filters"
      sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}
    >
      {year && <FilterChip label={`Year: ${year}`} onRemove={remove("year", onClearYear)} />}
      {isSortActive && <FilterChip label={`Sort: ${SORT_LABELS[sort]}`} onRemove={remove("sort", onClearSort)} />}
      <Button size="small" color="inherit" onClick={clearAll}>
        Clear filters
      </Button>
    </Box>
  );
};

export default ActiveFilters;
