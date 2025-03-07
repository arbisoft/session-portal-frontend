"use client";
import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useGoogleLogin, CredentialResponse } from "@react-oauth/google";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Image from "next/image";

import { useNotification } from "@/components/Notification";
import useAuth from "@/hooks/useAuth";
import useNavigation from "@/hooks/useNavigation";
import { useLoginMutation } from "@/redux/login/apiSlice";

import { LoginButtonContainer, LoginContainer, LoginSubContainer } from "./styled";

export default function LoginPage() {
  useAuth();

  const { navigateTo } = useNavigation();

  const theme = useTheme();
  const { dispatch } = useNotification();

  const [isLoading, setIsLoading] = useState(false);

  const [login] = useLoginMutation();

  const onSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(false);
    if ("access_token" in credentialResponse) {
      const response = await login({
        auth_token: credentialResponse.access_token as string,
      });
      const errorState = response?.error as FetchBaseQueryError;

      if (response.data) {
        navigateTo("videos");
      } else if (errorState) {
        const errorMessage = errorState.data as string[];
        if (errorMessage) {
          dispatch({
            type: "SHOW_NOTIFICATION",
            payload: {
              message: errorMessage[0],
              severity: "error",
            },
          });
        }
      }
    } else {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: "Google login failed: No credential received.",
          severity: "error",
        },
      });
      return;
    }
  };

  const onError = () => {
    dispatch({
      type: "SHOW_NOTIFICATION",
      payload: {
        message: "Authentication Error: Google login failed. Please try again.",
        severity: "error",
      },
    });
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: (response) => onSuccess(response as CredentialResponse),
    onError: onError,
  });

  return (
    <LoginContainer>
      <LoginSubContainer>
        <Image height={33} width={131} src="/assets/images/arbisoft-logo.png" alt="arbisoft-logo" />
        <LoginButtonContainer>
          <Button
            data-testid="login-button"
            disabled={isLoading}
            className="login-button"
            onClick={() => {
              setIsLoading(true);
              googleLoginHandler();
            }}
          >
            <Box className="button-content">
              <Image height={20} width={20} src="/assets/svgs/google.svg" alt="google-logo" />
              <Typography color={theme.palette.colors.gray}>{isLoading ? "Loading..." : "Sign in with Google"}</Typography>
            </Box>
          </Button>
        </LoginButtonContainer>
      </LoginSubContainer>
    </LoginContainer>
  );
}
