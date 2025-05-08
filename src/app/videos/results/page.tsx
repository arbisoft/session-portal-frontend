import type { Metadata } from "next";

import SearchResultsPage from "@/features/SearchResultsPage";

type Props = {
  params: { language: string; search: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { search } = searchParams;

  const title = "Sessions Portal";

  return {
    title: search ? `${search} - ${title}` : title,
  };
}

export default function Results() {
  return <SearchResultsPage />;
}
