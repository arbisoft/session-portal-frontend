import type { Metadata } from "next";

import VideosListingPage from "@/features/VideosListingPage";

type Props = {
  params: { language: string; search: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { playlist, tag } = await searchParams;

  const terms = playlist || tag;

  const title = "Sessions Portal";

  return {
    title: terms ? `${terms} - ${title}` : title,
  };
}

export default function Videos() {
  return <VideosListingPage />;
}
