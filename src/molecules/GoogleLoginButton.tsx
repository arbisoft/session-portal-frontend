import React, { FC } from "react";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log(googleClientId)

export const GoogleLoginButton: FC = () => <>
    <GoogleOAuthProvider clientId={googleClientId}>
        <GoogleLogin
            onSuccess={credentialResponse => {
                console.log(credentialResponse);
            }}
            onError={() => {
                console.log('Login Failed');
            }}
        />
    </GoogleOAuthProvider>
</>;
