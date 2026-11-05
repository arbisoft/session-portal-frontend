import { css, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { pxToRem } from "@/utils/styleUtils";

export const StyledReadMore = styled(Typography, { name: "Logo" })(() => {
  return css`
    white-space: pre-line;

    .hidden {
      display: none;
    }
    .clamped {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--read-more-max-lines);
      display: -webkit-box;
      overflow: hidden;
    }
    .show-more-button {
      cursor: pointer;
      display: block;
      font-size: ${pxToRem(14)};
      margin-top: 10px;
      text-decoration: underline;
      text-transform: capitalize;
    }
  `;
});
