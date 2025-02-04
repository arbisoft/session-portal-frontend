import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export type ButtonColor = "primary" | "secondary";

type PropsToBeOmmited = "color";

export interface ButtonProps extends Omit<MuiButtonProps, PropsToBeOmmited> {
  buttonType?: "normal" | "icon";
  className?: string;
  color?: ButtonColor;
  isActive?: boolean;
  loading?: boolean;
}
