import Box from "@mui/material/Box";
import { stackClasses } from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

export const VideoListingContainer = styled("div", {
  name: "VideoListingContainer",
})(
  ({ theme }) => css`
    display: grid;
    gap: ${theme.spacing(3)};
    grid-template-columns: repeat(auto-fill, minmax(287px, 1fr));
    padding-top: ${theme.spacing(3)};
    width: 100%;
  `
);

export const FilterBox = styled(Box, {
  name: "FilterBox",
})(
  ({ theme }) => css`
    width: 100%;
    .${stackClasses.root} {
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 20px;
      width: 100%;

      .${typographyClasses.h2} {
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        color: ${theme.palette.colors.white};
        display: -webkit-box;
        font-size: 24px;
        font-style: normal;
        font-weight: 500;
        letter-spacing: 0.4px;
        line-height: 28px;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 10px;
        text-transform: capitalize;
      }
    }
  `
);
