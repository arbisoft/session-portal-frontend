import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Upload a video - Sessions Portal",
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
