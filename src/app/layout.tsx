import CssBaseline from "@mui/material/CssBaseline";
import { GoogleTagManager } from "@next/third-parties/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";

import { NotificationProvider } from "@/components/Notification";
import InitColorSchemeScript from "@/components/theme/init-color-scheme-script";
import ThemeProvider from "@/components/theme/theme-provider";
import { DEFAULT_LANGUAGE, DEFAULT_LANGUAGE_DIR } from "@/constants/constants";
import { Providers } from "@/redux/store/provider";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sessions Portal",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode; params: { language: string } }) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? "";
  return (
    <html lang={DEFAULT_LANGUAGE} dir={DEFAULT_LANGUAGE_DIR}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Arbisoft Session Portal" />
        <GoogleTagManager gtmId={gtmId} />
      </head>
      <body>
        <GoogleOAuthProvider clientId={clientId}>
          <Providers>
            <ThemeProvider>
              <InitColorSchemeScript />
              <CssBaseline />
              <NotificationProvider>{children}</NotificationProvider>
            </ThemeProvider>
          </Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
