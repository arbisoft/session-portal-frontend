import Box from "@mui/material/Box";
import { selectClasses } from "@mui/material/Select";
import { styled, css, alpha } from "@mui/material/styles";

import { pxToRem } from "@/utils/styleUtils";

export const SelectWrapper = styled(Box, {
  name: "SelectWrapper",
})(
  ({ theme }) => css`
    align-items: center;
    display: flex;
    gap: 12px;
    min-width: 124px;

    .${selectClasses.select} {
      background-color: ${alpha(theme.palette.common.white, 0.2)};
      font-size: ${pxToRem(14)};
      font-weight: 600;
    }
  `
);
