import type { Metadata } from "next";
import dynamic from "next/dynamic";

const HomePage = dynamic(() => import("@/features/HomePage"));

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sessions Portal",
  };
}

export default function Home() {
  return <HomePage />;
}
