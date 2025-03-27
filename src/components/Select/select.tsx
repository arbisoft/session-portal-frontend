import React from "react";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";

import { SelectWrapper } from "./styled";
import { SelectProps } from "./types";

const Select: React.FC<SelectProps> = ({ onChange, value, menuItems, labelId, label }) => {
  return (
    <SelectWrapper>
      <InputLabel>{label}</InputLabel>
      <MuiSelect value={value} onChange={onChange} displayEmpty data-testid="sort-select" labelId={labelId} size="small">
        {menuItems.map((item) => (
          <MenuItem data-testid={item.value} key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </SelectWrapper>
  );
};

export default Select;
