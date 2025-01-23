import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import LoginPage from "@/features/LoginPage";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "login");

  return {
    title: t("title"),
  };
}

export default LoginPage;
