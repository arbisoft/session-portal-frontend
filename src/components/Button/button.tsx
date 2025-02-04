import React from "react";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { ButtonProps } from "./buttonTypes";
import { IconButton } from "./styled";

const ButtonComponent: React.FC<ButtonProps> = ({
  buttonType = "normal",
  children = null,
  color = "primary",
  disabled,
  loading = false,
  ...rest
}) => {
  if (buttonType === "icon") {
    return (
      <IconButton
        {...rest}
        startIcon={loading ? <CircularProgress size={16} /> : children}
        color={color}
        disabled={loading || disabled}
      />
    );
  }

  return (
    <Button
      {...rest}
      color={color}
      disabled={loading || disabled}
      {...(loading && {
        startIcon: <CircularProgress size={16} />,
      })}
    >
      {loading ? "Loading" : children}
    </Button>
  );
};

export default ButtonComponent;
