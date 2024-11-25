"use client";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

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
        <Box>
          <h1>Sign In Page</h1>
        </Box>
      </Box>
    </Container>
  );
}

export default SignIn;
