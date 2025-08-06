import type { Metadata } from "next";

import HomePage from "@/features/HomePage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sessions Portal",
  };
}

export default function Home() {
  return <HomePage />;
}
