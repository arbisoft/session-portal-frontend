import React from "react";

import MenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";

import { SelectFormControl } from "./styled";
import { SelectProps } from "./types";

const Select: React.FC<SelectProps> = ({ handleChange, value = "", menuItems }) => {
  return (
    <SelectFormControl>
      <MuiSelect value={value as string} onChange={handleChange} displayEmpty data-testid="sort-select">
        <MenuItem value="">Sort By</MenuItem>
        {menuItems.map((item) => (
          <MenuItem data-testid={item} key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </MuiSelect>
    </SelectFormControl>
  );
};

export default Select;
