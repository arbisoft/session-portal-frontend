import Box from "@mui/material/Box";
import { chipClasses } from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const SidebarContainer = styled(Box)({
  height: "100%",
  width: "100%",
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

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: 6,
  cursor: "pointer",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
}));

export const Text = styled(Typography)({
  lineHeight: 1.2,
  fontWeight: 500,
  letterSpacing: 0.4,
  whiteSpace: "normal",
  display: "-webkit-box",
  overflow: "hidden",
  maxWidth: "100%",
  "-webkit-box-orient": "vertical",
  "-webkit-line-clamp": "3",
  overflowWrap: "break-word",
  textOverflow: "ellipsis",
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
