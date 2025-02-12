import { SelectProps as MuiSelectProps, SelectChangeEvent } from "@mui/material/Select";

export type SelectProps = {
  menuItems: string[];
  handleChange: (event: SelectChangeEvent) => void;
} & MuiSelectProps;
