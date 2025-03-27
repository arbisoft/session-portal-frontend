import Box from "@mui/material/Box";
import { stackClasses } from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

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
      flex-direction: row;
      justify-content: space-between;
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
        margin-bottom: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        text-transform: capitalize;
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
