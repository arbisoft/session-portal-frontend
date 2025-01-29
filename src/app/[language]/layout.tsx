import "../globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { dir } from "i18next";
import "@/services/i18n/config";
import { languages } from "@/services/i18n/config";
import type { Metadata } from "next";
import SnackbarProvider from "@/components/snackbar-provider";
import { getServerTranslation } from "@/services/i18n";
import StoreLanguageProvider from "@/services/i18n/store-language-provider";
import ThemeProvider from "@/components/theme/theme-provider";
import QueryClientProvider from "@/services/react-query/query-client-provider";
import queryClient from "@/services/react-query/query-client";
import ReactQueryDevtools from "@/services/react-query/react-query-devtools";
import InitColorSchemeScript from "@/components/theme/init-color-scheme-script";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Providers } from "@/redux/store/provider";

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
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  return (
    <html lang={language} dir={dir(language)}>
      <body>
        <InitColorSchemeScript />
        <GoogleOAuthProvider clientId={clientId ? clientId : ""}>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <ThemeProvider>
              <SnackbarProvider maxSnack={3}>
                <StoreLanguageProvider>
                  <Providers>{children}</Providers>
                </StoreLanguageProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
