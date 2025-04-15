import React, { MouseEventHandler, useState } from "react";

import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import { useTranslation } from "@/services/i18n/client";

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
  const [sortBy, setSortBy] = useState(initialSort);
  const [yearFilter, setYearFilter] = useState<string | undefined>(initialYear);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const { t } = useTranslation("videos");

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
    handleClose();
    onClear();
  };

  const sortByText = sortBy === "newest" ? t("newest_to_oldest") : t("oldest_to_newest");

  return (
    <DropdownContainer>
      <Typography variant="bodyLarge" color="textSecondary">
        {t("sort_and_filter")}
      </Typography>

      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={!open ? <ArrowDropDown /> : <ArrowDropUp />}
        sx={{ minWidth: 200, justifyContent: "space-between" }}
        size="large"
      >
        {yearFilter ? `Year: ${yearFilter} (${sortByText})` : sortByText}
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} slotProps={{ paper: { style: { width: 200 } } }}>
        <Typography variant="h6" sx={{ px: 2, py: 1 }}>
          {t("sort_by")}
        </Typography>
        <MenuItem selected={sortBy === "newest"} onClick={() => handleSortChange("newest")}>
          {t("newest_to_oldest")}
        </MenuItem>
        <MenuItem selected={sortBy === "oldest"} onClick={() => handleSortChange("oldest")}>
          {t("oldest_to_newest")}
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <Typography variant="h6" sx={{ px: 2, py: 1 }}>
          {t("filter_by")}
        </Typography>
        <Box maxHeight={300} overflow="scroll">
          {availableYears.map(({ label, value }) => (
            <MenuItem key={value} selected={yearFilter === value} onClick={() => handleYearFilter(value)}>
              {label}
            </MenuItem>
          ))}
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={clearFilters}>
          <Typography color="primary">{t("clear_all_filters")}</Typography>
        </MenuItem>
      </Menu>
    </DropdownContainer>
  );
};

export default DateFilterDropdown;
