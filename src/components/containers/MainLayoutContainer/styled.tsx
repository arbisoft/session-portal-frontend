import { backdropClasses } from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export const SidebarWidth = 250;
export const containerTopSpacingMobile = 10;
export const containerTopSpacing = 12;

interface MainContainerProps {
  isSidebarAvailable?: boolean;
}

export const MainContainer = styled(Container, {
  shouldForwardProp: (prop) => prop !== "isSidebarAvailable",
})<MainContainerProps>(({ theme, isSidebarAvailable = true }) => ({
  position: "relative",
  display: "flex",
  gap: theme.spacing(4),
  paddingTop: theme.spacing(containerTopSpacingMobile),
  paddingInline: theme.spacing(0),

  [theme.breakpoints.up("sm")]: {
    paddingTop: theme.spacing(containerTopSpacing),
  },

  [theme.breakpoints.up("lg")]: {
    paddingInlineStart: isSidebarAvailable ? `calc(${SidebarWidth}px + ${theme.spacing(3)})` : theme.spacing(0),
  },
}));

export const LeftSidebar = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  width: SidebarWidth,
  position: "fixed",
  top: theme.spacing(containerTopSpacing),
  left: 0,
  zIndex: 2,

  [theme.breakpoints.up("lg")]: {
    paddingInlineStart: theme.spacing(2),
    paddingBlockEnd: theme.spacing(2),
    maxHeight: `calc(100vh - ${theme.spacing(containerTopSpacing)})`,
    overflowY: "auto",
  },
}));

export const ContentContainer = styled(Box)(({ theme }) => ({
  alignContent: "flex-start",
  width: "100%",
  flexGrow: 1,
  paddingInline: theme.spacing(2),

  [theme.breakpoints.up("sm")]: {
    paddingInline: theme.spacing(0),
  },
}));

export const RightSidebar = styled(Box)({
  flexShrink: 0,
  width: 300,
});

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  [`&, .${backdropClasses.root}, .${drawerClasses.paper}`]: {
    top: 56,

    [theme.breakpoints.up("lg")]: {
      top: 64,
    },
  },

  [`.${backdropClasses.root}`]: {
    backgroundColor: "transparent",
  },
}));
