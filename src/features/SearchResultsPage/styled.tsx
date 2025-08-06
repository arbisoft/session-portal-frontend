import Box from "@mui/material/Box";
import { stackClasses } from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { pxToRem } from "@/utils/styleUtils";

export const SearchResultsContainer = styled("div", {
  name: "SearchResultsContainer",
})(
  () => css`
    width: 100%;
    padding-bottom: 30px;
  `
);

export const FilterBox = styled(Box, {
  name: "FilterBox",
})(
  ({ theme }) => css`
    width: 100%;
    margin-bottom: 20px;

    .${stackClasses.root} {
      align-items: center;
      flex-direction: row;
      justify-content: space-between;
      width: 100%;

      .${typographyClasses.h2} {
        color: ${theme.palette.common.white};
        font-size: ${pxToRem(24)};
        font-weight: 500;
        text-transform: capitalize;

        ${theme.breakpoints.down("sm")} {
          font-size: ${pxToRem(20)};
          width: 50%;
        }
      }
    }
  `
);

export const SearchCardLoadingState = styled(Box, {
  name: "SearchCardLoadingState",
})(
  () => css`
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    margin-bottom: 1rem;
  `
);

export const NoSearchResultsWrapper = styled("div", {
  name: "NoSearchResultsWrapper",
})(
  ({ theme }) => css`
    margin-top: 10rem;

    .${typographyClasses.h3} {
      color: ${theme.palette.common.white};
      font-size: ${pxToRem(24)};
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.4px;
      line-height: 28px;
      text-align: center;
    }
  `
);
