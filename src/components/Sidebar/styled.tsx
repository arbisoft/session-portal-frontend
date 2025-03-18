import Box from "@mui/material/Box";
import { chipClasses } from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { styled, css, alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { shouldForwardProp } from "@/utils/styleUtils";

export const SidebarContainer = styled(Box, {
  name: "SidebarContainer",
})(() => {
  return css`
    height: 100%;
    width: 100%;
  `;
});

export const MenuStack = styled(Stack, {
  name: "MenuStack",
})(() => {
  return css`
    flex-direction: column;
    height: 100%;
    gap: 8px;
  `;
});

export const MenuItem = styled(Stack, {
  name: "MenuItem",
  shouldForwardProp,
})<{ $isSelected: boolean }>(({ theme, $isSelected }) => {
  const backgroundColor = alpha(theme.palette.colors.white, 0.2);
  return css`
    background-color: ${$isSelected ? backgroundColor : "transparent"};
    border-radius: 8px;
    color: ${theme.palette.colors.white};
    cursor: pointer;
    flex-direction: row;
    gap: 10px;
    padding: 12px;

    &:hover {
      background-color: ${backgroundColor};
    }
  `;
});

export const Text = styled(Typography, {
  name: "Text",
})(() => {
  return css`
    font-size: 14px;
    line-height: 12px;
    font-weight: 500;
    letter-spacing: 0.4px;
  `;
});

export const TagsContainer = styled(Box, {
  name: "TagsContainer",
})(
  ({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    padding-top: 30px;

    .${chipClasses.root} {
      border-radius: 6px;
      border: 1px solid ${alpha(theme.palette.common.white, 0.3)};
      cursor: pointer;
      text-transform: capitalize;

      &.${chipClasses.filled} {
        background: ${theme.palette.colors.white};
        color: ${alpha(theme.palette.common.black, 0.7)};
      }

      .${chipClasses.icon} {
        margin: 0;
      }
    }
  `
);
