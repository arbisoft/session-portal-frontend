import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import Typography from "@mui/material/Typography";
type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "home");

  return {
    title: t("title"),
  };
}

export default async function Home({ params }: Props) {
  const { t } = await getServerTranslation(params.language, "home");

  return <Typography variant="h3">{t("description")}</Typography>;
}
