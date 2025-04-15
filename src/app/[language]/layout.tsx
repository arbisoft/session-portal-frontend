import "@/app/globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import CssBaseline from "@mui/material/CssBaseline";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { dir } from "i18next";
import type { Metadata } from "next";

import { NotificationProvider } from "@/components/Notification";
import InitColorSchemeScript from "@/components/theme/init-color-scheme-script";
import ThemeProvider from "@/components/theme/theme-provider";
import { Providers } from "@/redux/store/provider";
import { getServerTranslation } from "@/services/i18n";
import { languages } from "@/services/i18n/config";
import StoreLanguageProvider from "@/services/i18n/store-language-provider";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "common");

  return {
    title: t("title"),
  };
}

export function generateStaticParams() {
  return languages.map((language) => ({ language }));
}

export default function RootLayout({
  children,
  params: { language },
}: {
  children: React.ReactNode;
  params: { language: string };
}) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";

  return (
    <html lang={language} dir={dir(language)}>
      <body>
        <CssBaseline />
        <InitColorSchemeScript />
        <GoogleOAuthProvider clientId={clientId}>
          <Providers>
            <ThemeProvider>
              <NotificationProvider>
                <StoreLanguageProvider>{children}</StoreLanguageProvider>
              </NotificationProvider>
            </ThemeProvider>
          </Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
