import styled from "styled-components";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export const MainContainer = styled(Container)`
  height: 100vh;
`;

export const MainStack = styled(Stack)`
  flex-direction: row;
  height: 100%;
`;

export const SidebarContainer = styled(Box)`
  height: 100%;
  width: 220px;
  border: 1px solid #ddd;
`;

export const ContentContainer = styled(Box)`
  flex-grow: 1;
  height: 100%;
  padding: 2px;
`;

export const RightBarContainer = styled(Box)`
  height: 100%;
  width: 230px;
  border: 1px solid #ddd;
`;
