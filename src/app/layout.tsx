import CssBaseline from "@mui/material/CssBaseline";
import { GoogleTagManager } from "@next/third-parties/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";
import Script from "next/script";

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
        <Script
          id="hotjar-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:6412285,hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
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
