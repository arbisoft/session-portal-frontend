import React, { MouseEventHandler, useEffect, useState } from "react";

import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { DropdownContainer } from "./styled";

interface Props {
  availableYears: { value: string; label: string }[];
  initialSort?: string;
  initialYear?: string;
  onClear: VoidFunction;
  onSortChange: (val: string | null) => void;
  onYearChange: (val: string | null) => void;
}

const DateFilterDropdown = ({
  availableYears = [],
  initialSort = "newest",
  initialYear,
  onClear,
  onSortChange,
  onYearChange,
}: Props) => {
  const theme = useTheme();

  const [sortBy, setSortBy] = useState(initialSort);
  const [sortByText, setSortByText] = useState(initialSort);
  const [yearFilter, setYearFilter] = useState<string | undefined>(initialYear);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const sortText = initialSort === "newest" ? "Newest first" : "Oldest first";
    setSortByText(sortText);
  }, [initialSort]);

  useEffect(() => {
    if (!initialYear) {
      setYearFilter(undefined);
      onYearChange(null);
    }
  }, [initialYear]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
    handleClose();
  };

  const handleYearFilter = (year: string) => {
    setYearFilter(year);
    onYearChange(year);
    handleClose();
  };

  const clearFilters = () => {
    setSortBy("newest");
    setYearFilter(undefined);
    onSortChange("newest");
    onYearChange(null);
    onClear();
    handleClose();
  };

  return (
    <DropdownContainer>
      <Typography variant="bodyLarge" color="textSecondary" id="filter-sort-label">
        Filter and Sort
      </Typography>

      <Button
        variant="outlined"
        onClick={handleClick}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? "filter-sort-menu" : undefined}
        aria-labelledby="filter-sort-label"
        endIcon={!open ? <ArrowDropDown aria-hidden="true" /> : <ArrowDropUp aria-hidden="true" />}
        sx={{ minWidth: 200, justifyContent: "space-between" }}
      >
        {yearFilter ? `Year: ${yearFilter} (${sortByText})` : sortByText}
      </Button>

      <Menu
        id="filter-sort-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: { style: { width: 220 } },
          list: {
            "aria-labelledby": "filter-sort-label",
            role: "menu",
            "aria-activedescendant": sortBy,
            style: {
              maxHeight: 500,
              overflowY: "auto",
            },
          },
        }}
      >
        <Typography component="li" variant="h6" sx={{ px: 2, py: 1 }} id="sort-section">
          Sort By
        </Typography>
        <MenuItem
          id="newest"
          selected={sortBy === "newest"}
          onClick={() => handleSortChange("newest")}
          role="menuitemradio"
          aria-checked={sortBy === "newest"}
        >
          Newest first
        </MenuItem>
        <MenuItem
          id="oldest"
          selected={sortBy === "oldest"}
          onClick={() => handleSortChange("oldest")}
          role="menuitemradio"
          aria-checked={sortBy === "oldest"}
        >
          Oldest first
        </MenuItem>

        <Divider component="li" role="separator" sx={{ my: 1 }} />

        <Typography component="li" variant="h6" sx={{ px: 2, py: 1 }} id="filter-section">
          Filter by
        </Typography>

        {availableYears.map(({ label, value }) => (
          <MenuItem
            key={value}
            id={`year-${value}`}
            selected={yearFilter === value}
            onClick={() => handleYearFilter(value)}
            role="menuitemradio"
            aria-checked={yearFilter === value}
          >
            {label}
          </MenuItem>
        ))}

        <Divider component="li" role="separator" sx={{ my: 1 }} />

        <MenuItem onClick={clearFilters} role="menuitem" aria-label="Clear all filters">
          <Typography color={theme.palette.text.primary}>Clear All Filters</Typography>
        </MenuItem>
      </Menu>
    </DropdownContainer>
  );
};

export default DateFilterDropdown;
