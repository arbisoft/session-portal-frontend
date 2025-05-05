import { css, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const StyledReadMore = styled(Typography, { name: "Logo" })(() => {
  return css`
    white-space: pre-line;

    .hidden {
      display: none;
    }
    .show-more-button {
      cursor: pointer;
      display: block;
      font-size: 14px;
      margin-top: 10px;
      text-decoration: underline;
      text-transform: capitalize;
    }
  `;
});
