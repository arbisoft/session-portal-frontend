"use client";
import { useTransition } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useGoogleLogin, CredentialResponse } from "@react-oauth/google";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";

import { loginAndSetCookie } from "@/app/login/actions";
import { useNotification } from "@/components/Notification";
import ThemeToggle from "@/components/ThemeToggle";
import { REDIRECT_TO_KEY } from "@/constants/constants";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import useNavigation from "@/hooks/useNavigation";
import { loginActions } from "@/redux/login/slice";
import { isValidInternalRedirectPath } from "@/utils/utils";

import { LoginButtonContainer, LoginContainer, LoginSubContainer } from "./styled";

export default function LoginPage() {
  const theme = useTheme();
  const { navigateTo } = useNavigation();
  const { showNotification } = useNotification();
  const { isFeatureEnabled } = useFeatureFlags();
  const dispatch = useDispatch();
  const params = useSearchParams();
  const { push } = useRouter();
  const [, startTransition] = useTransition();

  // Persist redirect target from query string or fallback to window query in cases where
  // new token/redirect flow reloads page and Next hook may not yet resolve.
  const rawRedirectTo =
    params.get(REDIRECT_TO_KEY) ??
    (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get(REDIRECT_TO_KEY) : null);

  const redirectTo = isValidInternalRedirectPath(rawRedirectTo) ? rawRedirectTo : null;
  const isDarkModeVisible = isFeatureEnabled("darkModeSwitcher");

  const onSuccess = async (credentialResponse: CredentialResponse) => {
    if ("access_token" in credentialResponse) {
      try {
        // Call server action to login and set cookie
        const formData = new FormData();
        formData.append("auth_token", credentialResponse.access_token as string);
        startTransition(async () => {
          const loginData = await loginAndSetCookie(formData);

          // Update Redux state
          dispatch(loginActions.login(loginData));
          if (redirectTo) {
            push(redirectTo);
          } else {
            navigateTo("videos");
          }
        });
      } catch {
        showNotification({
          message: "Login failed. Please try again.",
          severity: "error",
        });
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
        {isDarkModeVisible && (
          <span data-testid="theme-toggle">
            <ThemeToggle />
          </span>
        )}
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
