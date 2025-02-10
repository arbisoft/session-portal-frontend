"use client";

import { FC, ReactNode, useEffect } from "react";

import { useRouter } from "next/navigation";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import useLanguage from "@/services/i18n/use-language";

const HomePage: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const language = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push(`/${language}/login/`);
    }
  }, [language, router]);

  return <MainLayoutContainer>{children}</MainLayoutContainer>;
};

export default HomePage;
