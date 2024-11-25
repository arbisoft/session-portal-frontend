"use client";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import ThemeToggleButton from "@/components/theme-toggle-button";
import Logo from "@/components/ASPLogo";

function SignIn() {
  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Box mb={20}>
          <Logo />
        </Box>
        <Box mb={20} width={"75%"}>
          <Box mb={5}>
            <h1>Sign In Page</h1>
          </Box>
          <Box>
            <ThemeToggleButton />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default SignIn;
