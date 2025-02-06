import Box from "@mui/material/Box";
import { styled, css } from "@mui/material/styles";

export const LoginContainer = styled(Box, {
  name: "LoginContainer",
})(
  () => css`
    align-self: center;
    height: 100vh;
    align-items: center;
    display: flex;
    justify-content: center;
  `
);

export const LoginSubContainer = styled(Box, {
  name: "LoginSubContainer",
})(
  ({ theme }) => css`
    width: 450px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50px;
    gap: 30px;
    border: 1px solid black;
    border-radius: 12px;
    background-color: ${theme.palette.colors.white};
  `
);

export const LoginButtonContainer = styled(Box, {
  name: "LoginButtonContainer",
})(
  ({ theme }) => css`
    width: 100%;
    border: 1px solid ${theme.palette.colors.gray};
    border-radius: 6px;

    .login-button {
      padding: 0;
      width: 100%;
    }

    .button-content {
      display: flex;
      gap: 8px;
      padding: 10px 30px;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  `
);
