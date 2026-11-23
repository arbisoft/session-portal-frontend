import { css, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { pxToRem } from "@/utils/styleUtils";

export const StyledReadMore = styled(Typography, { name: "Logo" })(() => {
  return css`
    overflow-wrap: anywhere;
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
      background: none;
      border: 0;
      color: inherit;
      cursor: pointer;
      display: block;
      font-family: inherit;
      font-size: ${pxToRem(14)};
      margin-top: 10px;
      padding: 0;
      text-align: start;
      text-decoration: underline;
      text-transform: capitalize;
    }
  `;
});
