import type { Metadata } from "next";
import dynamic from "next/dynamic";

const SearchResultsPage = dynamic(() => import("@/features/SearchResultsPage"));

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { search } = await searchParams;

  const title = "Sessions Portal";

  return {
    title: search ? `${search} - ${title}` : title,
  };
}

export default function Results() {
  return <SearchResultsPage />;
}
