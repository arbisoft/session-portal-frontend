"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    children
  );
}

export default GoogleAuthProvider;
