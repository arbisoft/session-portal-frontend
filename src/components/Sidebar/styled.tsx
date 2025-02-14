import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
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
})<{ $isSelected: boolean }>(({ $isSelected }) => {
  return css`
    flex-direction: row;
    gap: 10px;
    padding: 12px;
    cursor: pointer;
    color: #fff;
    border-radius: 8px;
    background-color: ${$isSelected ? "rgba(255, 255, 255, 0.2)" : "transparent"};

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
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
