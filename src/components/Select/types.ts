import { SelectProps as MuiSelectProps, SelectChangeEvent } from "@mui/material/Select";

export type SelectProps = {
  menuItems: { value: string; label: string }[];
  handleChange: (event: SelectChangeEvent) => void;
} & MuiSelectProps;
