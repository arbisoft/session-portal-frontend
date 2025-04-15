import Box from "@mui/material/Box";
import { chipClasses } from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { pxToRem, shouldForwardProp } from "@/utils/styleUtils";

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

export const StyledMenuItem = styled(MenuItem, {
  name: "MenuItem",
  shouldForwardProp,
})(() => {
  return css`
    border-radius: 6px;
    cursor: pointer;
    flex-direction: row;
    gap: 10px;
    padding: 12px;
  `;
});

export const Text = styled(Typography, {
  name: "Text",
})(() => {
  return css`
    font-size: ${pxToRem(14)};
    line-height: 12px;
    font-weight: 500;
    letter-spacing: 0.4px;
  `;
});

export const TagsContainer = styled(Box, {
  name: "TagsContainer",
})(
  () => css`
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    padding-top: 30px;

    .${chipClasses.root} {
      border-radius: 6px;
      cursor: pointer;
      text-transform: capitalize;

      .${chipClasses.icon} {
        margin: 0;
      }
    }
  `
);
