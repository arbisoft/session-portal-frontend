"use client";

import { FC, useEffect } from "react";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useRouter } from "next/navigation";

import useLanguage from "@/services/i18n/use-language";

const HomePage: FC = () => {
  const router = useRouter();
  const language = useLanguage();

  useEffect(() => {
    // const token = localStorage.getItem("access_token");
    // if (!token) {
    //   router.push(`/${language}/login/`);
    // } else {
    router.push(`/${language}/videos/`);
    // }
  }, [language, router]);

  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center">
      <Skeleton variant="rectangular" width={450} height={203} sx={{ borderRadius: "12px" }} />
    </Box>
  );
};

export default HomePage;
