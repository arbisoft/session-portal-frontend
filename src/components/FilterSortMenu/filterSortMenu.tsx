import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import { SortOption } from "@/models/Events";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

import { FilterSortMenuProps } from "./types";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

const FilterSortMenu = ({
  anchorEl,
  availableYears,
  id = "filter-sort-menu",
  labelledBy,
  onClear,
  onClose,
  onSortChange,
  onYearChange,
  sort,
  year,
}: FilterSortMenuProps) => {
  const handleSortChange = (value: SortOption) => {
    trackEvent(GA_EVENTS.VIDEO_SORT_CHANGE, ANALYTICS_CATEGORY.VIDEOS_LISTING, { sort: value });
    onSortChange(value);
    onClose();
  };

  const handleYearChange = (value: string) => {
    trackEvent(GA_EVENTS.VIDEO_FILTER_YEAR, ANALYTICS_CATEGORY.VIDEOS_LISTING, { year: value });
    onYearChange(value);
    onClose();
  };

  const handleClear = () => {
    trackEvent(GA_EVENTS.VIDEO_FILTER_CLEAR, ANALYTICS_CATEGORY.VIDEOS_LISTING);
    onClear();
    onClose();
  };

  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: { style: { width: 220 } },
        list: {
          "aria-labelledby": labelledBy,
          role: "menu",
          "aria-activedescendant": sort,
          style: {
            maxHeight: 500,
            overflowY: "auto",
          },
        },
      }}
    >
      <Typography component="li" variant="h6" sx={{ px: 2, py: 1 }} id="sort-section" role="heading" aria-level={3}>
        Sort By
      </Typography>
      {SORT_OPTIONS.map(({ label, value }) => (
        <MenuItem
          key={value}
          id={value}
          selected={sort === value}
          onClick={() => handleSortChange(value)}
          role="menuitemradio"
          aria-checked={sort === value}
        >
          {label}
        </MenuItem>
      ))}

      <Divider component="li" role="separator" sx={{ my: 1 }} />

      <Typography component="li" variant="h6" sx={{ px: 2, py: 1 }} id="filter-section" role="heading" aria-level={3}>
        Filter by
      </Typography>

      {availableYears.map(({ label, value }) => (
        <MenuItem
          key={value}
          id={`year-${value}`}
          selected={year === value}
          onClick={() => handleYearChange(value)}
          role="menuitemradio"
          aria-checked={year === value}
        >
          {label}
        </MenuItem>
      ))}

      <Divider component="li" role="separator" sx={{ my: 1 }} />

      <MenuItem onClick={handleClear} role="menuitem" aria-label="Clear all filters">
        <Typography color="text.primary">Clear All Filters</Typography>
      </MenuItem>
    </Menu>
  );
};

export default FilterSortMenu;
