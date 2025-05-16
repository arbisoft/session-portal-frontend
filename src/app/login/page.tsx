import type { Metadata } from "next";

import LoginPage from "@/features/LoginPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sessions Portal",
  };
}

export default LoginPage;
