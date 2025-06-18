import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputBase, { inputBaseClasses } from "@mui/material/InputBase";
import { alpha, css, styled } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { pxToRem } from "@/utils/styleUtils";

export const StyledAppBar = styled(AppBar, { name: "Logo" })(() => {
  return css`
    position: fixed;
  `;
});

export const Logo = styled("div", { name: "Logo" })(({ theme }) => {
  return css`
    align-items: center;
    cursor: pointer;
    display: flex;
    width: 240px;

    ${theme.breakpoints.down("lg")} {
      width: unset;
    }

    svg {
      color: red;
      margin-right: 8px;
    }

    .${typographyClasses.h6} {
      color: ${theme.palette.common.white};
      font-size: ${pxToRem(16)};
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      text-decoration: none;
    }
  `;
});

export const Search = styled("form", { name: "Search" })(({ theme }) => {
  return css`
    align-items: center;
    background-color: ${theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.15) : "#e3e3e3"};
    border-radius: ${theme.shape.borderRadius * 2}px;
    display: flex;
    justify-content: space-between;
    margin-left: 0;
    width: 450px;
    overflow: hidden;

    border: ${theme.palette.mode === "light" ? "1px solid #A5A5A5" : "unset"};

    &:hover {
      background-color: ${alpha(theme.palette.common.white, 0.25)};
    }

    ${theme.breakpoints.down("lg")} {
      width: 200px;
    }
  `;
});

export const SearchIconWrapper = styled(Button, { name: "SearchIconWrapper" })(({ theme }) => {
  return css`
    align-items: center;
    background-color: ${theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.25) : "#cccccc"};
    border-bottom-right-radius: ${theme.shape.borderRadius * 2}px;
    border-radius: 0;
    border-top-right-radius: ${theme.shape.borderRadius * 2}px;
    border: none;
    color: inherit;
    display: flex;
    height: 100%;
    justify-content: center;
    padding: ${theme.spacing(0, 2)};
  `;
});

export const CancelIconWrapper = styled("div", { name: "CancelIconWrapper" })(({ theme }) => {
  return css`
    padding-right: ${theme.spacing(1)};
    padding-top: ${theme.spacing(1)};
    cursor: pointer;
  `;
});

export const StyledInputBase = styled(InputBase, { name: "StyledInputBase" })(
  ({ theme }) => css`
    color: inherit;
    width: 100%;
    & .${inputBaseClasses.input} {
      padding: ${theme.spacing(1, 1, 1, 1)};
      padding-right: calc(1em + ${theme.spacing(1)});
      background-color: transparent;
    }
  `
);

export const NavbarRightArea = styled(Box, { name: "NavbarRightArea" })(
  ({ theme }) => css`
    display: flex;
    flex-grow: 0;
    gap: ${theme.spacing(2)};
    justify-content: flex-end;
    width: 240px;

    ${theme.breakpoints.down("lg")} {
      width: unset;
    }
  `
);
