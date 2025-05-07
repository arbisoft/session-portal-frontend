import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";

import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "upload-video");

  return {
    title: t("title"),
  };
}

export default function UploadVideo() {
  return (
    <Box width="100vw" height="100vh" display="flex" alignItems="center" justifyContent="center">
      <Typography variant="h1" color="textSecondary">
        UNDER CONSTRUCTION
      </Typography>
    </Box>
  );
}
