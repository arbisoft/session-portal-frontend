"use client";

import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import useLanguage from "@/services/i18n/use-language";

const HomePage: FC<{ description: string }> = ({ description }) => {
  const router = useRouter();
  const language = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push(`/${language}/login/`);
    }
  }, [language, router]);

  return <Typography variant="h3">{description}</Typography>;
};

export default HomePage;
