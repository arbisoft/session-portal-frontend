import Box from "@mui/material/Box";
import { stackClasses } from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

export const VideoListingContainer = styled("div", {
  name: "VideoListingContainer",
})(
  ({ theme }) => css`
    .skeleton-loader,
    .virtuoso-grid-list {
      display: grid;
      gap: ${theme.spacing(3)};
      grid-template-columns: repeat(auto-fill, minmax(287px, 1fr));
      padding-top: ${theme.spacing(3)};
      width: 100%;
    }
  `
);

export const FilterBox = styled(Box, {
  name: "FilterBox",
})(
  ({ theme }) => css`
    width: 100%;
    .${stackClasses.root} {
      align-items: center;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 20px;
      width: 100%;

      .${typographyClasses.h2} {
        color: ${theme.palette.colors.white};
        font-size: 24px;
        font-weight: 500;
        text-transform: capitalize;
      }
    }
  `
);

export const NoSearchResultsWrapper = styled("div", {
  name: "NoSearchResultsWrapper",
})(
  ({ theme }) => css`
    margin-top: 10rem;

    .${typographyClasses.h3} {
      color: ${theme.palette.colors.white};
      font-size: 24px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.4px;
      line-height: 28px;
      text-align: center;
    }
  `
);
