import Box from "@mui/material/Box";
import { styled, css } from "@mui/material/styles";

export const LoginContainer = styled(Box, {
  name: "LoginContainer",
})(
  () => css`
    align-items: center;
    align-self: center;
    display: flex;
    height: 100vh;
    justify-content: center;
  `
);

export const LoginSubContainer = styled(Box, {
  name: "LoginSubContainer",
})(
  ({ theme }) => css`
    align-items: center;
    background-color: ${theme.palette.common.white};
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 50px;
    width: 450px;
  `
);

export const LoginButtonContainer = styled(Box, {
  name: "LoginButtonContainer",
})(
  () => css`
    border-radius: 6px;
    width: 100%;

    .login-button {
      padding: 0;
      text-transform: unset;
      width: 100%;
    }

    .button-content {
      align-items: center;
      display: flex;
      gap: 8px;
      justify-content: center;
      padding: 10px 30px;
      width: 100%;
    }
  `
);
