"use client";
import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useGoogleLogin, CredentialResponse } from "@react-oauth/google";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Image from "next/image";
import { useRouter } from "next/navigation";

import AlertModal from "@/components/AlertModal";
import useAuth from "@/hooks/useAuth";
import { useLoginMutation } from "@/redux/login/apiSlice";
import useLanguage from "@/services/i18n/use-language";

import { LoginButtonContainer, LoginContainer, LoginSubContainer } from "./styled";

export default function LoginPage() {
  useAuth();

  const router = useRouter();
  const language = useLanguage();
  const theme = useTheme();

  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(false);

  const [login] = useLoginMutation();

  const onSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLogin(false);
    if ("access_token" in credentialResponse) {
      const response = await login({
        auth_token: credentialResponse.access_token as string,
      });
      const errorState = response?.error as FetchBaseQueryError;

      if (response.data) {
        router.replace(`/${language}/videos`);
      } else if (errorState) {
        const errorMessage = errorState.data as string[];
        setError(errorMessage[0]);
      }
    } else {
      setError("Google login failed: No credential received.");
      return;
    }
  };

  const onError = () => {
    setIsLogin(false);
    setError("Authentication Error: Google login failed. Please try again.");
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
            disabled={isLogin}
            className="login-button"
            onClick={() => {
              setIsLogin(true);
              googleLoginHandler();
            }}
          >
            <Box className="button-content">
              <Image height={20} width={20} src="/assets/svgs/google.svg" alt="google-logo" />
              <Typography color={theme.palette.colors.gray}>Sign in with Google</Typography>
            </Box>
          </Button>
        </LoginButtonContainer>
      </LoginSubContainer>
      {error && <AlertModal handleCloseAlertModal={() => setError(null)} errorMessage={error} />}
    </LoginContainer>
  );
}
