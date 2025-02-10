import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
// eslint-disable-next-line no-restricted-imports
import Link from "next/link";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "common");

  return {
    title: t("videos"),
  };
}

export default function Videos() {
  return (
    <MainLayoutContainer>
      <Typography variant="h3" color="primary" width="100%">
        Videos
      </Typography>
      <Link href="/videos/asdf">Video Detail</Link>
    </MainLayoutContainer>
  );
}
