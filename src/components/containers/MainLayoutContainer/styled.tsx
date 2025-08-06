import { backdropClasses } from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Grid2 from "@mui/material/Grid2";
import { styled, css } from "@mui/material/styles";

export const MainContainer = styled(Container, {
  name: "MainContainer",
})(({ theme }) => {
  return css`
    display: flex;
    gap: 30px;
    min-height: 100vh;
    padding: ${theme.spacing(4, 0)};
    padding-top: ${theme.spacing(12)};
  `;
});

export const LeftSidebar = styled(Box, {
  name: "LeftSidebar",
})(() => {
  return css`
    flex-shrink: 0;
    width: 240px;
  `;
});

export const ContentContainer = styled(Grid2, {
  name: "ContentContainer",
})(({ theme }) => {
  return css`
    align-content: flex-start;
    flex: 1;
    ${theme.breakpoints.down("sm")} {
      padding: ${theme.spacing(0, 2)};
    }
  `;
});

export const RightSidebar = styled(Box, {
  name: "RightSidebar",
})(() => {
  return css`
    flex-shrink: 0;
    width: 300px;
  `;
});

export const StyledDrawer = styled(Drawer, {
  name: "StyledDrawer",
})(({ theme }) => {
  return css`
    &,
    .${backdropClasses.root}, .${drawerClasses.paper} {
      top: 64px;

      ${theme.breakpoints.down("lg")} {
        top: 56px;
      }
    }
    .${backdropClasses.root} {
      background-color: transparent;
    }
  `;
});
