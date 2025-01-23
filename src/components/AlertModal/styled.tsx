import Alert from "@mui/material/Alert";
import { styled, css } from "@mui/material/styles";

export const AlertContainer = styled(Alert, {
  name: "AlertContainer",
})(
  () => css`
    width: 100%;
  `
);
