import Box from "@mui/material/Box";
import { chipClasses } from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const SidebarContainer = styled(Box)({
  height: "100%",
  width: "100%",
  a: {
    textDecoration: "none",
  },
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
  color: theme.palette.common.white,
})) as typeof MenuItem;

export const HomeRow = styled(Box, {
  name: "HomeRow",
})(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  gap: theme.spacing(0.5),
}));

// MUI 9 MenuItems must live inside a MenuList. This one only provides that context for the Home link, so it is
// presentational: the filter button next to it must not end up inside a role="menu".
export const HomeMenuList = styled(MenuList)({
  flex: 1,
  minWidth: 0,
  padding: 0,
});

export const Text = styled(Typography)({
  lineHeight: 1.2,
  fontWeight: 500,
  letterSpacing: 0.4,
  whiteSpace: "normal",
  display: "-webkit-box",
  overflow: "hidden",
  maxWidth: "100%",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: "3",
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
      text-decoration: none;

      .${chipClasses.icon} {
        margin: 0;
      }
    }
  `
);
