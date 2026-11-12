import { useId, useState } from "react";

import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import FilterSortMenu from "@/components/FilterSortMenu";
import { SORT_LABELS } from "@/constants/sort";

import { FilterSortControlProps } from "./types";

const FilterSortControl = ({ availableYears, onClear, onSortChange, onYearChange, sort, year }: FilterSortControlProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);
  const idPrefix = useId();
  const labelId = `${idPrefix}-label`;
  const buttonId = `${idPrefix}-button`;
  const menuId = `${idPrefix}-menu`;

  const currentChoice = year ? `${year} · ${SORT_LABELS[sort]}` : SORT_LABELS[sort];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }} data-testid="filter-sort-control">
      <Typography variant="bodyMedium" color="textSecondary" id={labelId}>
        Filter and Sort
      </Typography>

      <Button
        id={buttonId}
        variant="outlined"
        color="inherit"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-labelledby={`${labelId} ${buttonId}`}
        endIcon={isOpen ? <ArrowDropUp aria-hidden="true" /> : <ArrowDropDown aria-hidden="true" />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ minWidth: 200, justifyContent: "space-between" }}
      >
        {currentChoice}
      </Button>

      <FilterSortMenu
        anchorEl={anchorEl}
        availableYears={availableYears}
        id={menuId}
        labelledBy={labelId}
        sort={sort}
        year={year}
        onClose={() => setAnchorEl(null)}
        onSortChange={onSortChange}
        onYearChange={onYearChange}
        onClear={onClear}
      />
    </Box>
  );
};

export default FilterSortControl;
