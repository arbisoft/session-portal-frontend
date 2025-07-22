import Box from "@mui/material/Box";
import { styled, css } from "@mui/material/styles";

export const StyledSliderContainer = styled(Box, {
  name: "StyledSliderContainer",
})(
  () => css`
    width: 100%;
    position: relative;
  `
);
