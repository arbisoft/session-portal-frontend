import Button, { buttonClasses } from "@mui/material/Button";
import { styled, css } from "@mui/material/styles";

export const IconButton = styled(Button, {
  name: "IconButton",
})(
  () => css`
    border-radius: 50%;
    width: 36px;
    height: 36px;
    min-width: unset;

    .${buttonClasses.icon} {
      margin-left: 0px;
      margin-right: 0px;
    }
  `
);

export const StyledButton = styled(Button, {
  name: "StyledButton",
})(
  () => css`
    border-radius: 50px;
  `
);
