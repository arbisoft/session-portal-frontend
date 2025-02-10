import InputBase, { inputBaseClasses } from "@mui/material/InputBase";
import { alpha, css, styled } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

export const Logo = styled("div", { name: "Logo" })(({ theme }) => {
  return css`
    align-items: center;
    display: flex;
    width: 240px;

    svg {
      color: red;
      margin-right: 8px;
    }

    .${typographyClasses.h6} {
      color: ${theme.palette.common.white};
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      text-decoration: none;
    }
  `;
});

export const Search = styled("div", { name: "Search" })(({ theme }) => {
  return css`
    align-items: center;
    background-color: ${alpha(theme.palette.common.white, 0.15)};
    border-radius: ${theme.shape.borderRadius * 2}px;
    display: flex;
    justify-content: space-between;
    margin-left: 0;
    width: 450px;

    &:hover {
      background-color: ${alpha(theme.palette.common.white, 0.25)};
    }
  `;
});

export const SearchIconWrapper = styled("div", { name: "SearchIconWrapper" })(({ theme }) => {
  return css`
    align-items: center;
    background-color: ${alpha(theme.palette.common.white, 0.25)};
    border-bottom-right-radius: ${theme.shape.borderRadius * 2}px;
    border-top-right-radius: ${theme.shape.borderRadius * 2}px;
    display: flex;
    height: 100%;
    justify-content: center;
    padding: ${theme.spacing(0, 2)};
    pointer-events: none;
  `;
});

export const StyledInputBase = styled(InputBase, { name: "StyledInputBase" })(
  ({ theme }) => css`
    color: inherit;
    width: 100%;
    & .${inputBaseClasses.input} {
      padding: ${theme.spacing(1, 1, 1, 1)};
      padding-right: calc(1em + ${theme.spacing(4)});
    }
  `
);
