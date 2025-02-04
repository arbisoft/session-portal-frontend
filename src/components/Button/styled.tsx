import Button, { buttonClasses } from "@mui/material/Button";
import { styled, css } from "@mui/material/styles";

export const IconButton = styled(Button, {
  name: "IconButton",
})(
  () => css`
    .${buttonClasses.icon} {
      margin-left: 0px;
      margin-right: 0px;
    }
  `
);
