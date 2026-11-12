import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export type ButtonColor = "primary" | "secondary";

type PropsToBeOmitted = "color";

export interface ButtonProps extends Omit<MuiButtonProps, PropsToBeOmitted> {
  buttonType?: "normal" | "icon";
  className?: string;
  // "inherit" follows the surrounding text colour; use it where the primary colour has no contrast (dark surfaces).
  color?: ButtonColor | "inherit";
  isActive?: boolean;
  loading?: boolean;
}
