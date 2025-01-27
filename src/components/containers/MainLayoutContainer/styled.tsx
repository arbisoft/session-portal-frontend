import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";

export const MainContainer = styled(Container, {
  name: "MainContainer",
})(() => {
  return css`
    height: 100vh;
  `;
});

export const MainStack = styled(Stack, {
  name: "MainStack",
})(() => {
  return css`
    flex-direction: row;
    height: 100%;
  `;
});

export const SidebarContainer = styled(Box, {
  name: "SidebarContainer",
})(() => {
  return css`
    height: 100%;
    width: 220px;
    border: 1px solid #ddd;
  `;
});

export const ContentContainer = styled(Box, {
  name: "ContentContainer",
})(() => {
  return css`
    flex-grow: 1;
    height: 100%;
    padding: 2px;
  `;
});

export const RightBarContainer = styled(Box, {
  name: "RightBarContainer",
})(() => {
  return css`
    height: 100%;
    width: 230px;
    border: 1px solid #ddd;
  `;
});
