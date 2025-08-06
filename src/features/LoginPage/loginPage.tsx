"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import { useGoogleLogin, CredentialResponse } from "@react-oauth/google";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Image from "next/image";

import { useNotification } from "@/components/Notification";
import ThemeToggle from "@/components/ThemeToggle";
import useAuth from "@/hooks/useAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import useNavigation from "@/hooks/useNavigation";
import { useLoginMutation } from "@/redux/login/apiSlice";

import { LoginButtonContainer, LoginContainer, LoginSubContainer } from "./styled";

export default function LoginPage() {
  useAuth();
  const theme = useTheme();

  const { navigateTo } = useNavigation();
  const { showNotification } = useNotification();
  const { isFeatureEnabled } = useFeatureFlags();

  const isDarkModeVisible = isFeatureEnabled("darkModeSwitcher");

  const [login] = useLoginMutation();

  const onSuccess = async (credentialResponse: CredentialResponse) => {
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
          showNotification({
            message: errorMessage[0],
            severity: "error",
          });
        }
      }
    } else {
      showNotification({
        message: "Google login failed: No credential received.",
        severity: "error",
      });
      return;
    }
  };

  const onError = () => {
    showNotification({
      message: "Authentication Error: Google login failed. Please try again.",
      severity: "error",
    });
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: (response) => onSuccess(response as CredentialResponse),
    onError: onError,
  });

  return (
    <LoginContainer>
      <Box position="fixed" top={8} right={8}>
        {isDarkModeVisible && <ThemeToggle />}
      </Box>
      <LoginSubContainer>
        <Image height={33} width={131} src="/assets/images/arbisoft-logo.png" alt="arbisoft-logo" />
        <Typography variant="h4" color={theme.palette.text.secondary}>
          Sessions Portal
        </Typography>
        <LoginButtonContainer>
          <Button data-testid="login-button" className="login-button" onClick={() => googleLoginHandler()} variant="outlined">
            <Box className="button-content">
              <Image height={20} width={20} src="/assets/svgs/google.svg" alt="google-logo" />
              <Typography color="textSecondary">Sign in with Google</Typography>
            </Box>
          </Button>
        </LoginButtonContainer>
      </LoginSubContainer>
    </LoginContainer>
  );
}
