import { SelectProps as MuiSelectProps } from "@mui/material/Select";

export type SelectProps = {
  menuItems: { value: string; label: string }[];
} & MuiSelectProps;
