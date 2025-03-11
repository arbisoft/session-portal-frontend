"use client";

import { useParams } from "next/navigation";

import { fallbackLanguage } from "./config";

function useLanguage() {
  const params = useParams() ?? {};

  const language = Array.isArray(params.language) ? params.language[0] : params.language;

  return language || fallbackLanguage;
}

export default useLanguage;
