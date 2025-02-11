import Stack from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";

export const VideoListingContainer = styled(Stack, {
  name: "VideoListingContainer",
})(
  ({ theme }) => css`
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${theme.spacing(3)};
    padding-top: ${theme.spacing(3)};
  `
);
