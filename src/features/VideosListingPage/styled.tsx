import Box from "@mui/material/Box";
import { buttonClasses } from "@mui/material/Button";
import { stackClasses } from "@mui/material/Stack";
import { styled, css, alpha } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { pxToRem } from "@/utils/styleUtils";

export const VideoListingContainer = styled("div", {
  name: "VideoListingContainer",
})(
  ({ theme }) => css`
    .skeleton-loader,
    .virtuoso-grid-list {
      display: grid;
      gap: ${theme.spacing(3)};
      grid-template-columns: repeat(auto-fill, minmax(287px, 1fr));
      padding-bottom: ${theme.spacing(3)};
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
        font-size: ${pxToRem(24)};
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
      font-size: ${pxToRem(24)};
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.4px;
      line-height: 28px;
      text-align: center;
    }
  `
);

export const DropdownContainer = styled(Box, {
  name: "DropdownContainer",
})(
  ({ theme }) => css`
    align-items: center;
    display: flex;
    gap: 12px;
    color: ${theme.palette.secondary.contrastText};

    .${buttonClasses.root} {
      background-color: ${alpha(theme.palette.colors.white, 0.2)};
      border-color: ${alpha(theme.palette.colors.white, 0.3)};
      color: ${theme.palette.common.white};
      font-size: ${pxToRem(14)};
      font-weight: 600;

      &:hover {
        border-color: ${alpha(theme.palette.colors.white, 0.5)};
      }
    }
  `
);
